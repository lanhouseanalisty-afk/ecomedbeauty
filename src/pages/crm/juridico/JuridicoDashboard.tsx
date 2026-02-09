import { useState } from "react";
import { useLocation } from "react-router-dom";
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
import emailjs from '@emailjs/browser';
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
import { useContracts, useLegalStats, useLegalDistribution } from "@/hooks/useJuridico";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";


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
  const { data: realComplianceData } = useLegalDistribution();

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

    try {
      // Direct Client-Side Call to Google Gemini (Bypassing Supabase Function issues)
      const API_KEY = "AIzaSyBNT7p3CJRZuDBqOuwgZ5VPK5DM1SKYA3M"; // Key #3

      const systemPrompt = 'Você é um assistente jurídico sênior especializado em gestão de contratos da MedBeauty. Sua função é analisar metadados de contratos e gerar resumos executivos claros e objetivos. Identifique explicitamente datas críticas e valores financeiros.';

      const userMessage = `Analise o seguinte contrato e gere um resumo executivo destacando os pontos principais, riscos e prazos.
              
              Dados do Contrato:
              - Título: ${contract.title}
              - Parte: ${contract.party_name}
              - Tipo: ${contract.type}
              - Valor: ${contract.value ? formatCurrency(contract.value) : 'Não informado'}
              - Início: ${formatDate(contract.start_date)}
              - Fim: ${contract.end_date ? formatDate(contract.end_date) : 'Indeterminado'}
              - Número: ${contract.contract_number}
              
              Seja conciso, profissional e foque no que um gestor precisa saber.`;

      // Strategy: Try the newly discovered 2.5 models, then 2.0
      // List from API: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro", "gemini-2.0-flash-001"];
      let summary = null;
      let errorLog = [];

      for (const model of modelsToTry) {
        try {
          // Using 'v1beta' endpoint
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: "user",
                parts: [{ text: `[INSTRUÇÃO]: ${systemPrompt}\n\n[CONTRATO]: ${userMessage}` }]
              }]
            })
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const msg = errData.error?.message || `Status ${response.status}`;

            // Specific handling for Rate Limit (Quota)
            if (response.status === 429) {
              console.warn(`Model ${model} hit rate limit. Waiting 2s before next...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
            }

            errorLog.push(`${model}: ${msg}`);
            continue;
          }

          const json = await response.json();
          summary = json.candidates?.[0]?.content?.parts?.[0]?.text;

          if (summary) break; // Success

        } catch (e: any) {
          errorLog.push(`${model}: ${e.message}`);
        }
      }

      if (!summary) {
        const isQuota = errorLog.some(e => e.includes('429') || e.includes('Quota') || e.includes('quota'));
        if (isQuota) throw new Error("LIMITE_COTA");
        throw new Error(errorLog.map(e => `[${e}]`).join(' | '));
      }

      await updateContract.mutateAsync({
        id: contract.id,
        updates: { terms_summary: summary }
      });

      setViewingSummary({
        title: contract.title,
        content: summary
      });

      toast.success("Análise jurídica concluída com sucesso!");

    } catch (error: any) {
      console.error('Erro na IA:', error);
      if (error.message === "LIMITE_COTA") {
        toast.error("Limite gratuito atingido. Aguarde 1min.");
      } else {
        toast.error("Erro ao gerar análise: " + error.message.substring(0, 100) + "...");
      }
    } finally {
      setSummarizingId(null);
    }
  };

  const handleTestReminder = async (contract: any) => {
    // Hardcoded fallbacks to avoid breaking Supabase with local .env files
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_rhfqucq";
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_e60twuf";
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "q6l2XIrfR0caK9qKs";

    console.log("DEBUG: handleTestReminder triggered v2.2 (with fallbacks)", {
      hasService: !!serviceId,
      hasTemplate: !!templateId,
      hasKey: !!publicKey,
      to_email: contract.reminder_email
    });

    if (!contract.reminder_email) {
      toast.error("Defina um e-mail para receber o lembrete antes de testar.");
      return;
    }

    if (!serviceId || !templateId || !publicKey) {
      toast.error("Configuração EmailJS incompleta (.env). Verifique SERVICE_ID, TEMPLATE_ID e PUBLIC_KEY.");
      console.error("DEBUG: Missing EmailJS env vars", { serviceId, templateId, publicKey });
      return;
    }

    const templateParams = {
      to_email: contract.reminder_email,
      to_name: contract.party_name,
      contract_title: contract.title,
      contract_number: contract.contract_number,
      expiry_date: formatDate(contract.end_date),
      notice_days: contract.renewal_notice_days,
      link_dashboard: window.location.href
    };

    const promise = emailjs.send(serviceId, templateId, templateParams, publicKey);

    toast.promise(promise, {
      loading: 'Enviando lembrete via EmailJS (v2.1)...',
      success: (res) => {
        console.log("DEBUG: EmailJS Success:", res);
        return "E-mail de teste enviado com sucesso!";
      },
      error: (err: any) => {
        console.error("DEBUG: EmailJS Error Details:", err);
        const detailedError = err?.text || (typeof err === 'object' ? JSON.stringify(err) : String(err));
        return `Falha no EmailJS: ${detailedError.substring(0, 80)}`;
      }
    });
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

  const location = useLocation();
  const isContractsPage = location.pathname.includes('/contratos');

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            {isContractsPage ? "Gestão de Contratos" : "Jurídico"}
          </h1>
          <p className="text-muted-foreground">
            {isContractsPage ? "Visualize e gerencie todos os contratos da empresa" : "Contratos, casos e compliance"}
          </p>
        </div>
        {!isContractsPage && (
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        )}

        {isContractsPage && (
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
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Button>
            {/* Replicated dialog trigger and content for contracts page scope */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
        )}
      </div>

      {!isContractsPage && (
        <>
          <QuickStats stats={quickStats} />
          <div className="grid gap-6 lg:grid-cols-2">
            <KPIChart
              title="Status de Compliance"
              description="Distribuição real por status de conformidade"
              data={realComplianceData || []}
              type="pie"
            />
            <Card>
              <CardHeader>
                <CardTitle>Alertas Jurídicos</CardTitle>
                <CardDescription>Itens que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.expiringContracts > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Contratos a vencer</p>
                      <p className="text-xs text-muted-foreground">{stats.expiringContracts} contratos vencem nos próximos 30 dias</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("expiring")}>Ver</Button>
                  </div>
                )}
                {stats?.openCases > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <Clock className="h-5 w-5 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Processos Ativos</p>
                      <p className="text-xs text-muted-foreground">{stats.openCases} casos jurídicos em andamento</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/crm/juridico/casos")}>Ver</Button>
                  </div>
                )}
                {contracts?.filter(c => c.status === 'pending_signature').length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-info/5 rounded-lg border border-info/20">
                    <FileSignature className="h-5 w-5 text-info flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Assinaturas pendentes</p>
                      <p className="text-xs text-muted-foreground">
                        {contracts.filter(c => c.status === 'pending_signature').length} contratos aguardando assinatura
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSearchTerm("pending_signature")}>Ver</Button>
                  </div>
                )}
                {!stats?.expiringContracts && !stats?.openCases && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Tudo em dia!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card className={isContractsPage ? "border-t-4 border-t-primary/20 shadow-md" : ""}>
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
                              <DropdownMenuItem
                                onClick={() => handleTestReminder(contract)}
                                className="text-muted-foreground"
                              >
                                <Bell className="h-4 w-4 mr-2" />
                                Testar Lembrete
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
        <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20 border-primary/20">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner border border-primary/20">
                  <Brain className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-serif">Resumo Inteligente</DialogTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" /> Gerado por MedBeauty AI Engine
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 font-mono text-[10px] uppercase tracking-tighter">
                Análise de Contrato
              </Badge>
            </div>
            <DialogDescription className="text-sm font-medium border-l-2 border-primary/30 pl-3 py-1">
              Contrato: <span className="text-foreground">{viewingSummary?.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="relative group">
              <div className="max-h-[50vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 transition-colors bg-white/40 dark:bg-black/20 p-6 rounded-2xl border border-primary/10 backdrop-blur-sm shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-sm font-sans tracking-wide space-y-4">
                    {viewingSummary?.content}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 right-7 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 hover:bg-primary/10 hover:text-primary backdrop-blur border border-primary/10"
                onClick={() => {
                  if (viewingSummary?.content) {
                    navigator.clipboard.writeText(viewingSummary.content);
                    toast.success("Copiado para a área de transferência!");
                  }
                }}
              >
                <Plus className="h-3 w-3 mr-1 rotate-45" /> Copiar Texto
              </Button>
            </div>
          </div>

          <DialogFooter className="bg-primary/5 p-4 flex items-center justify-between mt-2 border-t border-primary/10">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary" />
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-background flex items-center justify-center">
                  <Scale className="w-3 h-3 text-blue-500" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">
                Análise baseada em metadados. Revise sempre o documento original.
              </p>
            </div>
            <Button
              onClick={() => setViewingSummary(null)}
              className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
            >
              Concluído
            </Button>
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
