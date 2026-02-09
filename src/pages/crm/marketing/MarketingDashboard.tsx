import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { useMarketingStats } from "@/hooks/useMarketing";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
          {/* Nova Campanha removed */}
        </div>
      </div>

      <QuickStats stats={quickStats} />

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
    </div>
  );
}
