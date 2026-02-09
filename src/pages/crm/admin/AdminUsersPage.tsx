import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Shield, User, Users, Briefcase, Mail, Activity, Ban, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        full_name: "",
        email: "",
        cpf: "",
        employee_code: "",
        department_id: ""
    });

    // Fetch Users (Profiles + Roles)
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ["admin-users"],
        queryFn: async () => {
            const { data: profiles, error } = await supabase
                .from("profiles")
                .select(`
            *,
            user_roles (role)
        `)
                .order('full_name');
            if (error) throw error;
            return profiles;
        }
    });

    const updateUserStatusMutation = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
            const { error } = await supabase
                .from("profiles")
                .update({ is_active: isActive })
                .eq("id", userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Status do usuário atualizado!");
        },
        onError: (err: any) => {
            toast.error(`Erro ao atualizar status: ${err.message}`);
        }
    });



    // Fetch Departments for form


    const [activeTab, setActiveTab] = useState("users");

    const updateUserRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
            // First remove existing roles for this user (assuming single role policy for simplicity)
            const { error: deleteError } = await supabase
                .from("user_roles")
                .delete()
                .eq("user_id", userId);

            if (deleteError) throw deleteError;

            // Then insert new role
            const { error } = await supabase
                .from("user_roles")
                .insert({ user_id: userId, role: role });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Permissão atualizada com sucesso!");
        },
        onError: (err: any) => {
            toast.error(`Erro ao atualizar permissão: ${err.message}`);
        }
    });

    const updateUserRole = (userId: string, role: string) => {
        updateUserRoleMutation.mutate({ userId, role });
    };

    // ... (existing code)

    // Create Employee Mutation
    const createEmployeeMutation = useMutation({
        mutationFn: async (emp: typeof newEmployee) => {
            // Basic insert - in real app, validations required
            const { error } = await supabase.from("employees").insert({
                full_name: emp.full_name,
                email: emp.email,
                cpf: emp.cpf,
                employee_code: emp.employee_code,
                department_id: emp.department_id || null, // Handle empty string
                status: "active",
                hire_date: new Date().toISOString()
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-employees"] });
            setIsEmployeeDialogOpen(false);
            setNewEmployee({ full_name: "", email: "", cpf: "", employee_code: "", department_id: "" });
            toast.success("Funcionário criado com sucesso!");
            setActiveTab("employees"); // Switch to employees tab
        },
        onError: (err: any) => {
            toast.error(`Erro ao criar funcionário: ${err.message}`);
        }
    });

    // ...

    const filteredUsers = users?.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );



    return (
        <div className="space-y-6">
            {/* ... header ... */}

            {/* ... search ... */}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">
                        <Shield className="h-4 w-4 mr-2" />
                        Usuários do Sistema
                    </TabsTrigger>

                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Usuários e Permissões</CardTitle>
                            <CardDescription>Gerencie quem tem acesso ao sistema e seus níveis</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingUsers ? <p>Carregando...</p> : (
                                <div className="space-y-4">
                                    {(filteredUsers as any)?.map((user: any) => (
                                        <div key={user.id} className={`flex items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors ${!user.is_active ? 'opacity-60 bg-muted/30 border-dashed' : ''}`}>
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-2 rounded-full mt-1 md:mt-0 ${user.is_active ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                                                    <User className={`h-5 w-5 ${user.is_active ? 'text-primary' : 'text-destructive'}`} />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{user.full_name || "Usuário sem nome"}</p>
                                                        {!user.is_active && (
                                                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] uppercase">Bloqueado</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="h-3 w-3" />
                                                            {user.email}
                                                        </span>
                                                        {user.last_seen_at && (
                                                            <span className="flex items-center gap-1 text-primary/70">
                                                                <Clock className="h-3 w-3" />
                                                                Visto {formatDistanceToNow(new Date(user.last_seen_at), { addSuffix: true, locale: ptBR })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                                                <div className="flex gap-1 order-2 md:order-1">
                                                    {user.user_roles?.map((ur: any) => (
                                                        <Badge key={ur.role} variant="outline" className="uppercase text-[10px] h-5">
                                                            {ur.role}
                                                        </Badge>
                                                    ))}
                                                    {(!user.user_roles || user.user_roles.length === 0) && (
                                                        <Badge variant="secondary" className="text-[10px] h-5">User</Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 order-1 md:order-2">
                                                    <Select
                                                        onValueChange={(val) => updateUserRole(user.id, val)}
                                                        defaultValue={user.user_roles?.[0]?.role || "user"}
                                                        disabled={!user.is_active}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                            <SelectItem value="rh_manager">RH Mgr</SelectItem>
                                                            <SelectItem value="finance_manager">Fin. Mgr</SelectItem>
                                                            <SelectItem value="marketing_manager">Mkt. Mgr</SelectItem>
                                                            <SelectItem value="sales_manager">Sales Mgr</SelectItem>
                                                            <SelectItem value="logistics_manager">Logistics</SelectItem>
                                                            <SelectItem value="tech_support">Tech Supp</SelectItem>
                                                        </SelectContent>
                                                    </Select>

                                                    <div className="flex items-center gap-2 pl-2 border-l ml-1">
                                                        <Switch
                                                            checked={user.is_active !== false}
                                                            onCheckedChange={(checked) => updateUserStatusMutation.mutate({ userId: user.id, isActive: checked })}
                                                            title={user.is_active !== false ? "Desativar Acesso" : "Ativar Acesso"}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
        </div>
    );
}
