import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestsTable } from "@/components/crm/marketing/RequestsTable";
import { useMarketingRequest, MarketingRequest } from "@/hooks/useMarketingRequest";
import {
    Plus,
    ListChecks,
    Clock,
    CheckCircle,
    TrendingUp,
    Loader2,
    RefreshCw
} from "lucide-react";

export default function MarketingRequestsManagementPage() {
    const navigate = useNavigate();
    const { getAllRequests, updateRequestStatus, loading } = useMarketingRequest();
    const [requests, setRequests] = useState<MarketingRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadRequests = async () => {
        const result = await getAllRequests();
        if (result.success && result.data) {
            setRequests(result.data);
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

    const handleStatusChange = async (id: string, status: string) => {
        await updateRequestStatus(id, status);
        await loadRequests();
    };

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        thisMonth: requests.filter((r) => {
            const createdDate = new Date(r.created_at || "");
            const now = new Date();
            return (
                createdDate.getMonth() === now.getMonth() &&
                createdDate.getFullYear() === now.getFullYear()
            );
        }).length,
    };

    const approvalRate = stats.total > 0
        ? Math.round((stats.approved / stats.total) * 100)
        : 0;

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
                <title>Gerenciar Solicitações - Marketing | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Gerenciamento de Solicitações</h1>
                        <p className="text-muted-foreground">
                            Aprove, rejeite e gerencie todas as solicitações de insumos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>
                        <Button onClick={() => navigate("/crm/marketing/solicitacao-insumos")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Solicitação
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Solicitações</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Todas as solicitações</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes de Aprovação</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Aguardando sua aprovação</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aprovadas Este Mês</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.thisMonth}</div>
                            <p className="text-xs text-muted-foreground">Solicitações deste mês</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvalRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.approved} de {stats.total} aprovadas
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Todas as Solicitações</CardTitle>
                        <CardDescription>
                            Gerencie e aprove solicitações de insumos de toda a equipe
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequestsTable
                            requests={requests}
                            onStatusChange={handleStatusChange}
                            onRefresh={loadRequests}
                            isManager={true}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
