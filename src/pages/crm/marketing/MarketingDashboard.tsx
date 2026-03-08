import { useNavigate } from "react-router-dom";
import { useMarketingStats } from "@/hooks/useMarketing";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Package,
  AlertCircle,
  Coffee
} from "lucide-react";
import { LimpezaRequestDialog } from "@/components/crm/limpeza/LimpezaRequestDialog";
import { useMarketingRequest } from "@/hooks/useMarketingRequest";
import { useEffect, useState } from "react";

const performanceData = [
  { name: "Sem 1", value: 12500 },
  { name: "Sem 2", value: 18200 },
  { name: "Sem 3", value: 15800 },
  { name: "Sem 4", value: 22100 },
];

const channelData = [
  { name: "Google Ads", value: 45 },
  { name: "Facebook", value: 28 },
  { name: "Instagram", value: 18 },
  { name: "Email", value: 9 },
];

export default function MarketingDashboard() {
  const navigate = useNavigate();
  const { data: stats } = useMarketingStats();
  const { getAllRequests } = useMarketingRequest();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      const result = await getAllRequests();
      if (result.success && result.data) {
        setPendingRequestsCount(result.data.filter(r => r.status === 'pending').length);
      }
    };
    fetchPending();
  }, []);

  const quickStats = [
    {
      title: "Campanhas Ativas",
      value: stats?.active || 0,
      icon: Megaphone,
      color: "text-primary",
      trend: { value: 12 }
    },
    {
      title: "Orçamento Total",
      value: formatCurrency(stats?.totalBudget || 0),
      icon: Target,
      color: "text-info"
    },
    {
      title: "Gasto Acumulado",
      value: formatCurrency(stats?.totalSpent || 0),
      icon: TrendingUp,
      color: "text-warning",
      description: `${stats?.totalBudget ? Math.round((stats.totalSpent / stats.totalBudget) * 100) : 0}% do orçamento`
    },
    {
      title: "ROI Médio",
      value: "340%",
      icon: BarChart3,
      color: "text-success",
      trend: { value: 8 }
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">Campanhas, promoções e performance</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestora: Viviane Toledo</Badge>
          <LimpezaRequestDialog />
          <QuickStats stats={quickStats} />
        </div>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="requests">Solicitações {pendingRequestsCount > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">{pendingRequestsCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <KPIChart
              title="Performance Semanal"
              description="Impressões e cliques por semana"
              data={performanceData}
              type="area"
            />
            <KPIChart
              title="Distribuição por Canal"
              description="Investimento por canal de marketing"
              data={channelData}
              type="pie"
            />
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Solicitações de Insumos</CardTitle>
                <CardDescription>
                  Existem {pendingRequestsCount} solicitações aguardando sua aprovação.
                </CardDescription>
              </div>
              <Button onClick={() => navigate("/crm/marketing/gerenciar")} className="bg-amber-600 hover:bg-amber-700">
                Gerenciar Solicitações
              </Button>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Contratos</CardTitle>
              <CardDescription>Gerencie as solicitações e contratos do departamento de Marketing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={() => navigate("/crm/juridico/contratos/novo?sector=marketing")}
                  className="h-24 flex flex-col gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                  variant="outline"
                >
                  <FileText className="h-6 w-6" />
                  <span>Solicitar Novo Contrato</span>
                </Button>
                <Button
                  onClick={() => navigate("/crm/marketing/contratos")}
                  className="h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>Ver Todos os Contratos do Setor</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
