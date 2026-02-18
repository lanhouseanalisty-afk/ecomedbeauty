
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
**Diagnóstico Possível:** [Breve análise]
**Soluções Sugeridas:** [Passo a passo]
**Perguntas ao Usuário:** [Se necessário]

DADOS:
Título: ${ticket.title}
Descrição: ${ticket.description}
Histórico: ${ticket.messages?.map((m: any) => m.content).join(' | ') || 'Sem mensagens'}`;

        try {
            const { data, error } = await supabase.functions.invoke('chat-ai', {
                body: {
                    messages: [{ role: 'user', content: 'Analise este ticket e me dê uma solução.' }],
                    systemPrompt: systemPrompt
                }
            });

            if (error) throw error;

            const aiContent = data.choices?.[0]?.message?.content || data.reply || "";
            if (aiContent) {
                setAnalysis(aiContent);
            } else {
                throw new Error("Resposta da IA vazia");
            }

        } catch (err: any) {
            console.error('AI Error:', err);
            toast.error('Erro ao consultar IA: ' + err.message);
            setAnalysis(`**Falha na Análise IA**\n\nNão foi possível obter uma resposta da IA. Verifique se a cota do Gemini não foi atingida ou se a chave de API está configurada corretamente nas Edge Functions.`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return { analyzeTicket, isAnalyzing, analysis, clearAnalysis: () => setAnalysis(null) };
}
