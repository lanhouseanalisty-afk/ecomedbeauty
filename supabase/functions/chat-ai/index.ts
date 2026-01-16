import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é a assistente virtual da MedBeauty, especializada em produtos de estética profissional.

SOBRE A MEDBEAUTY:
- Empresa brasileira líder em produtos para estética avançada
- Produtos aprovados pela ANVISA
- Atendemos profissionais de saúde e estética em todo o Brasil

PRODUTOS PRINCIPAIS:
1. i-THREAD (R$ 890): Fios de PDO para lifting facial não cirúrgico e bioestimulação de colágeno. Mais vendido!
2. e.p.t.q (R$ 650): Preenchedor de ácido hialurônico premium para harmonização facial
3. Idebenone Ampoule (R$ 420): Tratamento antioxidante em ampolas - em promoção!
4. Nano Cânula (R$ 180): Cânulas de alta precisão para procedimentos minimamente invasivos
5. Ultra Lift PDO (R$ 1.290): Fios tensores premium - edição limitada
6. Hydra Boost Serum (R$ 280): Sérum de hidratação profunda - bestseller
7. Volume Plus HA (R$ 890): Preenchedor volumizador de alta densidade

POLÍTICAS:
- Frete grátis para compras acima de R$ 500
- Parcelamento em até 12x sem juros
- Garantia de 30 dias
- Cupons disponíveis: PRIMEIRA10 (10% off), FRETE50 (R$50 off no frete), MEDBEAUTY20 (20% off acima de R$1000)

INSTRUÇÕES:
- Seja simpática, profissional e prestativa
- Responda sempre em português brasileiro
- Recomende produtos adequados às necessidades do cliente
- Mencione promoções e cupons quando relevante
- Para dúvidas técnicas complexas, sugira contato com nossa equipe especializada
- Mantenha respostas concisas (máximo 3 parágrafos)`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao processar sua mensagem." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
