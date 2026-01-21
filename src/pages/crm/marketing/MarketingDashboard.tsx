import { useState, useEffect } from "react";
import { 
  Megaphone, 
  Plus, 
  Target,
  TrendingUp,
  Eye,
  MousePointer,
  Calendar,
  Loader2,
  MoreHorizontal,
  Play,
  Pause,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCampaigns, useMarketingStats } from "@/hooks/useMarketing";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { campaigns, isLoading, createCampaign } = useCampaigns();
  const { data: stats } = useMarketingStats();

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "awareness",
    description: "",
    budget: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    channels: [] as string[],
  });

  const handleCreateCampaign = () => {
    createCampaign.mutate({
      name: newCampaign.name,
      type: newCampaign.type,
      description: newCampaign.description,
      budget: newCampaign.budget,
      start_date: newCampaign.start_date,
      end_date: newCampaign.end_date,
      channels: newCampaign.channels,
      status: 'draft',
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewCampaign({
          name: "",
          type: "awareness",
          description: "",
          budget: 0,
          start_date: new Date().toISOString().split('T')[0],
          end_date: "",
          channels: [],
        });
      }
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/10 text-success">Ativa</Badge>;
      case "scheduled":
        return <Badge className="bg-info/10 text-info">Agendada</Badge>;
      case "completed":
        return <Badge className="bg-muted text-muted-foreground">Finalizada</Badge>;
      case "paused":
        return <Badge className="bg-warning/10 text-warning">Pausada</Badge>;
      case "draft":
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">Campanhas, promoções e performance</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Campanha</DialogTitle>
              <DialogDescription>
                Configure uma nova campanha de marketing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Campanha</Label>
                <Input
                  id="name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="leads">Geração de Leads</SelectItem>
                      <SelectItem value="conversion">Conversão</SelectItem>
                      <SelectItem value="retention">Retenção</SelectItem>
                      <SelectItem value="remarketing">Remarketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCampaign.start_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end_date">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCampaign.end_date}
                    onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCampaign} disabled={createCampaign.isPending}>
                {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Campanha
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campanhas</CardTitle>
              <CardDescription>Gestão de campanhas de marketing</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas ({campaigns?.length || 0})</TabsTrigger>
              <TabsTrigger value="active">Ativas ({campaigns?.filter(c => c.status === 'active').length || 0})</TabsTrigger>
              <TabsTrigger value="scheduled">Agendadas ({campaigns?.filter(c => c.status === 'scheduled').length || 0})</TabsTrigger>
              <TabsTrigger value="completed">Finalizadas ({campaigns?.filter(c => c.status === 'completed').length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {!campaigns?.length ? (
                <EmptyState
                  title="Nenhuma campanha"
                  description="Crie sua primeira campanha de marketing"
                  actionLabel="Nova Campanha"
                  onAction={() => setIsDialogOpen(true)}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="hover-lift">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{campaign.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {campaign.type} • {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('pt-BR') : 'Sem data'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(campaign.status)}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {campaign.status === 'active' ? (
                                  <DropdownMenuItem>
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pausar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <Play className="h-4 w-4 mr-2" />
                                    Ativar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {campaign.description}
                          </p>
                        )}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Orçamento</span>
                            <span>
                              {formatCurrency(campaign.spent || 0)} / {formatCurrency(campaign.budget || 0)}
                            </span>
                          </div>
                          <Progress 
                            value={campaign.budget ? ((campaign.spent || 0) / campaign.budget) * 100 : 0} 
                            className="h-2" 
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center pt-2 border-t">
                          <div>
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Impressões</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Cliques</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold">0</p>
                            <p className="text-xs text-muted-foreground">Conversões</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
