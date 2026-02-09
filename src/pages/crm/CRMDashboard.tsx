import {
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  TicketCheck,
  Target,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CRMOrgChart } from "@/components/crm/CRMOrgChart";

const stats = [
  {
    title: "Receita Mensal",
    value: "R$ 284.500",
    change: "+12.5%",
    changeType: "positive",
    icon: DollarSign,
    color: "text-success",
  },
  {
    title: "Novos Leads",
    value: "127",
    change: "+8.2%",
    changeType: "positive",
    icon: Users,
    color: "text-info",
  },
  {
    title: "Pedidos Hoje",
    value: "45",
    change: "+23.1%",
    changeType: "positive",
    icon: ShoppingCart,
    color: "text-primary",
  },
  {
    title: "Taxa Conversão",
    value: "3.2%",
    change: "-0.4%",
    changeType: "negative",
    icon: TrendingUp,
    color: "text-warning",
  },
];

const recentActivities = [
  { id: 1, type: "lead", message: "Novo lead capturado: Maria Silva", time: "2 min atrás" },
  { id: 2, type: "order", message: "Pedido #1234 enviado para entrega", time: "15 min atrás" },
  { id: 3, type: "ticket", message: "Ticket #567 resolvido por João", time: "1h atrás" },
  { id: 4, type: "payment", message: "Pagamento de R$ 2.500 recebido", time: "2h atrás" },
  { id: 5, type: "campaign", message: "Campanha 'Black Friday' iniciada", time: "3h atrás" },
];

export default function CRMDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Dashboard CRM
          </h1>
          <p className="text-muted-foreground">
            Visão geral de todos os setores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Últimos 30 dias
          </Button>
          <Button size="sm">
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.changeType === 'positive' ? 'text-success' : 'text-destructive'}`}>
                {stat.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* E-commerce Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance E-commerce</CardTitle>
            <CardDescription>Acompanhamento de vendas, metas e logística</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">

              {/* Vendas Mensais */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Vendas Mensais</span>
                    <span className="text-xs text-muted-foreground uppercase">Faturamento</span>
                  </div>
                  <span className="text-sm font-medium">
                    R$ 284k / R$ 350k meta
                  </span>
                </div>
                <Progress value={(284 / 350) * 100} className="h-2 bg-slate-100" indicatorClassName="bg-blue-600" />
              </div>

              {/* Pedidos & Entregas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Expedição & Entregas</span>
                    <span className="text-xs text-muted-foreground uppercase">Logística</span>
                  </div>
                  <span className="text-sm font-medium">
                    342 entregues / 380 pedidos
                  </span>
                </div>
                <Progress value={(342 / 380) * 100} className="h-2 bg-slate-100" indicatorClassName="bg-purple-600" />
              </div>

              {/* Taxa de Conversão */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Taxa de Conversão</span>
                    <span className="text-xs text-muted-foreground uppercase">Performance</span>
                  </div>
                  <span className="text-sm font-medium">
                    3.2% (Meta: 4.5%)
                  </span>
                </div>
                <Progress value={(3.2 / 4.5) * 100} className="h-2 bg-slate-100" indicatorClassName="bg-emerald-500" />
              </div>

              {/* Novos Clientes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium">Novos Clientes</span>
                    <span className="text-xs text-muted-foreground uppercase">Aquisição</span>
                  </div>
                  <span className="text-sm font-medium">
                    127 cadastros (Meta: 150)
                  </span>
                </div>
                <Progress value={(127 / 150) * 100} className="h-2 bg-slate-100" indicatorClassName="bg-orange-500" />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atualizações do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {activity.type === "lead" && <Users className="h-4 w-4 text-info" />}
                    {activity.type === "order" && <Package className="h-4 w-4 text-primary" />}
                    {activity.type === "ticket" && <TicketCheck className="h-4 w-4 text-success" />}
                    {activity.type === "payment" && <DollarSign className="h-4 w-4 text-success" />}
                    {activity.type === "campaign" && <Target className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Org Chart */}
        <CRMOrgChart />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse rapidamente as funções mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Users className="h-6 w-6" />
              <span>Novo Lead</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <ShoppingCart className="h-6 w-6" />
              <span>Ver Pedidos</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <TicketCheck className="h-6 w-6" />
              <span>Criar Ticket</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <DollarSign className="h-6 w-6" />
              <span>Nova Fatura</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
