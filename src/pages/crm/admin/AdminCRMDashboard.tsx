import { useState } from "react";
import { 
  Building2, 
  Users, 
  Shield, 
  Settings,
  Activity,
  MoreHorizontal,
  Search,
  Plus
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

const users = [
  { id: 1, name: "Admin Master", email: "admin@medbeauty.com", role: "admin_global", status: "active", lastLogin: "2024-01-15 10:30" },
  { id: 2, name: "Maria Silva", email: "maria@medbeauty.com", role: "sales_manager", status: "active", lastLogin: "2024-01-15 09:15" },
  { id: 3, name: "João Santos", email: "joao@medbeauty.com", role: "finance_manager", status: "active", lastLogin: "2024-01-14 16:45" },
  { id: 4, name: "Ana Costa", email: "ana@medbeauty.com", role: "marketing_manager", status: "inactive", lastLogin: "2024-01-10 11:00" },
  { id: 5, name: "Pedro Lima", email: "pedro@medbeauty.com", role: "tech_support", status: "active", lastLogin: "2024-01-15 08:00" },
];

const stats = [
  { title: "Usuários Ativos", value: "45", icon: Users },
  { title: "Departamentos", value: "9", icon: Building2 },
  { title: "Perfis", value: "11", icon: Shield },
  { title: "Logs Hoje", value: "1.2K", icon: Activity },
];

export default function AdminDashboard() {
  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; className: string }> = {
      admin_global: { label: "Admin Global", className: "bg-destructive/10 text-destructive" },
      rh_manager: { label: "Gerente RH", className: "bg-info/10 text-info" },
      finance_manager: { label: "Gerente Financeiro", className: "bg-success/10 text-success" },
      marketing_manager: { label: "Gerente Marketing", className: "bg-warning/10 text-warning" },
      sales_manager: { label: "Gerente Comercial", className: "bg-primary/10 text-primary" },
      tech_support: { label: "Suporte Tech", className: "bg-purple-500/10 text-purple-500" },
      employee: { label: "Funcionário", className: "bg-muted text-muted-foreground" },
    };
    const config = roleMap[role] || { label: role, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="bg-success/10 text-success">Ativo</Badge>
      : <Badge className="bg-muted text-muted-foreground">Inativo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">Gestão de usuários, permissões e configurações</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
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
                  <Input placeholder="Buscar usuário..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                            <DropdownMenuItem className="text-destructive">Desativar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <p className="text-muted-foreground">Em desenvolvimento...</p>
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
