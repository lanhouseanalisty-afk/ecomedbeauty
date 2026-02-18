import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Shield,
    Scale,
    AlertTriangle,
    BookOpen,
    Users,
    Lock,
    FileText,
    MessageSquare,
    Send,
    Bot
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, Trans } from 'react-i18next';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsEvent } from '@/lib/analytics';

export default function CompliancePage() {
    const { t } = useTranslation();
    const { track } = useAnalytics();
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
    const [loading, setLoading] = useState(false);

    const handleAskQuestion = async () => {
        if (!question.trim()) {
            toast.error(t('compliance.assistant.emptyError'));
            return;
        }

        setLoading(true);
        const userQuestion = question;
        setQuestion('');

        track(AnalyticsEvent.COMPLIANCE_QUERY, {
            query: userQuestion
        });

        // Add user question to chat
        setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);

        try {
            const { data, error } = await supabase.functions.invoke('chat-ai', {
                body: {
                    messages: [{ role: 'user', content: userQuestion }],
                    systemPrompt: "Você é o Assistente Especialista em Compliance e Ética da MedBeauty. Sua função é responder dúvidas sobre o Código de Conduta, Canal de Denúncias, LGPD e Políticas Anticorrupção da empresa de forma clara, profissional e segura. Se não souber algo, recomende o contato direto com o DPO (lgpd@medbeauty.com) ou com o departamento Jurídico."
                }
            });

            if (error) throw error;

            responseText = data.choices?.[0]?.message?.content || data.reply || "";

            if (!responseText) {
                // Fallback to legacy logic if AI response is empty
                responseText = generateComplianceResponse(userQuestion);
            }

            if (!responseText) {
                console.error("Erro em todos os modelos:", errorLog);
                // Fallback to legacy logic if AI fails
                responseText = generateComplianceResponse(userQuestion);
            }

            setChatHistory(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error: any) {
            console.error('Erro na IA:', error);
            toast.error("Erro ao processar resposta. Tente novamente em instantes.");
            // Fallback
            const fallbackResponse = generateComplianceResponse(userQuestion);
            setChatHistory(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
        } finally {
            setLoading(false);
        }
    };

    const generateComplianceResponse = (question: string): string => {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('denúncia') || lowerQuestion.includes('denuncia') || lowerQuestion.includes('canal') || lowerQuestion.includes('report') || lowerQuestion.includes('channel')) {
            return t('compliance.whistleblowerChannel.description') + '. ' + t('compliance.whistleblowerChannel.intro');
        }

        if (lowerQuestion.includes('código') || lowerQuestion.includes('conduta') || lowerQuestion.includes('code') || lowerQuestion.includes('conduct')) {
            return t('compliance.codeOfConduct.description');
        }

        if (lowerQuestion.includes('corrupção') || lowerQuestion.includes('suborno') || lowerQuestion.includes('anticorrupção') || lowerQuestion.includes('corruption') || lowerQuestion.includes('bribery')) {
            return t('compliance.antiCorruption.description');
        }

        if (lowerQuestion.includes('lgpd') || lowerQuestion.includes('dados') || lowerQuestion.includes('privacidade') || lowerQuestion.includes('data') || lowerQuestion.includes('privacy')) {
            return t('compliance.lgpd.description');
        }

        return t('compliance.assistant.description');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-gold/10 rounded-lg">
                    <Shield className="w-8 h-8 text-rose-gold" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-rose-gold-dark">
                        {t('compliance.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('compliance.subtitle')}
                    </p>
                </div>
            </div>

            {/* Introduction */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="w-5 h-5 text-rose-gold" />
                        {t('compliance.mission.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                        <Trans i18nKey="compliance.mission.description">
                            A área de Compliance existe para assegurar que todas as atividades sejam conduzidas com
                            <strong className="text-foreground"> ética, transparência e responsabilidade</strong>.
                            Nosso compromisso é garantir conformidade com leis, normas, políticas internas e padrões
                            internacionais, promovendo um ambiente seguro, íntegro e alinhado aos valores da organização.
                        </Trans>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-blue-900 dark:text-blue-100">{t('compliance.mission.cards.preventRisks.title')}</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">{t('compliance.mission.cards.preventRisks.desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <Users className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-green-900 dark:text-green-100">{t('compliance.mission.cards.ethicalCulture.title')}</p>
                                <p className="text-sm text-green-700 dark:text-green-300">{t('compliance.mission.cards.ethicalCulture.desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-purple-900 dark:text-purple-100">{t('compliance.mission.cards.responsibleDecisions.title')}</p>
                                <p className="text-sm text-purple-700 dark:text-purple-300">{t('compliance.mission.cards.responsibleDecisions.desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <FileText className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-orange-900 dark:text-orange-100">{t('compliance.mission.cards.totalCompliance.title')}</p>
                                <p className="text-sm text-orange-700 dark:text-orange-300">{t('compliance.mission.cards.totalCompliance.desc')}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Princípios Fundamentais */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-rose-gold" />
                        {t('compliance.principles.title')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { title: t('compliance.principles.integrity.title'), desc: t('compliance.principles.integrity.desc') },
                            { title: t('compliance.principles.transparency.title'), desc: t('compliance.principles.transparency.desc') },
                            { title: t('compliance.principles.responsibility.title'), desc: t('compliance.principles.responsibility.desc') },
                            { title: t('compliance.principles.equity.title'), desc: t('compliance.principles.equity.desc') },
                            { title: t('compliance.principles.compliance.title'), desc: t('compliance.principles.compliance.desc') },
                            { title: t('compliance.principles.lgpd.title'), desc: t('compliance.principles.lgpd.desc') }
                        ].map((principle, index) => (
                            <div key={index} className="p-4 border rounded-lg hover:border-rose-gold transition-colors">
                                <h3 className="font-semibold text-rose-gold-dark mb-1">{principle.title}</h3>
                                <p className="text-sm text-muted-foreground">{principle.desc}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Código de Conduta */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-rose-gold" />
                        {t('compliance.codeOfConduct.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('compliance.codeOfConduct.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {(t('compliance.codeOfConduct.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-gold rounded-full mt-2 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Canal de Denúncia */}
            <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                        <AlertTriangle className="w-5 h-5" />
                        {t('compliance.whistleblowerChannel.title')}
                    </CardTitle>
                    <CardDescription className="text-orange-700 dark:text-orange-300">
                        {t('compliance.whistleblowerChannel.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-orange-900 dark:text-orange-100">
                        {t('compliance.whistleblowerChannel.intro')}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {(t('compliance.whistleblowerChannel.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-gray-900 rounded-lg text-center border border-orange-200 dark:border-orange-800">
                                <p className="font-medium text-sm">{item}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-sm text-orange-700 dark:text-orange-300 italic">
                        {t('compliance.whistleblowerChannel.footer')}
                    </p>
                </CardContent>
            </Card>

            {/* Política Anticorrupção */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-rose-gold" />
                        {t('compliance.antiCorruption.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('compliance.antiCorruption.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {(t('compliance.antiCorruption.items', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* LGPD */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-rose-gold" />
                        {t('compliance.lgpd.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('compliance.lgpd.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <Lock className="w-6 h-6 text-blue-600 mb-2" />
                            <h4 className="font-semibold mb-1">{t('compliance.lgpd.secureStorage.title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('compliance.lgpd.secureStorage.desc')}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <FileText className="w-6 h-6 text-green-600 mb-2" />
                            <h4 className="font-semibold mb-1">{t('compliance.lgpd.transparency.title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('compliance.lgpd.transparency.desc')}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <Shield className="w-6 h-6 text-purple-600 mb-2" />
                            <h4 className="font-semibold mb-1">{t('compliance.lgpd.strictControls.title')}</h4>
                            <p className="text-sm text-muted-foreground">{t('compliance.lgpd.strictControls.desc')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="border-rose-gold/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-rose-gold" />
                        {t('compliance.assistant.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('compliance.assistant.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Chat History */}
                    {chatHistory.length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            {chatHistory.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 bg-rose-gold/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-rose-gold" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                                            ? 'bg-rose-gold text-white'
                                            : 'bg-white dark:bg-gray-800 border'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageSquare className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="flex gap-2">
                        <Textarea
                            placeholder={t('compliance.assistant.placeholder')}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAskQuestion();
                                }
                            }}
                            className="flex-1"
                            rows={3}
                        />
                        <Button
                            onClick={handleAskQuestion}
                            disabled={loading || !question.trim()}
                            className="bg-rose-gold hover:bg-rose-gold-dark text-white"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Suggested Questions */}
                    <div className="flex flex-wrap gap-2">
                        <p className="text-sm text-muted-foreground w-full">{t('compliance.assistant.suggestedTitle')}</p>
                        {(t('compliance.assistant.suggestions', { returnObjects: true }) as string[]).map((suggested, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => setQuestion(suggested)}
                                className="text-xs"
                            >
                                {suggested}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Conclusão */}
            <Card className="bg-gradient-to-r from-rose-gold/10 to-rose-gold-dark/10 border-rose-gold/30">
                <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                        <Shield className="w-12 h-12 text-rose-gold mx-auto" />
                        <h3 className="text-xl font-serif font-bold text-rose-gold-dark">
                            {t('compliance.footer.title')}
                        </h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t('compliance.footer.description')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
