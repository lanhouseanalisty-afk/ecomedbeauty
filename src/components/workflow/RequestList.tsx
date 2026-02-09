
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowRight, Clock, CheckCircle, AlertCircle, Inbox, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Request {
    id: string;
    title: string;
    source_sector: string;
    target_sector: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    created_at: string;
    due_at: string | null;
}

export function RequestList() {
    const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        // Mock user sector for now - In real app, get from auth context
        const mySector = 'marketing'; // Exemplo: Sou do Marketing

        // 1. Recebidas (Inbox): Target = My Sector
        const { data: inbox } = await supabase
            .from('sector_requests')
            .select('*')
            .eq('target_sector', mySector)
            .order('created_at', { ascending: false });

        // 2. Enviadas (Sent): Source = My Sector OR Created By Me
        const { data: sent } = await supabase
            .from('sector_requests')
            .select('*')
            .eq('source_sector', mySector) // Ou created_by = user.id
            .order('created_at', { ascending: false });

        setIncomingRequests(inbox || []);
        setOutgoingRequests(sent || []);
        setLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityIcon = (priority: string) => {
        if (priority === 'urgent' || priority === 'high') return <AlertCircle className="w-4 h-4 text-red-500" />;
        return <Clock className="w-4 h-4 text-slate-500" />;
    };

    const RequestItem = ({ req }: { req: Request }) => (
        <div
            onClick={() => navigate(`/crm/solicitacoes/${req.id}`)}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(req.status)} bg-opacity-20`}>
                    {getPriorityIcon(req.priority)}
                </div>
                <div>
                    <h4 className="font-semibold text-sm text-gray-900">{req.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] uppercase">
                            {req.source_sector} → {req.target_sector}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(req.status)} border-0`}>
                    {req.status === 'pending' ? 'Pendente' :
                        req.status === 'in_progress' ? 'Em Progresso' :
                            req.status === 'completed' ? 'Concluído' : req.status}
                </Badge>
                <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );

    return (
        <Card className="h-full border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        Central de Solicitações
                    </CardTitle>
                    <Button className="bg-rose-gold text-white hover:bg-rose-gold-dark" onClick={() => navigate('/crm/solicitacoes/nova')}>
                        <Plus className="w-4 h-4 mr-2" /> Nova Solicitação
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue="inbox" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="inbox" className="flex items-center gap-2">
                            <Inbox className="w-4 h-4" /> Recebidas ({incomingRequests.length})
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="flex items-center gap-2">
                            <Send className="w-4 h-4" /> Enviadas ({outgoingRequests.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox" className="space-y-4">
                        {loading ? <p>Carregando...</p> : incomingRequests.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                Nenhuma solicitação recebida.
                            </div>
                        ) : incomingRequests.map(r => <RequestItem key={r.id} req={r} />)}
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4">
                        {loading ? <p>Carregando...</p> : outgoingRequests.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                                Você ainda não fez nenhuma solicitação.
                            </div>
                        ) : outgoingRequests.map(r => <RequestItem key={r.id} req={r} />)}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
