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
import { Plus, Search, Shield, User, Users, Briefcase, Mail } from "lucide-react";
import { toast } from "sonner";

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
        `);
            if (error) throw error;
            return profiles;
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
                                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.full_name || "Usuário sem nome"}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2">
                                                    {user.user_roles?.map((ur: any) => (
                                                        <Badge key={ur.role} variant="outline" className="uppercase">
                                                            {ur.role}
                                                        </Badge>
                                                    ))}
                                                    {(!user.user_roles || user.user_roles.length === 0) && (
                                                        <Badge variant="secondary">User</Badge>
                                                    )}
                                                </div>
                                                <Select
                                                    onValueChange={(val) => updateUserRole(user.id, val)}
                                                    defaultValue={user.user_roles?.[0]?.role || "user"}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="user">User</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="rh_manager">RH Manager</SelectItem>
                                                        <SelectItem value="finance_manager">Finance Manager</SelectItem>
                                                        <SelectItem value="marketing_manager">Marketing Manager</SelectItem>
                                                        <SelectItem value="sales_manager">Sales Manager</SelectItem>
                                                        <SelectItem value="logistics_manager">Logistics</SelectItem>
                                                        <SelectItem value="tech_support">Tech Support</SelectItem>
                                                    </SelectContent>
                                                </Select>
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
