import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é a assistente virtual da MedBeauty.
Responda de forma profissional e concisa.`;

// List of models to try in order of preference
const MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-pro"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt: customPrompt } = await req.json();
    const API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    // Prepare contents for Gemini
    const contents = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    const finalSystemPrompt = customPrompt || systemPrompt;

    // Add system prompt
    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `[SYSTEM INSTRUCTIONS]: ${finalSystemPrompt}\n\n[USER MESSAGE]: ${contents[0].parts[0].text}`;
    } else {
      contents.unshift({ role: 'user', parts: [{ text: `[SYSTEM INSTRUCTIONS]: ${finalSystemPrompt}` }] });
    }

    let lastError = null;
    let lastStatus = 500;

    // Cascading Fallback Loop
    for (const model of MODELS) {
      console.log(`Attempting model: ${model}...`);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          }),
        });

        if (response.ok) {
          console.log(`Success with model: ${model}`);
          const data = await response.json();
          const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

          // Return OpenAI-compatible format
          const completion = {
            id: "chatcmpl-" + Date.now(),
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: model,
            choices: [{
              index: 0,
              message: { role: "assistant", content: geminiText },
              finish_reason: "stop"
            }]
          };

          return new Response(JSON.stringify(completion), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } else {
          // If error, log and try next model
          const errorText = await response.text();
          console.error(`Model ${model} failed: ${response.status} - ${errorText}`);
          lastStatus = response.status;
          lastError = errorText;

          // If 429 (Rate Limit), wait a bit before trying next model (maybe different quota bucket?)
          if (response.status === 429) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      } catch (err) {
        console.error(`Error reaching model ${model}:`, err);
        lastError = err.message;
      }
    }

    // If all failed
    return new Response(JSON.stringify({
      error: `Todas as tentativas de IA falharam. Último erro (${lastStatus}): ${lastError}`
    }), {
      status: lastStatus,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
