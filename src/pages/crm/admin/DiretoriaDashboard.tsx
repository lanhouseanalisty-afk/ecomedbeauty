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
  TrendingUp,
  BarChart,
  PieChart,
  Target
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

const strategicGoals = [
  { id: 1, name: "Expansão de Mercado", status: "on_track", progress: 75, owner: "Comercial" },
  { id: 2, name: "Otimização Logística", status: "at_risk", progress: 40, owner: "Logística" },
  { id: 3, name: "Lançamento Linha Premium", status: "on_track", progress: 60, owner: "Marketing" },
  { id: 4, name: "Redução de Custos Operacionais", status: "delayed", progress: 25, owner: "Financeiro" },
];

const stats = [
  { title: "Faturamento Mensal", value: "R$ 4.2M", icon: TrendingUp },
  { title: "Margem Líquida", value: "18.5%", icon: PieChart },
  { title: "Novos Clientes", value: "+125", icon: Users },
  { title: "NPS Global", value: "72", icon: Target },
];

export default function DiretoriaDashboard() {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      on_track: { label: "No Prazo", className: "bg-success/10 text-success" },
      at_risk: { label: "Em Risco", className: "bg-warning/10 text-warning" },
      delayed: { label: "Atrasado", className: "bg-destructive/10 text-destructive" },
      completed: { label: "Concluído", className: "bg-primary/10 text-primary" },
    };
    const config = statusMap[status] || { label: status, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Diretoria</h1>
          <p className="text-muted-foreground">Visão Estratégica e Indicadores de Performance (KPIs)</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestor: Pedro Miguel</Badge>
          <Button>
            <BarChart className="mr-2 h-4 w-4" />
            Relatório Executivo
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="goals">Metas Estratégicas</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Performance</CardTitle>
              <CardDescription>Visão consolidada dos departamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gráficos de performance consolidada aqui...</p>
              {/* Adicionar gráficos reais futuramente */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Metas Estratégicas</CardTitle>
                  <CardDescription>Acompanhamento dos objetivos trimestrais</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Objetivo</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategicGoals.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="font-medium">{goal.name}</TableCell>
                      <TableCell>{goal.owner}</TableCell>
                      <TableCell>{goal.progress}%</TableCell>
                      <TableCell>{getStatusBadge(goal.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
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
      </Tabs>
    </div>
  );
}
