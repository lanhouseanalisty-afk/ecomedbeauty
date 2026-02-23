import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractTable } from "./components/ContractTable";

interface SectorContractDashboardProps {
    sector?: string;
}

export default function SectorContractDashboard({ sector }: SectorContractDashboardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    // Check if user is in juridico department (for delete permission)
    const { data: isLegalMember } = useQuery({
        queryKey: ['is-legal-member-sector', user?.id],
        queryFn: async () => {
            if (!user?.id) return false;
            const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
            if (roles?.some(r => r.role === 'admin')) return true;
            const { data: memberDepts } = await supabase.from('department_members').select('departments!inner(code)').eq('user_id', user.id);
            return memberDepts?.some(d => d.departments?.code?.toLowerCase() === 'juridico' || d.departments?.code?.toUpperCase() === 'JUR');
        }
    });

    const deleteContract = useMutation({
        mutationFn: async (contractId: string) => {
            const { error } = await supabase.from('legal_contracts').delete().eq('id', contractId);
            if (error) throw error;
        },
        onMutate: async (contractId) => {
            // Cancel any outgoing refetches to avoid overwriting our optimistic update
            await queryClient.cancelQueries({ queryKey: ['sector-contracts'] });
            await queryClient.cancelQueries({ queryKey: ['contracts-list'] });

            // Snapshot the previous values for all relevant queries
            const previousQueries = queryClient.getQueriesData({ queryKey: [] });

            // Optimistically update ALL queries that might contain this contract list
            const updater = (old: any) => {
                if (!Array.isArray(old)) return old;
                return old.filter((c: any) => c.id !== contractId);
            };

            queryClient.setQueriesData({ queryKey: ['sector-contracts'] }, updater);
            queryClient.setQueriesData({ queryKey: ['contracts-list'] }, updater);

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
            queryClient.invalidateQueries({ queryKey: ['sector-contracts'] });
            queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
        }
    });

    // Fetch Sector ID if sector prop is provided
    const { data: sectorId } = useQuery({
        queryKey: ['sector-id', sector],
        queryFn: async () => {
            if (!sector) return null;

            // 1. Try exact match
            const { data: exactMatch } = await supabase
                .from('departments')
                .select('id')
                .eq('code', sector)
                .maybeSingle();

            if (exactMatch) return exactMatch.id;

            // 2. Try mappings for inconsistent codes
            const search = sector.toLowerCase();
            let possibleCodes = [search];

            if (search === 'comercial') possibleCodes.push('com');
            if (search === 'marketing') possibleCodes.push('mkt');
            if (search === 'financeiro') possibleCodes.push('fin');
            if (search === 'administracao' || search === 'admin') possibleCodes.push('admin');
            if (search === 'logistica') possibleCodes.push('log');
            if (search === 'juridico') possibleCodes.push('jur');
            if (search === 'com_inside_sales') possibleCodes.push('com_inside');
            if (search === 'com_franchises') possibleCodes.push('franquias', 'com_franchise');

            const { data: mappedMatch } = await supabase
                .from('departments')
                .select('id')
                .in('code', possibleCodes.map(c => c.toUpperCase())) // Try uppercase too
                .maybeSingle();

            if (mappedMatch) return mappedMatch.id;

            // 3. Last resort: search by name
            const { data: nameMatch } = await supabase
                .from('departments')
                .select('id')
                .ilike('name', `%${sector.replace('com_', '').replace('_', ' ')}%`)
                .maybeSingle();

            return nameMatch?.id || null;
        },
        enabled: !!sector
    });

    // Fetch User Departments
    const { data: userDepartments } = useQuery({
        queryKey: ['user-departments', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from('department_members')
                .select('department_id')
                .eq('user_id', user.id);
            if (error) throw error;
            return data.map(d => d.department_id);
        },
        enabled: !!user?.id
    });

    // Fetch Contracts
    const { data: contracts, isLoading } = useQuery({
        queryKey: ['sector-contracts', userDepartments, sectorId],
        queryFn: async () => {
            // If sector is specific, filter by it (RLS will enforce access anyway, but good for UI)
            const departmentsToFetch = sectorId ? [sectorId] : userDepartments;

            if (!departmentsToFetch || departmentsToFetch.length === 0) return [];

            let query = supabase
                .from('legal_contracts')
                .select('*, departments(name)');

            // Only filter by department_id if it's likely to exist or we have sector specificity
            if (departmentsToFetch && departmentsToFetch.length > 0) {
                // We use a try-catch pattern or just check for existence if possible
                // For now, we'll try to use it as it's required for the feature
                query = query.in('department_id', departmentsToFetch);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                // If it's a "column does not exist" error, fallback to un-filtered but warn
                if (error.code === '42703' && error.message.includes('department_id')) {
                    console.warn("department_id column missing. Sector filtering disabled.");
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('legal_contracts')
                        .select('*, departments(name)')
                        .order('created_at', { ascending: false });
                    if (fallbackError) throw fallbackError;
                    return fallbackData;
                }
                throw error;
            }
            return data;
        },
        enabled: (!!userDepartments && userDepartments.length > 0) || !!sectorId
    });

    const filteredContracts = contracts?.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sap_request_id || c.payment_terms || "").toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const myRequestsList = filteredContracts.filter(c => ['requested', 'draft', 'legal_review', 'signing', 'pending_signature'].includes(c.status));
    const sectorRepositoryList = filteredContracts.filter(c => ['active', 'expired', 'terminated'].includes(c.status));

    // Contracts demanding user action (Drafts returned for adjustment, pending signatures)
    // We only show 'draft' in this tab if it was already assigned to a legal member (meaning it was actually sent and returned)
    const actionRequiredList = filteredContracts.filter(c =>
    (c.responsible_id === user?.id && (
        (c.status === 'draft' && c.responsible_legal_id) ||
        c.status === 'pending_signature'
    ))
    );

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Meus Contratos</h1>
                    <p className="text-muted-foreground">Acompanhe as solicitações de contrato do seu setor.</p>
                </div>
                <Button onClick={() => navigate(`/crm/juridico/contratos/novo${sector ? `?sector=${sector}` : ''}`)} className="gap-2 rounded-xl">
                    <Plus className="h-4 w-4" />
                    Solicitar Contrato
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-red-200 bg-red-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Ação Necessária</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{actionRequiredList.length}</div>
                        <p className="text-xs text-muted-foreground">Ajustes ou assinaturas pendentes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{myRequestsList.length}</div>
                        <p className="text-xs text-muted-foreground">Solicitações ativas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vigentes</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sectorRepositoryList.filter(c => c.status === 'active').length}
                        </div>
                        <p className="text-xs text-muted-foreground">Contratos ativos do setor</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Contratos</CardTitle>
                            <CardDescription>Visualize o status de todas as solicitações do seu departamento.</CardDescription>
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
                    <Tabs defaultValue="action_required">
                        <TabsList className="grid w-full grid-cols-3 mb-4">
                            <TabsTrigger value="action_required" className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50">
                                Ajustes / Aprovação
                                {actionRequiredList.length > 0 && (
                                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                                        {actionRequiredList.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="requests">Minhas Solicitações</TabsTrigger>
                            <TabsTrigger value="repository">Repositório do Setor</TabsTrigger>
                        </TabsList>

                        <TabsContent value="action_required">
                            <div className="rounded-md border border-red-100 bg-red-50/10">
                                <ContractTable
                                    data={actionRequiredList}
                                    isLoading={isLoading}
                                    sector={sector}
                                    onDelete={(id) => deleteContract.mutate(id)}
                                    isLegalMember={isLegalMember}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="requests">
                            <ContractTable
                                data={myRequestsList}
                                isLoading={isLoading}
                                sector={sector}
                                onDelete={(id) => deleteContract.mutate(id)}
                                isLegalMember={isLegalMember}
                            />
                        </TabsContent>

                        <TabsContent value="repository">
                            <ContractTable
                                data={sectorRepositoryList}
                                isLoading={isLoading}
                                sector={sector}
                                onDelete={(id) => deleteContract.mutate(id)}
                                isLegalMember={isLegalMember}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
