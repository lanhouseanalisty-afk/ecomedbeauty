import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestsTable } from "@/components/crm/marketing/RequestsTable";
import { useMarketingRequestLocal, MarketingRequest } from "@/hooks/useMarketingRequestLocal";
import { Plus, ListChecks, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function MarketingRequestsListPage() {
    const navigate = useNavigate();
    const { getRequests, loading } = useMarketingRequestLocal();
    const [requests, setRequests] = useState<MarketingRequest[]>([]);

    const loadRequests = async () => {
        const result = await getRequests();
        if (result.success && result.data) {
            setRequests(result.data);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "pending").length,
        approved: requests.filter((r) => r.status === "approved").length,
        rejected: requests.filter((r) => r.status === "rejected").length,
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
                <title>Minhas Solicitações - Marketing | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Minhas Solicitações de Insumos</h1>
                        <p className="text-muted-foreground">
                            Acompanhe o status das suas solicitações de materiais
                        </p>
                    </div>
                    <Button onClick={() => navigate("/crm/marketing/solicitacao-insumos")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Solicitação
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Solicitações criadas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                            <p className="text-xs text-muted-foreground">Solicitações aprovadas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                            <p className="text-xs text-muted-foreground">Solicitações rejeitadas</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Requests Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Suas Solicitações</CardTitle>
                        <CardDescription>
                            Visualize e acompanhe todas as suas solicitações de insumos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequestsTable
                            requests={requests}
                            onRefresh={loadRequests}
                            isManager={false}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
