import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Lock, Shuffle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPermissionsPage() {
    const queryClient = useQueryClient();

    // Fetch Permissions
    const { data: permissions, isLoading } = useQuery({
        queryKey: ["admin-permissions"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("permissions")
                .select("*")
                .order("role");
            if (error) throw error;
            return data;
        }
    });

    // Toggle Permission Mutation
    const togglePermissionMutation = useMutation({
        mutationFn: async ({ id, field, value }: { id: string, field: string, value: boolean }) => {
            const { error } = await supabase
                .from("permissions")
                .update({ [field]: value })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
            toast.success("Permissão atualizada!");
        },
        onError: () => toast.error("Erro ao atualizar")
    });

    const roles = [
        "admin", "rh_manager", "finance_manager", "marketing_manager",
        "sales_manager", "logistics_manager", "tech_support", "user"
    ];

    const modules = [
        "admin", "rh", "financeiro", "marketing", "comercial", "logistica", "juridico", "tech", "ecommerce"
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Permissões do Sistema</h1>
                <p className="text-muted-foreground">
                    Configure o acesso de cada função aos módulos do sistema
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Matriz de Acesso
                    </CardTitle>
                    <CardDescription>
                        Defina 'Ler', 'Escrever' e 'Deletar' para cada par Função/Módulo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Carregando...</p> : (
                        <div className="overflow-x-auto">
                            {/* A simple view for now: List roles and show their per-module permissions */}
                            {/* Since the matrix is huge, we'll list items */}
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Função (Role)</TableHead>
                                        <TableHead>Módulo</TableHead>
                                        <TableHead>Ler</TableHead>
                                        <TableHead>Criar</TableHead>
                                        <TableHead>Editar</TableHead>
                                        <TableHead>Deletar</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions?.map((perm) => (
                                        <TableRow key={perm.id}>
                                            <TableCell>
                                                <Badge variant="outline">{perm.role}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{perm.module}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={perm.can_read || false}
                                                    onCheckedChange={(c) => togglePermissionMutation.mutate({ id: perm.id, field: 'can_read', value: c })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={perm.can_create || false}
                                                    onCheckedChange={(c) => togglePermissionMutation.mutate({ id: perm.id, field: 'can_create', value: c })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={perm.can_update || false}
                                                    onCheckedChange={(c) => togglePermissionMutation.mutate({ id: perm.id, field: 'can_update', value: c })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={perm.can_delete || false}
                                                    onCheckedChange={(c) => togglePermissionMutation.mutate({ id: perm.id, field: 'can_delete', value: c })}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {permissions?.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                Nenhuma permissão configurada. Execute o SEED se necessário.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
