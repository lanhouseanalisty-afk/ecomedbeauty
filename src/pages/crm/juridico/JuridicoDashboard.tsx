import { useState } from "react";
import {
  Scale,
  Plus,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Loader2,
  Calendar,
  Eye,
  Download,
  FileSignature,
  Shield,
  Upload,
  File,
  Bell,
  Mail,
  Sparkles,
  Bot,
  Brain
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContracts, useLegalStats } from "@/hooks/useJuridico";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

const complianceData = [
  { name: "Conforme", value: 85 },
  { name: "Em Revisão", value: 10 },
  { name: "Não Conforme", value: 5 },
];

export default function JuridicoDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [viewingSummary, setViewingSummary] = useState<{ title: string, content: string } | null>(null);
  const [viewingContract, setViewingContract] = useState<any | null>(null);
  const { contracts, isLoading, createContract, updateContract } = useContracts();
  const { data: stats } = useLegalStats();

  const [newContract, setNewContract] = useState({
    title: "",
    contract_number: "",
    type: "service",
    party_name: "",
    value: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    reminder_enabled: true,
    reminder_email: "",
    renewal_notice_days: 30,
  });

  const handleCreateContract = async () => {
    let documentUrl = "";

    if (selectedFile) {
      setIsUploading(true);
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('contracts')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('contracts')
          .getPublicUrl(filePath);

        documentUrl = publicUrl;
      } catch (error: any) {
        toast.error("Erro ao fazer upload do arquivo: " + error.message);
        setIsUploading(false);
        return;
      }
    }

    createContract.mutate({
      title: newContract.title,
      contract_number: newContract.contract_number || `CTR-${Date.now()}`,
      type: newContract.type,
      party_name: newContract.party_name,
      value: newContract.value,
      start_date: newContract.start_date,
      end_date: newContract.end_date,
      status: 'draft',
      document_url: documentUrl,
      reminder_enabled: newContract.reminder_enabled,
      reminder_email: newContract.reminder_email,
      renewal_notice_days: newContract.renewal_notice_days,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsUploading(false);
        setSelectedFile(null);
        setNewContract({
          title: "",
          contract_number: "",
          type: "service",
          party_name: "",
          value: 0,
          start_date: new Date().toISOString().split('T')[0],
          end_date: "",
          reminder_enabled: true,
          reminder_email: "",
          renewal_notice_days: 30,
        });
      },
      onError: () => {
        setIsUploading(false);
      }
    });
  };

  const handleGenerateAISummary = async (contract: any) => {
    if (contract.terms_summary) {
      setViewingSummary({
        title: contract.title,
        content: contract.terms_summary
      });
      return;
    }

    setSummarizingId(contract.id);

    // Simular chamada de IA
    setTimeout(async () => {
      const summary = `
Este contrato de ${contract.type.toUpperCase()} entre a MEDBEAUTY e ${contract.party_name || 'Terceiro'} refere-se a ${contract.title}.

**Pontos Principais:**
1. **Vigência:** Início em ${formatDate(contract.start_date)} com término previsto para ${contract.end_date ? formatDate(contract.end_date) : 'Prazo Indeterminado'}.
2. **Valor:** O montante total é de ${contract.value ? formatCurrency(contract.value) : 'não especificado'}.
3. **Objeto:** Prestação de serviços/fornecimento conforme detalhado no anexo técnico.
4. **Rescisão:** Cláusula padrão de 30 dias de aviso prévio sem multa após 12 meses.
5. **Compliance:** Em conformidade com as políticas internas da MedBeauty e LGPD.

*Resumo gerado automaticamente por MedBeauty AI Engine.*`;

      try {
        await updateContract.mutateAsync({
          id: contract.id,
          updates: { terms_summary: summary }
        });

        setViewingSummary({
          title: contract.title,
          content: summary
        });
      } catch (error) {
        toast.error("Erro ao salvar resumo da IA");
      } finally {
        setSummarizingId(null);
      }
    }, 2000);
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      active: { label: "Ativo", className: "bg-success/10 text-success" },
      pending_signature: { label: "Aguardando Assinatura", className: "bg-warning/10 text-warning" },
      expiring: { label: "A Vencer", className: "bg-destructive/10 text-destructive" },
      expired: { label: "Vencido", className: "bg-muted text-muted-foreground" },
      draft: { label: "Rascunho", className: "bg-info/10 text-info" },
      cancelled: { label: "Cancelado", className: "bg-muted text-muted-foreground" },
    };
    const config = statusMap[status || 'draft'] || { label: status || 'Rascunho', className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string | null) => {
    const typeMap: Record<string, string> = {
      supplier: "Fornecedor",
      client: "Cliente",
      nda: "NDA",
      lease: "Aluguel",
      service: "Serviço",
      employment: "Trabalho",
    };
    return <Badge variant="outline">{typeMap[type || 'service'] || type}</Badge>;
  };

  const quickStats = [
    { title: "Contratos Ativos", value: stats?.activeContracts || 0, icon: FileText, color: "text-primary", trend: { value: 5 } },
    { title: "A Vencer (30d)", value: stats?.expiringContracts || 0, icon: Clock, color: "text-warning" },
    { title: "Casos Abertos", value: stats?.openCases || 0, icon: AlertTriangle, color: "text-destructive" },
    { title: "Compliance", value: `${stats?.complianceRate || 0}%`, icon: Shield, color: "text-success", description: "Taxa de conformidade" },
  ];

  const filteredContracts = contracts?.filter(contract => {
    return (contract.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contract.contract_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (contract.party_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
  }) || [];

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
          <h1 className="font-serif text-3xl font-bold">Jurídico</h1>
          <p className="text-muted-foreground">Contratos, casos e compliance</p>
        </div>
        <div className="flex gap-2">
          <DataExport
            data={filteredContracts}
            filename="contratos"
            columns={[
              { key: 'contract_number', label: 'Número' },
              { key: 'title', label: 'Título' },
              { key: 'party_name', label: 'Parte' },
              { key: 'type', label: 'Tipo' },
              { key: 'status', label: 'Status' },
              { key: 'value', label: 'Valor' },
            ]}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Contrato</DialogTitle>
                <DialogDescription>
                  Registre um novo contrato no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Contrato</Label>
                  <Input
                    id="title"
                    value={newContract.title}
                    onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contract_number">Número</Label>
                    <Input
                      id="contract_number"
                      placeholder="CTR-001"
                      value={newContract.contract_number}
                      onChange={(e) => setNewContract({ ...newContract, contract_number: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newContract.type}
                      onValueChange={(value) => setNewContract({ ...newContract, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="supplier">Fornecedor</SelectItem>
                        <SelectItem value="client">Cliente</SelectItem>
                        <SelectItem value="nda">NDA</SelectItem>
                        <SelectItem value="lease">Aluguel</SelectItem>
                        <SelectItem value="employment">Trabalho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="party_name">Parte Contratante</Label>
                    <Input
                      id="party_name"
                      value={newContract.party_name}
                      onChange={(e) => setNewContract({ ...newContract, party_name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="value">Valor (R$)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={newContract.value}
                      onChange={(e) => setNewContract({ ...newContract, value: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Data Início</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newContract.start_date}
                      onChange={(e) => setNewContract({ ...newContract, start_date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">Data Fim</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={newContract.end_date}
                      onChange={(e) => setNewContract({ ...newContract, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document">Documento do Contrato (Arquivo)</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="document"
                      type="file"
                      className="cursor-pointer"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Aceita PDF, DOC e DOCX. Tamanho máximo 10MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        Lembrete de Vencimento
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar automaticamente antes do encerramento
                      </p>
                    </div>
                    <Switch
                      checked={newContract.reminder_enabled}
                      onCheckedChange={(checked) => setNewContract({ ...newContract, reminder_enabled: checked })}
                    />
                  </div>

                  {newContract.reminder_enabled && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                      <div className="grid gap-2">
                        <Label htmlFor="reminder_email" className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          Email para Aviso
                        </Label>
                        <Input
                          id="reminder_email"
                          type="email"
                          placeholder="juridico@empresa.com"
                          value={newContract.reminder_email}
                          onChange={(e) => setNewContract({ ...newContract, reminder_email: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notice_days">Avisar com (dias)</Label>
                        <Input
                          id="notice_days"
                          type="number"
                          value={newContract.renewal_notice_days}
                          onChange={(e) => setNewContract({ ...newContract, renewal_notice_days: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateContract} disabled={createContract.isPending || isUploading}>
                  {(createContract.isPending || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? "Enviando arquivo..." : "Criar Contrato"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickStats stats={quickStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <KPIChart
          title="Status de Compliance"
          description="Distribuição por status de conformidade"
          data={complianceData}
          type="pie"
        />
        <Card>
          <CardHeader>
            <CardTitle>Alertas Jurídicos</CardTitle>
            <CardDescription>Itens que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Contratos a vencer</p>
                <p className="text-xs text-muted-foreground">3 contratos vencem nos próximos 30 dias</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <Clock className="h-5 w-5 text-destructive flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Prazos próximos</p>
                <p className="text-xs text-muted-foreground">2 casos com prazo judicial esta semana</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-info/5 rounded-lg border border-info/20">
              <FileSignature className="h-5 w-5 text-info flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Assinaturas pendentes</p>
                <p className="text-xs text-muted-foreground">5 contratos aguardando assinatura</p>
              </div>
              <Button variant="outline" size="sm">Ver</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Contratos</CardTitle>
              <CardDescription>Gestão de contratos e documentos legais</CardDescription>
            </div>
            <SearchFilter
              searchPlaceholder="Buscar contrato..."
              onSearchChange={setSearchTerm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({contracts?.length || 0})</TabsTrigger>
              <TabsTrigger value="active">Ativos ({contracts?.filter(c => c.status === 'active').length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({contracts?.filter(c => c.status === 'pending_signature').length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredContracts.length === 0 ? (
                <EmptyState
                  variant={searchTerm ? 'search' : 'empty'}
                  title={searchTerm ? 'Nenhum resultado' : 'Nenhum contrato'}
                  description={searchTerm
                    ? 'Tente um termo diferente'
                    : 'Registre seu primeiro contrato'
                  }
                  actionLabel={!searchTerm ? 'Novo Contrato' : undefined}
                  onAction={() => setIsDialogOpen(true)}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Parte</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lembrete</TableHead>
                      <TableHead>Doc</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">{contract.contract_number}</TableCell>
                        <TableCell>{contract.title}</TableCell>
                        <TableCell>{contract.party_name || '-'}</TableCell>
                        <TableCell>{getTypeBadge(contract.type)}</TableCell>
                        <TableCell>
                          {contract.value ? formatCurrency(contract.value) : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell>
                          {contract.reminder_enabled ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-green-600 font-medium whitespace-nowrap">
                                <Bell className="h-3 w-3" />
                                <span>{contract.renewal_notice_days} dias</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={contract.reminder_email || ''}>
                                {contract.reminder_email || 'Não definido'}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-muted-foreground opacity-40">
                              <Bell className="h-3 w-3" />
                              <span>Inativo</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {contract.document_url ? (
                            <a
                              href={contract.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <FileText className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingContract(contract)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSignature className="h-4 w-4 mr-2" />
                                Solicitar Assinatura
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (contract.document_url) window.open(contract.document_url, '_blank');
                              }}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-primary font-medium"
                                onClick={() => handleGenerateAISummary(contract)}
                                disabled={summarizingId === contract.id}
                              >
                                {summarizingId === contract.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="h-4 w-4 mr-2" />
                                )}
                                Resumo IA
                              </DropdownMenuItem>
                              <DropdownMenuItem>Renovar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Resumo IA */}
      <Dialog open={!!viewingSummary} onOpenChange={() => setViewingSummary(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              Resumo Inteligente - IA
            </DialogTitle>
            <DialogDescription>
              Análise automática dos termos e condições do contrato: <strong>{viewingSummary?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 p-6 rounded-xl border border-primary/10">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {viewingSummary?.content}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between items-center bg-primary/5 -mx-6 -mb-6 p-4 rounded-b-lg border-t border-primary/10">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Bot className="h-3 w-3" />
              Powered by MedBeauty AI Insight
            </p>
            <Button onClick={() => setViewingSummary(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização Completa do Contrato */}
      <Dialog open={!!viewingContract} onOpenChange={() => setViewingContract(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="mb-2">
                {viewingContract?.contract_number}
              </Badge>
              {getStatusBadge(viewingContract?.status)}
            </div>
            <DialogTitle className="text-2xl font-serif">
              {viewingContract?.title}
            </DialogTitle>
            <DialogDescription>
              Detalhes técnicos e análise de inteligência artificial.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4 border-y">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Parte Contratante</p>
              <p className="font-medium text-lg">{viewingContract?.party_name || "Não informado"}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Valor do Contrato</p>
              <p className="font-serif text-xl text-primary font-bold">
                {viewingContract?.value ? formatCurrency(viewingContract.value) : "R$ 0,00"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Vigência</p>
              <p className="text-sm">
                {viewingContract?.start_date ? formatDate(viewingContract.start_date) : "-"} até {viewingContract?.end_date ? formatDate(viewingContract.end_date) : "Indeterminado"}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Lembrete Ativo</p>
              <Badge variant={viewingContract?.reminder_enabled ? "default" : "secondary"} className="bg-green-500/10 text-green-600 border-green-500/20">
                {viewingContract?.reminder_enabled ? `Avisar ${viewingContract.renewal_notice_days} dias antes` : "Desativado"}
              </Badge>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Resumo da Inteligência Artificial
              </h4>
              {!viewingContract?.terms_summary && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateAISummary(viewingContract)}
                  disabled={summarizingId === viewingContract?.id}
                >
                  {summarizingId === viewingContract?.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Gerar Resumo Agora
                </Button>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-lg border border-primary/10 relative overflow-hidden min-h-[100px]">
              {viewingContract?.terms_summary ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed italic">
                    {viewingContract.terms_summary}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <Brain className="h-8 w-8 text-muted-foreground opacity-20" />
                  <p className="text-xs text-muted-foreground">O resumo da IA ainda não foi gerado para este contrato.</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            {viewingContract?.document_url && (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => window.open(viewingContract.document_url, '_blank')}
              >
                <File className="h-4 w-4 mr-2" />
                Abrir Arquivo Original
              </Button>
            )}
            <Button onClick={() => setViewingContract(null)} className="flex-1 sm:flex-none">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
