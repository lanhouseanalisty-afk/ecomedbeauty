import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMarketingRequestLocal, MarketingRequest } from "@/hooks/useMarketingRequestLocal";
import { Package, Clock, CheckCircle, XCircle, Loader2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function LogisticaPedidosInsumosPage() {
    const { getRequests, approveRequest, rejectRequest, loading } = useMarketingRequestLocal();
    const [requests, setRequests] = useState<MarketingRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const loadRequests = async () => {
        const result = await getRequests();
        if (result.success && result.data) {
            setRequests(result.data);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleApprove = async (id: string) => {
        const result = await approveRequest(id, 'logistica-user', 'Logística');
        if (result.success) {
            await loadRequests();
            alert(`✅ Pedido aprovado com sucesso!`);
        }
    };

    const handleReject = async (id: string) => {
        const reason = prompt('Motivo da rejeição:');
        if (reason) {
            const result = await rejectRequest(id, 'logistica-user', reason);
            if (result.success) {
                await loadRequests();
                alert(`❌ Pedido rejeitado: ${reason}`);
            }
        }
    };

    const filteredRequests = statusFilter === "all"
        ? requests
        : requests.filter(r => r.status === statusFilter);

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case "pending":
                return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-600">Pendente</Badge>;
            case "approved":
                return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-600">Aprovado</Badge>;
            case "rejected":
                return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-600">Rejeitado</Badge>;
            default:
                return <Badge variant="outline">Desconhecido</Badge>;
        }
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
                <title>Pedidos de Insumos - Logística | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Pedidos de Insumos</h1>
                    <p className="text-muted-foreground">
                        Gerencie as solicitações de materiais do Marketing
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Pedidos recebidos</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Aguardando análise</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Pedidos aprovados</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Pedidos rejeitados</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Pedidos de Insumos</CardTitle>
                                <CardDescription>
                                    Visualize e gerencie todos os pedidos de materiais
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="all">Todos os Status</option>
                                    <option value="pending">Pendentes</option>
                                    <option value="approved">Aprovados</option>
                                    <option value="rejected">Rejeitados</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum pedido encontrado
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Evento</TableHead>
                                        <TableHead>Consultor</TableHead>
                                        <TableHead>Gerente</TableHead>
                                        <TableHead>KIT</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-mono text-xs">{request.request_id}</TableCell>
                                            <TableCell>{request.event_name}</TableCell>
                                            <TableCell>{request.consultant_name}</TableCell>
                                            <TableCell>{request.regional_manager}</TableCell>
                                            <TableCell className="text-xs">{request.kit_type}</TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(request.event_date).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                                            <TableCell>
                                                {request.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                                            onClick={() => handleApprove(request.id!)}
                                                        >
                                                            Aprovar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                                            onClick={() => handleReject(request.id!)}
                                                        >
                                                            Rejeitar
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
