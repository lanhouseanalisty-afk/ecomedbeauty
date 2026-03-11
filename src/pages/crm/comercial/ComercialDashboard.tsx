import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Target,
  TrendingUp,
  DollarSign,
  Phone,
  Mail,
  Building,
  MoreHorizontal,
  Loader2,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Globe,
  Star,
  MapPin,
  FileText,
  ShieldAlert,
  UserPlus,
  Coffee
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LimpezaRequestDialog } from "@/components/crm/limpeza/LimpezaRequestDialog";

import { useLeads, useOpportunities } from "@/hooks/useCRM";
import { LeadSearchDialog } from "@/components/crm/comercial/LeadSearchDialog";
import { LeadDetailsDialog } from "@/components/crm/comercial/LeadDetailsDialog";
import { cn } from "@/lib/utils";

export default function ComercialDashboard() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const { leads, isLoading, createLead, updateLead, deleteLead } = useLeads();
  const { opportunities } = useOpportunities();
  const { canEditModule } = useUserRole();
  const canEdit = canEditModule('comercial');
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  const [newLead, setNewLead] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    notes: "",
  });

  const handleImportLeads = async (leadsToImport: any[]) => {
    for (const lead of leadsToImport) {
      await createLead.mutateAsync(lead);
    }
  };

  const handleCreateLead = () => {
    createLead.mutate(newLead, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewLead({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          company: "",
          source: "website",
          notes: "",
        });
      }
    });
  };

  const handleUpdateStatus = (leadId: string, newStatus: string) => {
    updateLead.mutate({ id: leadId, status: newStatus });
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('Tem certeza que deseja remover este lead?')) {
      deleteLead.mutate(leadId);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
      contacted: { label: "Contatado", className: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" },
      qualified: { label: "Qualificado", className: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
      converted: { label: "Convertido", className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" },
      lost: { label: "Perdido", className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" },
    };
    const config = statusMap[status || 'new'] || { label: status || 'Novo', className: "bg-gray-100 text-gray-700" };
    return <Badge variant="outline" className={cn("font-medium", config.className)}>{config.label}</Badge>;
  };

  const totalValue = opportunities?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;

  const stats = [
    {
      title: "Total Leads",
      value: leads?.length || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      trend: "+12% vs mês anterior"
    },
    {
      title: "Oportunidades",
      value: opportunities?.length || 0,
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      trend: "+5% vs mês anterior"
    },
    {
      title: "Taxa Conversão",
      value: `${leads?.length ? Math.round((opportunities?.length || 0) / leads.length * 100) : 0}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      trend: "+2% vs mês anterior"
    },
    {
      title: "Pipeline Estimado",
      value: `R$ ${(totalValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      trend: "Atualizado hoje"
    },
  ];

  const filteredLeads = leads?.filter(lead =>
    lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando CRM...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Comercial CRM
          </h1>
          <p className="text-muted-foreground mt-1">Gestão inteligente de leads e oportunidades</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestor Inside Sales: Cesar Camargo</Badge>

          <Button onClick={() => window.location.href = "/crm/comercial/operacoes"} variant="outline" className="gap-2 shadow-sm hover:shadow-md transition-all border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700">
            <UserPlus className="h-4 w-4" />
            Admissão & Demissão
          </Button>

          <LimpezaRequestDialog />

          <Button variant="outline" onClick={() => setIsSearchDialogOpen(true)} className="shadow-sm hover:shadow-md transition-all">
            <Globe className="mr-2 h-4 w-4 text-blue-500" />
            Buscar Leads Externos
          </Button>

          {canEdit ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 bg-gradient-to-r from-primary to-orange-600 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                {/* ... existing dialog content ... */}
                <DialogHeader>
                  <DialogTitle>Novo Lead</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo lead manualmente no sistema.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="first_name">Nome</Label>
                      <Input
                        id="first_name"
                        value={newLead.first_name}
                        onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="last_name">Sobrenome</Label>
                      <Input
                        id="last_name"
                        value={newLead.last_name}
                        onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newLead.email}
                        onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={newLead.company}
                        onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="source">Origem</Label>
                      <Select
                        value={newLead.source}
                        onValueChange={(value) => setNewLead({ ...newLead, source: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="referral">Indicação</SelectItem>
                          <SelectItem value="google_ads">Google Ads</SelectItem>
                          <SelectItem value="social_media">Redes Sociais</SelectItem>
                          <SelectItem value="event">Evento</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateLead} disabled={createLead.isPending}>
                    {createLead.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Cadastrar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded border border-amber-200">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              <span className="text-xs text-amber-600 font-medium whitespace-nowrap">Modo Leitura</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} className={cn("border-l-4 hover:shadow-lg transition-all", `stagger-${index + 1}`)} style={{ borderLeftColor: stat.color.replace('text-', '').replace('600', '500') }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-full", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-t-4 border-t-primary/20 shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Meus Leads</CardTitle>
              <CardDescription>Gerencie seus leads e acompanhe o progresso do pipeline</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, empresa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex border rounded-md overflow-hidden bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("rounded-none px-3", viewMode === 'list' && "bg-muted")}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("rounded-none px-3", viewMode === 'kanban' && "bg-muted")}
                  onClick={() => setViewMode('kanban')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="animate-fade-in-up">
            <TabsList className="mb-4 bg-muted/50 p-1">
              <TabsTrigger value="all">Todos ({leads?.length || 0})</TabsTrigger>
              <TabsTrigger value="new">Novos ({leads?.filter(l => l.status === 'new').length || 0})</TabsTrigger>
              <TabsTrigger value="contacted">Contatados ({leads?.filter(l => l.status === 'contacted').length || 0})</TabsTrigger>
              <TabsTrigger value="qualified">Qualificados ({leads?.filter(l => l.status === 'qualified').length || 0})</TabsTrigger>
              <TabsTrigger value="contracts">Contratos</TabsTrigger>
            </TabsList>

            <TabsContent value="contracts">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle>Gestão de Contratos</CardTitle>
                  <CardDescription>Gerencie as solicitações e contratos do departamento Comercial</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button
                      onClick={() => navigate("/crm/intranet/contratos/novo?sector=comercial")}
                      className="h-24 flex flex-col gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                      variant="outline"
                    >
                      <FileText className="h-6 w-6" />
                      <span>Solicitar Novo Contrato</span>
                    </Button>
                    <Button
                      onClick={() => window.location.href = "/crm/comercial/contratos"}
                      className="h-24 flex flex-col gap-2"
                      variant="outline"
                    >
                      <Search className="h-6 w-6" />
                      <span>Ver Todos os Contratos do Setor</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all" className="mt-0">

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Lead</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-16">
                          <div className="flex flex-col items-center gap-2">
                            <div className="bg-muted rounded-full p-4 mb-2">
                              <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="font-medium">Nenhum lead encontrado</p>
                            <p className="text-sm">Tente ajustar sua busca ou adicione um novo lead.</p>
                            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(true)} className="mt-4">
                              Adicionar Lead
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLeads?.map((lead) => (
                        <TableRow key={lead.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div>
                              <p className="font-semibold text-foreground">{lead.first_name} {lead.last_name}</p>
                              <span className="text-xs text-muted-foreground">Cadastrado em {new Date(lead.created_at).toLocaleDateString()}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.company ? (
                              <div className="flex items-center gap-1.5 p-1 px-2 rounded-md bg-muted/50 w-fit">
                                <Building className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-medium">{lead.company}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1.5">
                              {lead.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <Mail className="h-3.5 w-3.5" />
                                  {lead.email}
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <Phone className="h-3.5 w-3.5" />
                                  {lead.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-normal capitalize">
                              {lead.source || 'Manual'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                  Ver Perfil Completo
                                </DropdownMenuItem>
                                {canEdit && (
                                  <>
                                    <DropdownMenuItem className="cursor-pointer">Editar Informações</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem className="cursor-pointer">
                                  <Phone className="mr-2 h-3.5 w-3.5" /> Ligar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Mail className="mr-2 h-3.5 w-3.5" /> Enviar Email
                                </DropdownMenuItem>
                                {canEdit && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                                          Alterar Status
                                        </DropdownMenuItem>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent side="left" align="start">
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'new')}>
                                          Novo
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'contacted')}>
                                          Contatado
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'qualified')}>
                                          Qualificado
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'converted')}>
                                          Convertido
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleUpdateStatus(lead.id, 'lost')}>
                                          Perdido
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-destructive focus:text-destructive"
                                      onClick={() => handleDeleteLead(lead.id)}
                                    >
                                      Remover Lead
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <LeadSearchDialog
        open={isSearchDialogOpen}
        onOpenChange={setIsSearchDialogOpen}
        onImportLeads={handleImportLeads}
      />

      {selectedLead && (
        <LeadDetailsDialog
          lead={selectedLead}
          open={!!selectedLead}
          onOpenChange={(open) => !open && setSelectedLead(null)}
        />
      )}
    </div>
  );
}
