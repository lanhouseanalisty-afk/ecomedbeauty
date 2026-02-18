
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Scale,
    Plus,
    Search,
    FileText,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileSignature,
    Trash2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContractTable } from "./components/ContractTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LegalContractsDashboard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: contracts, isLoading } = useQuery({
        queryKey: ['contracts-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('legal_contracts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const queryClient = useQueryClient();

    const deleteContract = useMutation({
        mutationFn: async (contractId: string) => {
            const { error } = await supabase.from('legal_contracts').delete().eq('id', contractId);
            if (error) throw error;
        },
        onMutate: async (contractId) => {
            // Cancel any outgoing refetches to avoid overwriting our optimistic update
            await queryClient.cancelQueries({ queryKey: ['contracts-list'] });
            await queryClient.cancelQueries({ queryKey: ['sector-contracts'] });

            // Snapshot the previous values for all relevant queries
            const previousQueries = queryClient.getQueriesData({ queryKey: [] });

            // Optimistically update ALL queries that might contain this contract list
            const updater = (old: any) => {
                if (!Array.isArray(old)) return old;
                return old.filter((c: any) => c.id !== contractId);
            };

            queryClient.setQueriesData({ queryKey: ['contracts-list'] }, updater);
            queryClient.setQueriesData({ queryKey: ['sector-contracts'] }, updater);

            return { previousQueries };
        },
        onSuccess: () => {
            toast.success("Contrato excluído com sucesso!");
        },
        onError: (error: any, contractId, context: any) => {
            // Rollback all queries if mutation fails
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, oldData]: [any, any]) => {
                    queryClient.setQueryData(queryKey, oldData);
                });
            }
            toast.error(`Erro ao excluir: ${error.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
            queryClient.invalidateQueries({ queryKey: ['sector-contracts'] });
        }
    });

    const filteredContracts = contracts?.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.sap_request_id?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const { data: isLegalMember } = useQuery({
        queryKey: ['is-legal-member'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return false;

            // Check if user is admin
            const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id);

            if (roles?.some(r => r.role === 'admin')) return true;

            // Check if user is in juridico department (case insensitive)
            const { data: memberDepts } = await supabase
                .from('department_members')
                .select('departments!inner(code)')
                .eq('user_id', user.id);

            const isMember = memberDepts?.some(d =>
                d.departments?.code?.toLowerCase() === 'juridico' ||
                d.departments?.code?.toUpperCase() === 'JUR'
            );

            return !!isMember;
        }
    });

    const requestsList = filteredContracts.filter(c => ['requested', 'draft', 'legal_review', 'review', 'signing', 'pending_signature', 'drafting', 'pending_approval'].includes(c.status));
    const repositoryList = filteredContracts.filter(c => ['active', 'expired', 'terminated', 'renewed'].includes(c.status));

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Jurídico & Contratos</h1>
                    <p className="text-muted-foreground">Gestão do ciclo de vida de contratos e SLA.</p>
                </div>
                {isLegalMember ? (
                    <Button onClick={() => navigate("/crm/juridico/contratos/novo")} className="gap-2 rounded-xl bg-slate-900 hover:bg-slate-800">
                        <Plus className="h-4 w-4" />
                        Novo Contrato
                    </Button>
                ) : (
                    <Button onClick={() => navigate("/crm/intranet/contratos/novo?sector=juridico")} className="gap-2 rounded-xl">
                        <Plus className="h-4 w-4" />
                        Solicitar Contrato
                    </Button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
                        <Scale className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contracts?.filter(c => c.status === 'legal_review').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Aguardando parecer</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Assinatura</CardTitle>
                        <FileSignature className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contracts?.filter(c => c.status === 'signing').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">No DocuSign</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contracts?.filter(c => c.status === 'active').length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Contratos ativos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contracts?.filter(c => {
                                if (c.status !== 'active' || !c.end_date) return false;
                                const today = new Date();
                                const endDate = new Date(c.end_date);
                                const diffTime = endDate.getTime() - today.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const alertDays = c.renewal_alert_days || 60;
                                return diffDays >= 0 && diffDays <= alertDays;
                            }).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Contratos próximos do vencimento</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Gestão de Contratos</CardTitle>
                            <CardDescription>Acompanhe solicitações e consulte o repositório.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar contrato..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="requests">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="requests">Solicitações em Andamento</TabsTrigger>
                            <TabsTrigger value="repository">Biblioteca de Contratos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="requests">
                            <ContractTable
                                data={requestsList}
                                isLoading={isLoading}
                                isLegalMember={isLegalMember}
                                onDelete={(id) => deleteContract.mutate(id)}
                            />
                        </TabsContent>

                        <TabsContent value="repository">
                            <ContractTable
                                data={repositoryList}
                                isLoading={isLoading}
                                isLegalMember={isLegalMember}
                                onDelete={(id) => deleteContract.mutate(id)}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
