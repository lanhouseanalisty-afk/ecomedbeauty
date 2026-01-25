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

    // Fetch Employees
    const { data: employees, isLoading: loadingEmployees } = useQuery({
        queryKey: ["admin-employees"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("employees")
                .select("*")
                .order("full_name");
            if (error) throw error;
            return data;
        }
    });

    // Fetch Departments for form
    const { data: departments } = useQuery({
        queryKey: ["admin-departments"],
        queryFn: async () => {
            const { data } = await supabase.from("departments").select("id, name");
            return data || [];
        }
    });

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
        },
        onError: (err: any) => {
            toast.error(`Erro ao criar funcionário: ${err.message}`);
        }
    });

    // Update User Role Mutation (Simplistic: upsert role)
    // Note: Handling multiple roles per user might require more complex UI.
    // Assuming 1 role per user for simplicity or just updating primary.
    const updateUserRole = async (userId: string, role: string) => {
        // This requires backend function usually, but if RLS allows policies on user_roles:
        try {
            const { error } = await supabase.from("user_roles").upsert({
                user_id: userId,
                role: role as any // cast string to enum
            });
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            toast.success("Permissão atualizada!");
        } catch (e: any) {
            toast.error(`Erro ao atualizar permissão: ${e.message}`);
        }
    };

    const filteredUsers = users?.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEmployees = employees?.filter(e =>
        e.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
                    <p className="text-muted-foreground">
                        Controle de acesso, funcionários e funções do sistema
                    </p>
                </div>
                <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Funcionário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cadastrar Funcionário</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input value={newEmployee.full_name} onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })} placeholder="Ex: João da Silva" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} placeholder="email@empresa.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>CPF</Label>
                                    <Input value={newEmployee.cpf} onChange={e => setNewEmployee({ ...newEmployee, cpf: e.target.value })} placeholder="000.000.000-00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Código (Matrícula)</Label>
                                    <Input value={newEmployee.employee_code} onChange={e => setNewEmployee({ ...newEmployee, employee_code: e.target.value })} placeholder="FUNC-001" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Departamento</Label>
                                <Select value={newEmployee.department_id} onValueChange={v => setNewEmployee({ ...newEmployee, department_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments?.map(d => (
                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={() => createEmployeeMutation.mutate(newEmployee)} disabled={createEmployeeMutation.isPending}>Salvar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg w-full md:w-1/3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome, email ou código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0"
                />
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">
                        <Shield className="h-4 w-4 mr-2" />
                        Usuários do Sistema
                    </TabsTrigger>
                    <TabsTrigger value="employees">
                        <Users className="h-4 w-4 mr-2" />
                        Funcionários (RH)
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

                <TabsContent value="employees" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Base de Funcionários</CardTitle>
                            <CardDescription>Todos os colaboradores cadastrados no RH</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingEmployees ? <p>Carregando...</p> : (
                                <div className="space-y-4">
                                    {filteredEmployees?.map(emp => (
                                        <div key={emp.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <Briefcase className="h-5 w-5 text-green-700" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{emp.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {emp.employee_code} • {emp.cpf}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <Badge className={emp.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                                    {emp.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {(!filteredEmployees || filteredEmployees.length === 0) && (
                                        <p className="text-center text-muted-foreground py-8">Nenhum funcionário encontrado.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
