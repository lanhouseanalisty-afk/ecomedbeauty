import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Package,
    Truck,
    MapPin,
    Calendar,
    RefreshCw,
    Loader2,
    ShieldAlert
} from "lucide-react";
import { useMarketingRequest, MarketingRequest } from "@/hooks/useMarketingRequest";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";

export default function LogisticaPedidosPage() {
    const { getAllRequests, updateRequestStatus, loading } = useMarketingRequest();
    const { canEditModule } = useUserRole();
    const canEdit = canEditModule('logistica');
    const [requests, setRequests] = useState<MarketingRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Tracking Dialog States
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState("");
    const [processingTracking, setProcessingTracking] = useState(false);

    const loadRequests = async () => {
        const result = await getAllRequests();
        if (result.success && result.data) {
            // Filter for requests that are relevant to logistics (approved, shipping, completed)
            // Ignoring 'pending' or 'rejected'
            const logisticsRequests = result.data.filter(r =>
                ['approved', 'shipped', 'delivered', 'completed'].includes(r.status || '')
            );
            setRequests(logisticsRequests);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRequests();
        setRefreshing(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (newStatus === 'shipped') {
            setSelectedRequestId(id);
            setTrackingNumber("");
            setTrackingDialogOpen(true);
            return;
        }

        await updateRequestStatus(id, newStatus);
        await loadRequests();
    };

    const handleConfirmShipment = async () => {
        if (!selectedRequestId) return;

        setProcessingTracking(true);
        try {
            await updateRequestStatus(selectedRequestId, 'shipped', undefined, trackingNumber);
            setTrackingDialogOpen(false);
            setSelectedRequestId(null);
            setTrackingNumber("");
            await loadRequests();
        } finally {
            setProcessingTracking(false);
        }
    };

    const STATUS_MAP: Record<string, { label: string; color: string }> = {
        approved: { label: "Aprovado - Aguardando Envio", color: "bg-blue-100 text-blue-800" },
        shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
        delivered: { label: "Entregue", color: "bg-green-100 text-green-800" },
        completed: { label: "Concluído", color: "bg-gray-100 text-gray-800" },
    };

    if (loading && requests.length === 0) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Pedidos de Logística | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Pedidos e Envios</h1>
                        <p className="text-muted-foreground">
                            Gerencie a expedição e entrega de materiais solicitados
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        {!canEdit && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded border border-amber-200">
                                <ShieldAlert className="h-4 w-4 text-amber-600" />
                                <span className="text-xs text-amber-600 font-medium">Somente Leitura</span>
                            </div>
                        )}
                        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
                            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                    </div>
                </div>

                {/* Pending Shipments Card */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aguardando Envio</CardTitle>
                            <Package className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {requests.filter(r => r.status === 'approved').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Em Trânsito</CardTitle>
                            <Truck className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {requests.filter(r => r.status === 'shipped').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Pedidos</CardTitle>
                        <CardDescription>
                            Solicitações aprovadas que necessitam de logística
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Solicitação</TableHead>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>Destino</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                            Nenhum pedido encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{req.request_id}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(req.created_at || '').toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        Kit: {req.kit_type}
                                                    </span>
                                                    {req.tracking_number && (
                                                        <Badge variant="outline" className="mt-1 w-fit text-[10px] py-0 border-purple-200 text-purple-700 bg-purple-50">
                                                            Rastreio: {req.tracking_number}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{req.event_name}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(req.event_date), 'dd/MM/yyyy')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="text-sm font-medium">
                                                        {req.consultant_name}
                                                        {req.regional_manager && (
                                                            <span className="text-xs text-muted-foreground ml-2 font-normal">
                                                                (Gestor: {req.regional_manager})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-start gap-1">
                                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                                        <span>
                                                            {req.street}, {req.number}
                                                            <br />
                                                            {req.neighborhood} - {req.city}/{req.state}
                                                            <br />
                                                            CEP: {req.cep}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={STATUS_MAP[req.status || '']?.color}>
                                                    {STATUS_MAP[req.status || '']?.label || req.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canEdit ? (
                                                    <>
                                                        {req.status === 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusChange(req.id!, 'shipped')}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <Truck className="h-4 w-4 mr-2" />
                                                                Marcar Enviado
                                                            </Button>
                                                        )}
                                                        {req.status === 'shipped' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusChange(req.id!, 'delivered')}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <Package className="h-4 w-4 mr-2" />
                                                                Marcar Entregue
                                                            </Button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground">Bloqueado</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Tracking Number Dialog */}
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Informar Código de Rastreio</DialogTitle>
                        <DialogDescription>
                            Insira o código de rastreio para o envio deste pedido.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tracking" className="text-right">
                                Código
                            </Label>
                            <Input
                                id="tracking"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="col-span-3"
                                placeholder="Ex: BR123456789"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirmShipment}
                            disabled={processingTracking}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {processingTracking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Envio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
