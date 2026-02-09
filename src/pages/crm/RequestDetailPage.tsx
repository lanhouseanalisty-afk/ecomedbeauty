
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Clock, Send, User, MessageSquare } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
}

interface RequestDetail {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    priority: string;
    source_sector: string;
    target_sector: string;
    created_at: string;
    due_at: string;
    sla_hours: number;
}

export default function RequestDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { roles } = useAuth();
    const [request, setRequest] = useState<RequestDetail | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const canEdit = roles.some(r => r.includes('manager') || r === 'admin');

    useEffect(() => {
        if (id) fetchRequestData();
    }, [id]);

    const fetchRequestData = async () => {
        setLoading(true);
        // Fetch Request
        const { data: reqData, error: reqError } = await supabase
            .from('sector_requests')
            .select('*')
            .eq('id', id)
            .single();

        if (reqError) {
            console.error(reqError);
            toast({ title: 'Erro ao carregar', variant: 'destructive' });
            return;
        }

        setRequest(reqData);

        // Fetch Comments
        const { data: commData, error: commError } = await supabase
            .from('request_comments')
            .select('*')
            .eq('request_id', id)
            .order('created_at', { ascending: true });

        if (commError) console.error(commError);
        else setComments(commData || []);

        setLoading(false);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!request || !canEdit) return;

        const { error } = await supabase
            .from('sector_requests')
            .update({ status: newStatus })
            .eq('id', request.id);

        if (error) {
            toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
        } else {
            toast({ title: 'Status atualizado!' });
            fetchRequestData();
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !request) return;

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { error } = await supabase
                .from('request_comments')
                .insert({
                    request_id: request.id,
                    content: newComment,
                    user_id: user.id
                });

            if (error) throw error;

            setNewComment('');
            fetchRequestData();
        } catch (e: any) {
            console.error(e);
            toast({ title: 'Erro ao enviar comentário', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-8 text-center">Carregando detalhes...</div>;
    if (!request) return <div className="p-8 text-center">Solicitação não encontrada.</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl animate-in fade-in">
            <Button variant="ghost" onClick={() => navigate('/crm/controle-processos')} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getStatusColor(request.status)} variant="outline">
                                            {request.status.toUpperCase().replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs">
                                            {request.source_sector} → {request.target_sector}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-xl">{request.title}</CardTitle>
                                </div>
                                <div className="text-right text-xs text-muted-foreground">
                                    <div className="flex items-center justify-end gap-1">
                                        <Clock className="w-3 h-3" />
                                        Criado em: {new Date(request.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-rose-600 font-medium mt-1">
                                        Prazo: {new Date(request.due_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold text-sm mb-2 text-gray-700">Descrição</h4>
                            <div className="bg-slate-50 p-4 rounded-lg text-sm whitespace-pre-wrap border">
                                {request.description}
                            </div>
                        </CardContent>
                        {canEdit && (
                            <CardFooter className="flex justify-end gap-2 border-t bg-slate-50/50 p-4">
                                <span className="text-xs text-muted-foreground mr-auto self-center">
                                    Alterar Status:
                                </span>
                                {request.status !== 'in_progress' && (
                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange('in_progress')}>
                                        Em Andamento
                                    </Button>
                                )}
                                {request.status !== 'completed' && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusChange('completed')}>
                                        Concluir
                                    </Button>
                                )}
                            </CardFooter>
                        )}
                    </Card>

                    {/* Comments Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" /> Histórico & Comentários
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {comments.length === 0 ? (
                                    <p className="text-center text-sm text-muted-foreground py-4">Nenhum comentário ainda.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="bg-slate-100 p-2 rounded-full h-fit">
                                                <User className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <div className="flex-1 bg-white border p-3 rounded-lg rounded-tl-none shadow-sm">
                                                <p className="text-xs text-muted-foreground mb-1">
                                                    {new Date(c.created_at).toLocaleString()}
                                                </p>
                                                <p className="text-sm">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Separator />

                            <div className="flex gap-2 mt-4">
                                <Textarea
                                    placeholder="Escreva uma atualização ou pergunta..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <Button className="h-auto self-end" onClick={handleSendComment}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Info/Meta (Placeholder for future actions/info) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Detalhes SLA</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Prioridade:</span>
                                <span className="font-medium capitalize">{request.priority}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Horas SLA:</span>
                                <span className="font-medium">{request.sla_hours}h</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transfer Section - Managers Only */}
                    {canEdit && (
                        <Card className="border-blue-100 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4 rotate-180" /> Encaminhar/Transferir
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Transfira esta solicitação para outro setor caso necessário.
                                </p>
                                <div className="space-y-2">
                                    <Select
                                        onValueChange={async (val) => {
                                            if (!val) return;
                                            const { error } = await supabase
                                                .from('sector_requests')
                                                .update({ target_sector: val })
                                                .eq('id', request.id);

                                            if (error) {
                                                toast({ title: "Erro ao transferir", variant: "destructive" });
                                            } else {
                                                toast({ title: "Solicitação transferida!", description: `Agora está com: ${val}` });
                                                fetchRequestData();
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Selecione novo setor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="rh">Recursos Humanos</SelectItem>
                                            <SelectItem value="tech">Tech & Digital</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="comercial">Comercial</SelectItem>
                                            <SelectItem value="logistica">Logística</SelectItem>
                                            <SelectItem value="juridico">Jurídico</SelectItem>
                                            <SelectItem value="ecommerce">E-commerce</SelectItem>
                                            <SelectItem value="admin">Administração</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
