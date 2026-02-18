import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSectorRequests, SectorRequest } from "@/hooks/useSectorRequests";
import { Plus, Package, Loader2 } from "lucide-react";
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

interface SectorSupplyRequestPageProps {
    currentSector: string;
    sectorName: string;
}

export function SectorSupplyRequestPage({ currentSector, sectorName }: SectorSupplyRequestPageProps) {
    const { getRequests, createRequest, loading } = useSectorRequests(currentSector);
    const [requests, setRequests] = useState<SectorRequest[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        targetSector: 'logistica', // Default to Logistics
        title: '',
        description: '',
        priority: 'medium' as SectorRequest['priority'],
    });

    const loadData = async () => {
        const result = await getRequests();
        if (result.success && result.data) {
            // Filter: Outgoing requests to Logistics or Compras
            const supplyRequests = result.data.filter(r =>
                r.fromSector === currentSector &&
                (r.toSector === 'logistica' || r.toSector === 'compras')
            );
            setRequests(supplyRequests);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentSector]);

    const handleCreate = async () => {
        if (!formData.title || !formData.description) return;

        const result = await createRequest({
            toSector: formData.targetSector,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            fromSector: currentSector,
            requesterName: 'Usuário Atual' // TODO: Get real name
        });

        if (result.success) {
            setModalOpen(false);
            setFormData({ targetSector: 'logistica', title: '', description: '', priority: 'medium' });
            loadData();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
            case 'in_progress': return <Badge variant="outline" className="text-blue-600 border-blue-600">Em Separação</Badge>;
            case 'completed': return <Badge variant="outline" className="text-green-600 border-green-600">Entregue</Badge>;
            case 'rejected': return <Badge variant="destructive">Negado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <>
            <Helmet>
                <title>Insumos - {sectorName} | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Solicitação de Insumos</h1>
                        <p className="text-muted-foreground">
                            Solicite materiais de escritório, limpeza ou estoque para o {sectorName}
                        </p>
                    </div>
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Pedido
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Pedido de Insumo</DialogTitle>
                                <DialogDescription>
                                    O que o seu setor está precisando?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Tipo de Insumo (Destino)</Label>
                                    <Select
                                        value={formData.targetSector}
                                        onValueChange={(val) => setFormData({ ...formData, targetSector: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="logistica">Estoque / Logística</SelectItem>
                                            <SelectItem value="compras">Compras / Aquisição</SelectItem>
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
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Item / Título</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ex: Resmas de Papel A4"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Quantidade e Detalhes</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Especifique a quantidade e detalhes do produto..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreate} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Solicitar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Meus Pedidos de Insumos</CardTitle>
                        <CardDescription>
                            Acompanhe o status das suas solicitações de materiais.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Prioridade</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Nenhum pedido encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-mono text-xs">{req.request_id}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {req.toSector === 'logistica' ? 'Logística' : 'Compras'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {req.title}
                                                <div className="text-xs text-muted-foreground font-normal line-clamp-1">
                                                    {req.description}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={req.priority === 'urgent' || req.priority === 'high' ? 'destructive' : 'secondary'}>
                                                    {req.priority === 'urgent' ? 'Urgente' : req.priority === 'high' ? 'Alta' : req.priority === 'medium' ? 'Média' : 'Baixa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
