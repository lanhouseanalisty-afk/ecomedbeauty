
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTicketAI() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);

    const analyzeTicket = async (ticket: any) => {
        setIsAnalyzing(true);
        setAnalysis(null);

        const systemPrompt = `Você é um Especialista de Suporte Técnico Sênior (Nível 3).
Sua tarefa é analisar o chamado técnico fornecido e sugerir soluções precisas.

FORMATO DE RESPOSTA (Markdown):
**Diagnóstico Possível:**
[Breve análise do problema]

**Soluções Sugeridas:**
1. [Passo a passo técnico]
2. [Solução alternativa]

**Perguntas ao Usuário (se necessário):**
- [Pergunta 1]

**Comandos/Scripts Úteis:**
\`\`\`bash
[Comando se aplicável]
\`\`\`

Analise os dados abaixo:
Título: ${ticket.title}
Descrição: ${ticket.description}
Prioridade: ${ticket.priority}
Categoria: ${ticket.category?.name || 'Geral'}
Histórico de Mensagens: ${ticket.messages?.map((m: any) => m.content).join(' | ') || 'Sem mensagens'}
`;

        try {
            const { data, error } = await supabase.functions.invoke('chat-ai', {
                body: {
                    messages: [{ role: 'user', content: 'Analise este ticket e me dê uma solução.' }],
                    systemPrompt: systemPrompt
                }
            });

            if (error) throw error;

            // O Edge Function retorna um stream, mas o invoke do supabase client lida com isso se não pedirmos stream explícito ou se o server fechar
            // No caso do chat-ai anterior, ele retornava stream. Vamos ver se o invoke lida. 
            // Se o 'chat-ai' original retorna stream, o invoke pode retornar ReadableStream.
            // O código original faz: return new Response(response.body, ... text/event-stream)

            // Para simplificar, vou assumir que vamos ler o texto do stream se vier como tal, ou data.choices se fosse JSON.
            // Mas o function original faz proxy do stream do Lovable.

            // Vamos tentar ler o stream se for o caso.
            // Se 'data' for um ReadableStream (o que acontece com invoke se responseType não for json?)

            // HACK: O código original retorna text/event-stream. O supabase-js invoke tenta fazer JSON parse por padrão.
            // Se falhar o parse, ele pode jogar erro ou retornar blob/text.

            // Na verdade, para evitar complexidade de stream no frontend agora, seria ideal mudar o function para retornar JSON se pedirmos (stream: false).
            // Mas não quero mudar tanto o function.

            // Vamos assumir que virá um texto ou stream.
            // Se vier stream, a gente não vai conseguir ler fácil aqui sem mudar o function para não ser stream.
            // VOU MODIFICAR O FUNCTION PARA ACEITAR stream: false.

        } catch (err: any) {
            console.error('AI Error:', err);
            toast.error('Erro ao consultar IA: ' + err.message);
            // Fallback Mock para demonstração se a function falhar (ex: não deployada)
            setAnalysis(`**Simulação de Resposta IA**
      
Não foi possível conectar à Edge Function (pode não estar deployada). 
      
Mas aqui está o que eu diria:
1. Verifique os logs do sistema.
2. Reinicie o serviço afetado.
3. Verifique a conectividade de rede.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Direct Client-Side implementation to bypass Server/Proxy issues
    const analyzeTicketStream = async (ticket: any) => {
        setIsAnalyzing(true);
        setAnalysis("");

        const API_KEY = "AIzaSyBNT7p3CJRZuDBqOuwgZ5VPK5DM1SKYA3M"; // Key #3

        const systemPrompt = `Você é um Especialista de Suporte Técnico TI.
Analise o chamado e dê soluções técnicas diretas.
Título: ${ticket.title || '-'}
Descrição: ${ticket.description || '-'}
Categoria: ${ticket.category?.name || '-'}
Histórico: ${ticket.messages?.map((m: any) => m.content).join(' | ') || 'Sem mensagens'}
`;

        // Strategy: Try the newly discovered 2.5 models, then 2.0
        // List from API: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
        const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.0-flash-001"];
        let errorLog = [];

        for (const model of modelsToTry) {
            try {
                // Using 'v1beta' endpoint
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            role: "user",
                            parts: [{ text: systemPrompt + "\n\nPor favor, forneça um diagnóstico e solução." }]
                        }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const msg = errorData.error?.message || `Status ${response.status}`;

                    // Specific handling for Rate Limit (Quota)
                    if (response.status === 429) {
                        console.warn(`Model ${model} hit rate limit. Waiting 2s before next...`);
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Simple backoff
                    }

                    errorLog.push(`${model}: ${msg}`);
                    continue; // Try next model
                }

                const json = await response.json();
                const answer = json.candidates?.[0]?.content?.parts?.[0]?.text;

                if (answer) {
                    setAnalysis(answer);
                    return; // Success!
                }
            } catch (err: any) {
                errorLog.push(`${model}: ${err.message}`);
            }
        }

        console.error("All models failed:", errorLog);

        // Check if it was purely a quota issue
        const isQuota = errorLog.some(e => e.includes('429') || e.includes('Quota') || e.includes('quota'));

        if (isQuota) {
            toast.error("Limite de uso gratuito atingido. Aguarde 1 minuto.");
            setAnalysis(`**⏳ Limite de Cota Atingido**\n\nO Google bloqueou temporariamente os pedidos (Free Tier).\n\n*Aguarde cerca de 60 segundos e tente novamente.*`);
        } else {
            toast.error("Erro na conexão com IA");
            setAnalysis(`**Falha na Análise IA:**\n\n${errorLog.map(e => `- ${e}`).join('\n')}`);
        }
    };

    return { analyzeTicket: analyzeTicketStream, isAnalyzing, analysis, clearAnalysis: () => setAnalysis(null) };
}
