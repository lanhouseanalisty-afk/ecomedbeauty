import { useState } from "react";
import {
  Building2,
  Users,
  Shield,
  Settings,
  Activity,
  MoreHorizontal,
  Search,
  Plus,
  Loader2
  , UserPlus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-dashboard-users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      return profiles.map(profile => ({
        ...profile,
        roles: roles.filter(r => r.user_id === profile.id).map(r => r.role)
      }));
    }
  });

  const getRoleBadge = (roles: string[]) => {
    if (!roles || roles.length === 0) return <Badge className="bg-muted text-muted-foreground">Funcionário</Badge>;

    // Show most prominent role
    const roleOrder = ['admin', 'rh_manager', 'finance_manager', 'marketing_manager', 'sales_manager', 'tech_support'];
    const primaryRole = roleOrder.find(r => roles.includes(r)) || roles[0];

    const roleMap: Record<string, { label: string; className: string }> = {
      admin: { label: "Admin Global", className: "bg-destructive/10 text-destructive" },
      rh_manager: { label: "Gerente RH", className: "bg-info/10 text-info" },
      finance_manager: { label: "Gerente Financeiro", className: "bg-success/10 text-success" },
      marketing_manager: { label: "Gerente Marketing", className: "bg-warning/10 text-warning" },
      sales_manager: { label: "Gerente Comercial", className: "bg-primary/10 text-primary" },
      tech_support: { label: "Suporte Tech", className: "bg-purple-500/10 text-purple-500" },
    };

    const config = roleMap[primaryRole] || { label: primaryRole, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive !== false
      ? <Badge className="bg-success/10 text-success">Ativo</Badge>
      : <Badge className="bg-muted text-muted-foreground border-dashed">Inativo</Badge>;
  };

  const filteredUsers = usersData?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Usuários Ativos", value: usersData?.filter(u => u.is_active !== false).length || "0", icon: Users },
    { title: "Departamentos", value: "9", icon: Building2 }, // Hardcoded for now until we have a departments table
    { title: "Gerentes", value: usersData?.filter(u => u.roles && u.roles.some((r: string) => r.includes('manager'))).length || "0", icon: Shield },
    { title: "Inativos", value: usersData?.filter(u => u.is_active === false).length || "0", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">Gestão de usuários, permissões e configurações em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.href = "/crm/admin/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700">
            <UserPlus className="h-4 w-4" />
            Admissão & Demissão
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="roles">Perfis</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuários do Sistema</CardTitle>
                  <CardDescription>Gerencie os usuários e suas permissões</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((user) => (
                      <TableRow key={user.id} className={user.is_active === false ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">{user.full_name || "Sem Nome"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.roles || [])}</TableCell>
                        <TableCell className="text-xs">
                          {user.last_seen_at
                            ? format(new Date(user.last_seen_at), "dd/MM HH:mm", { locale: ptBR })
                            : "Nunca accessou"
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Alterar Perfil</DropdownMenuItem>
                              <DropdownMenuItem>Reset Senha</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                {user.is_active === false ? 'Ativar' : 'Desativar'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfis de Acesso</CardTitle>
              <CardDescription>Configure permissões por perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>Histórico de ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Conectando aos logs do Supabase em breve...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>Parâmetros gerais da plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
