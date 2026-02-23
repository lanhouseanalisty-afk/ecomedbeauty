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
    TrendingUp,
    Loader2,
    RefreshCw
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { UnifiedSupplyRequestForm } from "@/components/crm/shared/UnifiedSupplyRequestForm";

export default function MarketingRequestsManagementPage() {
    const navigate = useNavigate();
    const { getMyRequests, getAllRequests, updateRequestStatus, loading } = useMarketingRequest();
    const { canEditModule, roles } = useUserRole();

    // Check if user is admin or marketing manager
    const isManager = roles.some(role => ['admin', 'marketing_manager'].includes(role));
    const canEdit = canEditModule('marketing');

    const [myRequests, setMyRequests] = useState<MarketingRequest[]>([]);
    const [allRequests, setAllRequests] = useState<MarketingRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const loadData = async () => {
        setRefreshing(true);

        // Always load my requests
        const myResult = await getMyRequests();
        if (myResult.success && myResult.data) {
            setMyRequests(myResult.data as MarketingRequest[]);
        }

        // Load all requests if manager
        if (isManager) {
            const allResult = await getAllRequests();
            if (allResult.success && allResult.data) {
                setAllRequests(allResult.data as MarketingRequest[]);
            }
        }

        setRefreshing(false);
    };

    useEffect(() => {
        loadData();
    }, [isManager]);

    const handleStatusChange = async (id: string, status: string) => {
        await updateRequestStatus(id, status);
        await loadData();
    };

    const stats = {
        total: isManager ? allRequests.length : myRequests.length,
        pending: (isManager ? allRequests : myRequests).filter((r) => r.status === "pending").length,
        approved: (isManager ? allRequests : myRequests).filter((r) => r.status === "approved").length,
    };

    const approvalRate = stats.total > 0
        ? Math.round((stats.approved / stats.total) * 100)
        : 0;

    if (loading && myRequests.length === 0 && allRequests.length === 0) {
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
                        <h1 className="font-serif text-3xl font-bold">Gerenciar Solicitações</h1>
                        <p className="text-muted-foreground">
                            Acompanhe o fluxo de aprovação das solicitações de insumos
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={loadData}
                            disabled={refreshing}
                            size="sm"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            Atualizar
                        </Button>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Solicitação
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                                <div className="p-1">
                                    <UnifiedSupplyRequestForm
                                        sector="marketing"
                                        sectorLabel="Marketing"
                                        onSuccess={() => {
                                            setIsDialogOpen(false);
                                            loadData();
                                        }}
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
                            <ListChecks className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa Aprovação</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{approvalRate}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{isManager ? 'Todas as Solicitações' : 'Minhas Solicitações'}</CardTitle>
                        <CardDescription>
                            {isManager
                                ? 'Gerencie as solicitações de toda a equipe'
                                : 'Acompanhe o status das suas solicitações individuais'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequestsTable
                            requests={isManager ? allRequests : myRequests}
                            onStatusChange={isManager ? handleStatusChange : undefined}
                            onRefresh={loadData}
                            isManager={isManager}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
