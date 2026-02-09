
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewRequestPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_sector: '',
        priority: 'medium',
        source_sector: 'marketing' // Mock: In real app, get from user profile
    });

    const sectors = [
        { value: 'rh', label: 'Recursos Humanos' },
        { value: 'tech', label: 'Tech & Digital' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'comercial', label: 'Comercial' },
        { value: 'logistica', label: 'Logística' },
        { value: 'juridico', label: 'Jurídico' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'admin', label: 'Administração/Diretoria' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Determine SLA based on priority (Business Logic)
            let slaHours = 48; // Default Medium
            if (formData.priority === 'urgent') slaHours = 4;
            else if (formData.priority === 'high') slaHours = 24;
            else if (formData.priority === 'low') slaHours = 72;

            const { error } = await supabase
                .from('sector_requests')
                .insert({
                    ...formData,
                    sla_hours: slaHours,
                    status: 'pending',
                    created_by: (await supabase.auth.getUser()).data.user?.id
                });

            if (error) throw error;

            toast({
                title: "Solicitação enviada!",
                description: `SLA estimado: ${slaHours} horas.`,
            });
            navigate('/crm/solicitacoes');
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Erro ao criar",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl animate-in fade-in">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Nova Solicitação Intersetorial</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Título da Solicitação</Label>
                            <Input
                                required
                                placeholder="Ex: Acesso ao Sistema SAP"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Setor de Destino</Label>
                                <Select
                                    required
                                    onValueChange={v => setFormData({ ...formData, target_sector: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectors.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Prioridade</Label>
                                <Select
                                    defaultValue="medium"
                                    onValueChange={v => setFormData({ ...formData, priority: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Baixa</SelectItem>
                                        <SelectItem value="medium">Média (48h)</SelectItem>
                                        <SelectItem value="high">Alta (24h)</SelectItem>
                                        <SelectItem value="urgent">Urgente (4h)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição Detalhada</Label>
                            <Textarea
                                required
                                placeholder="Descreva o que você precisa..."
                                className="h-32"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-rose-gold text-white" disabled={loading}>
                            {loading ? 'Enviando...' : (
                                <>
                                    <Save className="w-4 h-4 mr-2" /> Enviar Solicitação
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
