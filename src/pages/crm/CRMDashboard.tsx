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

const moduleMetrics = [
  { name: "Comercial", leads: 127, conversao: 3.2, meta: 150 },
  { name: "Logística", pedidos: 45, entregues: 38, pendentes: 7 },
  { name: "Financeiro", receber: 84500, pagar: 32100, saldo: 52400 },
  { name: "Suporte", abertos: 12, resolvidos: 45, sla: 94 },
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
        {/* Module Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Métricas por Setor</CardTitle>
            <CardDescription>Performance de cada módulo do CRM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Comercial */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Comercial - Leads</span>
                  <span className="text-sm text-muted-foreground">
                    {moduleMetrics[0].leads} / {moduleMetrics[0].meta} meta
                  </span>
                </div>
                <Progress value={(moduleMetrics[0].leads / moduleMetrics[0].meta) * 100} className="h-2" />
              </div>

              {/* Logística */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Logística - Entregas</span>
                  <span className="text-sm text-muted-foreground">
                    {moduleMetrics[1].entregues} entregues, {moduleMetrics[1].pendentes} pendentes
                  </span>
                </div>
                <Progress 
                  value={(moduleMetrics[1].entregues / moduleMetrics[1].pedidos) * 100} 
                  className="h-2" 
                />
              </div>

              {/* Suporte */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Suporte - SLA</span>
                  <span className="text-sm text-muted-foreground">
                    {moduleMetrics[3].sla}% dentro do prazo
                  </span>
                </div>
                <Progress value={moduleMetrics[3].sla} className="h-2" />
              </div>

              {/* Financeiro */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">A Receber</p>
                    <p className="text-lg font-semibold text-success">
                      R$ {moduleMetrics[2].receber.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">A Pagar</p>
                    <p className="text-lg font-semibold text-destructive">
                      R$ {moduleMetrics[2].pagar.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo</p>
                    <p className="text-lg font-semibold text-info">
                      R$ {moduleMetrics[2].saldo.toLocaleString()}
                    </p>
                  </div>
                </div>
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
