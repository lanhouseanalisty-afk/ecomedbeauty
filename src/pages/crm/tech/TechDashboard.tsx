import { useState, useMemo } from "react";
import {
  Headphones,
  Plus,
  TicketCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Server,
  Network,
  Activity,
  Zap,
  LayoutGrid,
  Settings,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from "recharts";
import { useTickets, useTicketStats } from "@/hooks/useTech";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function TechDashboard() {
  const { tickets, isLoading } = useTickets();
  const { data: stats } = useTicketStats();
  const { user } = useAuth();

  // Mock data for new sections
  const infraLinks = [
    { name: "Link Principal (Vivo)", status: "online", latency: "12ms", trend: "up" },
    { name: "Link Backup (Claro)", status: "online", latency: "25ms", trend: "stable" },
    { name: "VPN Matriz-Filial", status: "online", latency: "45ms", trend: "down" },
  ];

  const criticalServers = [
    { name: "Banco de Dados (SQL)", status: "online", cpu: "24%", ram: "62%" },
    { name: "SAP Business One", status: "online", cpu: "18%", ram: "45%" },
    { name: "Servidor de Arquivos", status: "online", cpu: "12%", ram: "38%" },
    { name: "Active Directory", status: "online", cpu: "5%", ram: "20%" },
  ];

  const activeProjects = [
    { name: "Migração Cloud AWS", progress: 75, status: "in_progress", priority: "high" },
    { name: "Segurança de Rede (Firewall)", progress: 40, status: "in_progress", priority: "critical" },
    { name: "Atualização SAP V10", progress: 95, status: "pending", priority: "medium" },
  ];

  const improvements = [
    { name: "Refatoração Checkout", date: "22/02", status: "concluded" },
    { name: "Novo Fluxo de Admissão", date: "20/02", status: "concluded" },
    { name: "Otimização de Banco", date: "15/02", status: "concluded" },
  ];

  const ticketTrendData = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return [
        { name: "Seg", resolvidos: 12, abertos: 15 },
        { name: "Ter", resolvidos: 18, abertos: 10 },
        { name: "Qua", resolvidos: 15, abertos: 12 },
        { name: "Qui", resolvidos: 22, abertos: 14 },
        { name: "Sex", resolvidos: 20, abertos: 18 },
        { name: "Sáb", resolvidos: 5, abertos: 2 },
        { name: "Dom", resolvidos: 3, abertos: 1 },
      ];
    }

    // Attempt to group real data (Simplified for performance)
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const now = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        resolvidos: 0,
        abertos: 0
      };
    });

    tickets.forEach((t: any) => {
      const createdDate = t.created_at?.split('T')[0];
      const resolvedDate = t.resolved_at?.split('T')[0];

      const openIdx = last7Days.findIndex(d => d.dateStr === createdDate);
      if (openIdx !== -1) last7Days[openIdx].abertos++;

      if (resolvedDate) {
        const resolvedIdx = last7Days.findIndex(d => d.dateStr === resolvedDate);
        if (resolvedIdx !== -1) last7Days[resolvedIdx].resolvidos++;
      }
    });

    // Fallback if no recent data
    if (last7Days.every(d => d.abertos === 0 && d.resolvidos === 0)) {
      return [
        { name: "Seg", resolvidos: 12, abertos: 15 },
        { name: "Ter", resolvidos: 18, abertos: 10 },
        { name: "Qua", resolvidos: 15, abertos: 12 },
        { name: "Qui", resolvidos: 22, abertos: 14 },
        { name: "Sex", resolvidos: 20, abertos: 18 },
        { name: "Sáb", resolvidos: 5, abertos: 2 },
        { name: "Dom", resolvidos: 3, abertos: 1 },
      ];
    }

    return last7Days;
  }, [tickets]);

  const slaCompliance = useMemo(() => {
    if (!stats) return 0;
    const total = (stats.resolved || 0) + (stats.critical || 0);
    if (total === 0) return 98.5; // Mock fallback
    return Math.round(((stats.resolved || 0) / (stats.open + stats.resolved || 1)) * 100);
  }, [stats]);

  const statCards = [
    {
      title: "SLA Global",
      value: `${85}%`,
      sub: "Meta: 95%",
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      trend: "+2.5%"
    },
    {
      title: "Tempo Médio (MTR)",
      value: "4.2h",
      sub: "Resolução em 24h",
      icon: Clock,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      trend: "-12%"
    },
    {
      title: "Chamados Ativos",
      value: stats?.open || 0,
      sub: `${stats?.critical || 0} críticos`,
      icon: TicketCheck,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      trend: "-3"
    },
    {
      title: "Projetos em Foco",
      value: activeProjects.length,
      sub: "3 pendentes",
      icon: LayoutGrid,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      trend: "Estável"
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Tech & Infra Overview</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Performance da Equipe e Monitoramento de Sistemas
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm bg-background border-slate-200">
            Gestor: Marcelo Ravagnani
          </Badge>
          <Button
            onClick={() => window.location.href = "/crm/tech/operacoes"}
            variant="outline"
            className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700"
          >
            <UserPlus className="h-4 w-4" />
            Admissão & Demissão
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  stat.trend.startsWith('+') ? "bg-emerald-100 text-emerald-700" :
                    stat.trend.startsWith('-') ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                )}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* Left Column: Infra Monitoring */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 h-full">
            <CardHeader className="border-b bg-slate-50/50 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Server className="h-5 w-5 text-indigo-500" />
                  Rede & Infra (Zabbix Core)
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Internet Links */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <Network className="h-3 w-3" /> Links de Internet
                </h4>
                <div className="space-y-2">
                  {infraLinks.map(link => (
                    <div key={link.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-sm font-medium text-slate-700">{link.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-500">{link.latency}</span>
                        {link.trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-red-500" /> : <ArrowDownRight className="h-3 w-3 text-emerald-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Servers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                  <LayoutGrid className="h-3 w-3" /> Servidores Críticos
                </h4>
                <div className="grid gap-2">
                  {criticalServers.map(server => (
                    <div key={server.name} className="p-3 rounded-lg border border-slate-100 space-y-2 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-800">{server.name}</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">UP</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>CPU</span>
                            <span>{server.cpu}</span>
                          </div>
                          <Progress value={parseInt(server.cpu)} className="h-1" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>RAM</span>
                            <span>{server.ram}</span>
                          </div>
                          <Progress value={parseInt(server.ram)} className="h-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="ghost" className="w-full text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                Acessar Painel Zabbix Completo
                <Plus className="ml-2 h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Performance & Charts */}
        <div className="md:col-span-8 space-y-6">

          {/* Ticket Performance Chart */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">Volume de Chamados</CardTitle>
                <CardDescription>Resoluções por dia da semana vs Aberturas</CardDescription>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-600 font-medium">
                  <div className="h-2 w-2 rounded-full bg-indigo-600"></div>
                  Resolvidos
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                  Abertos
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: "#64748B" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    fontSize={12}
                    tick={{ fill: "#64748B" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#F8FAFC" }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="resolvidos" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="abertos" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bottom Grid: Projects & Improvements */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Active Projects Pillar */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="py-4">
                <CardTitle className="text-md flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Projetos Estratégicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProjects.map(project => (
                  <div key={project.name} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{project.name}</span>
                      <span className="text-xs font-bold text-slate-500">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className={cn(
                      "h-1.5",
                      project.priority === 'critical' ? "[&>div]:bg-red-500" : "[&>div]:bg-indigo-500"
                    )} />
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 text-xs border-slate-200">
                  Ver Roadmap de TI
                </Button>
              </CardContent>
            </Card>

            {/* Improvements Pillar */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="py-4">
                <CardTitle className="text-md flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-500" />
                  Melhorias Contínuas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-slate-100 ml-2 pl-6 space-y-6">
                  {improvements.map((imp, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white shadow-sm"></div>
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-slate-700">{imp.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          Implementado em {imp.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}
