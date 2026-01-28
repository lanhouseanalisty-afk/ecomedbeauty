import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSectorRequests, SectorRequest } from "@/hooks/useSectorRequests";
import { Plus, ArrowDownLeft, ArrowUpRight, Loader2, MessageSquare, Send } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SectorRequestsPageProps {
    currentSector: string;
    sectorName: string;
}

const SECTORS = [
    { id: 'admin', name: 'Administração' },
    { id: 'rh', name: 'Compras' },
    { id: 'financeiro', name: 'Financeiro' },
    { id: 'marketing', name: 'Marketing' },

    { id: 'com_inside', name: 'Comercial - Inside Sales' },
    { id: 'com_sudeste', name: 'Comercial - Sudeste' },
    { id: 'com_sul', name: 'Comercial - Sul' },
    { id: 'com_centro', name: 'Comercial - Centro-Oeste' },
    { id: 'com_norte', name: 'Comercial - Norte' },
    { id: 'logistica', name: 'Logística' },
    { id: 'juridico', name: 'Jurídico' },
    { id: 'tech', name: 'Tech Digital' },
    { id: 'ecommerce', name: 'E-commerce' },

    { id: 'manutencao', name: 'Manutenção' },
];

export function SectorRequestsPage({ currentSector, sectorName }: SectorRequestsPageProps) {
    const { getRequests, createRequest, updateRequestStatus, addMessage, loading } = useSectorRequests(currentSector);
    const [requests, setRequests] = useState<SectorRequest[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    // Chat State
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SectorRequest | null>(null);
    const [newMessage, setNewMessage] = useState("");


    const [formData, setFormData] = useState({
        toSector: '',
        title: '',
        description: '',
        priority: 'medium' as SectorRequest['priority'],
    });

    const loadData = async () => {
        const result = await getRequests();
        if (result.success && result.data) {
            setRequests(result.data);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentSector]);

    const handleCreate = async () => {
        if (!formData.toSector || !formData.title || !formData.description) return;

        const result = await createRequest({
            ...formData,
            fromSector: currentSector,
            requesterName: 'Usuário Atual'
        });

        if (result.success) {
            setModalOpen(false);
            setFormData({ toSector: '', title: '', description: '', priority: 'medium' });
            loadData();
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: SectorRequest['status']) => {
        await updateRequestStatus(id, newStatus);
        loadData();
    };

    const handleOpenChat = (request: SectorRequest) => {
        setSelectedRequest(request);
        setChatOpen(true);
    };

    const handleSendMessage = async () => {
        if (!selectedRequest || !newMessage.trim()) return;

        const result = await addMessage(selectedRequest.id, newMessage, `${sectorName} (User)`);

        if (result.success) {
            setNewMessage("");
            // Update the selected request's messages locally to show immediately
            const updatedRequest = {
                ...selectedRequest,
                messages: [...(selectedRequest.messages || []), result.data]
            };
            setSelectedRequest(updatedRequest);
            loadData(); // Refresh background list
        }
    };


    const incomingRequests = requests.filter(r => r.toSector === currentSector);
    const outgoingRequests = requests.filter(r => r.fromSector === currentSector);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
            case 'in_progress': return <Badge variant="outline" className="text-blue-600 border-blue-600">Em Andamento</Badge>;
            case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600">Concluído</Badge>;
            case 'rejected': return <Badge variant="destructive">Rejeitado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const RequestTable = ({ data, type }: { data: SectorRequest[], type: 'incoming' | 'outgoing' }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>{type === 'incoming' ? 'De' : 'Para'}</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagens</TableHead>
                    {type === 'incoming' && <TableHead>Ações</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhuma solicitação encontrada.
                        </TableCell>
                    </TableRow>
                ) : (
                    data.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell className="font-mono text-xs">{req.request_id}</TableCell>
                            <TableCell>
                                {type === 'incoming'
                                    ? SECTORS.find(s => s.id === req.fromSector)?.name || req.fromSector
                                    : SECTORS.find(s => s.id === req.toSector)?.name || req.toSector
                                }
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate" title={req.title}>{req.title}</TableCell>
                            <TableCell>
                                <Badge variant={req.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                    {req.priority === 'urgent' ? 'Urgente' : req.priority === 'high' ? 'Alta' : req.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                            </TableCell>
                            <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                            <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleOpenChat(req)}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    {req.messages?.length || 0}
                                </Button>
                            </TableCell>

                            {type === 'incoming' && (
                                <TableCell>
                                    <div className="flex gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => handleStatusUpdate(req.id, 'in_progress')}>
                                                    Aceitar
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleStatusUpdate(req.id, 'rejected')}>
                                                    Rejeitar
                                                </Button>
                                            </>
                                        )}
                                        {req.status === 'in_progress' && (
                                            <Button size="sm" variant="outline" className="text-green-600 border-green-600" onClick={() => handleStatusUpdate(req.id, 'completed')}>
                                                Concluir
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            )}
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <>
            <Helmet>
                <title>Solicitações - {sectorName} | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Solicitações entre Setores</h1>
                        <p className="text-muted-foreground">
                            Gerencie solicitações enviadas e recebidas pelo setor de {sectorName}
                        </p>
                    </div>
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Solicitação
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nova Solicitação</DialogTitle>
                                <DialogDescription>
                                    Abra uma solicitação para outro departamento.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Para o Setor</Label>
                                    <Select
                                        value={formData.toSector}
                                        onValueChange={(val) => setFormData({ ...formData, toSector: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o setor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SECTORS.filter(s => s.id !== currentSector).map(sector => (
                                                <SelectItem key={sector.id} value={sector.id}>
                                                    {sector.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Prioridade</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(val: any) => setFormData({ ...formData, priority: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                            <SelectItem value="urgent">Urgente</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Título</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Aprovação de orçamento"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Descreva detalhadamente sua solicitação..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreate} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Enviar Solicitação
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Chat Dialog */}
                    <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Chat: {selectedRequest?.request_id}</DialogTitle>
                                <DialogDescription>
                                    {selectedRequest?.title}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col h-[400px]">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 border rounded-md mb-4 bg-muted/20">
                                    {selectedRequest?.messages && selectedRequest.messages.length > 0 ? (
                                        selectedRequest.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${msg.sender.includes(sectorName) ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender.includes(sectorName)
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                    }`}>
                                                    <p className="text-sm">{msg.content}</p>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground mt-1">
                                                    {msg.sender} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                            Nenhuma mensagem ainda.
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || loading}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Solicitações Recebidas</CardTitle>
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{incomingRequests.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {incomingRequests.filter(r => r.status === 'pending').length} pendentes
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Solicitações Enviadas</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{outgoingRequests.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {outgoingRequests.filter(r => r.status === 'completed').length} concluídas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="incoming" className="w-full">
                    <TabsList>
                        <TabsTrigger value="incoming">Recebidas ({incomingRequests.length})</TabsTrigger>
                        <TabsTrigger value="outgoing">Enviadas ({outgoingRequests.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="incoming" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Solicitações de Outros Setores</CardTitle>
                                <CardDescription>
                                    Gerencie o que outros departamentos estão pedindo ao {sectorName}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RequestTable data={incomingRequests} type="incoming" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="outgoing" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Minhas Solicitações</CardTitle>
                                <CardDescription>
                                    Acompanhe os pedidos feitos pelo {sectorName} a outros setores.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RequestTable data={outgoingRequests} type="outgoing" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
