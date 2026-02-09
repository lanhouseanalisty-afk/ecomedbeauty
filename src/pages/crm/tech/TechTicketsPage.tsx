import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  FileText,
  Download,
  MessageSquare,
  Clock,
  AlertCircle,
  Send,
  User,
  TrendingUp,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTickets, useTicketCategories, useTicketMessages, useSendMessage, useTechTeam, useKBArticles, useTechAssets, useTicketHistory } from "@/hooks/useTech";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Bot, RefreshCw, Bookmark, AlertTriangle, FileQuestion, ShieldAlert, Zap } from "lucide-react";
import { useTicketAI } from "@/hooks/useTicketAI";


import { TechReports } from "@/components/crm/tech/TechReports";

export default function TechTicketsPage() {
  const { tickets, isLoading, createTicket, updateTicket } = useTickets();
  const { data: categories } = useTicketCategories();
  const { data: techTeam } = useTechTeam();
  const { data: kbArticles } = useKBArticles();
  const { assets } = useTechAssets();
  const { user } = useAuth();

  // SLA Summary Calculation
  const slaStats = tickets?.reduce((acc, ticket) => {
    const t = ticket as any;
    if (t.status === 'resolved' || t.status === 'closed' || !t.due_date) return acc;

    const dueDate = new Date(t.due_date);
    const now = new Date();
    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (dueDate < now) {
      acc.expired++;
      acc.expiredTickets.push(t);
    } else if (hoursRemaining < 4) {
      acc.warning++;
      acc.warningTickets.push(t);
    }
    return acc;
  }, { expired: 0, warning: 0, expiredTickets: [] as any[], warningTickets: [] as any[] });

  const [viewMode, setViewMode] = useState<'list' | 'reports'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Chat & History State
  const { data: messages, isLoading: isLoadingMessages } = useTicketMessages(selectedTicketId);
  const { data: history } = useTicketHistory(selectedTicketId);
  const sendMessage = useSendMessage();
  const [messageInput, setMessageInput] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [pastedImage, setPastedImage] = useState<string | null>(null);

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium",
    department: "",
    schedule: "",
    asset_id: "",
    parent_id: null as string | null
  });

  // KB Suggestions logic
  const kbSuggestions = kbArticles?.filter(article =>
    newTicket.title.length > 3 &&
    (article.title.toLowerCase().includes(newTicket.title.toLowerCase()) ||
      article.content.toLowerCase().includes(newTicket.title.toLowerCase()))
  ).slice(0, 3);

  const [ticketToClose, setTicketToClose] = useState<{ id: string, status: string, childrenIds: string[] } | null>(null);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const { analyzeTicket, isAnalyzing, analysis, clearAnalysis } = useTicketAI();
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      // ...
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isDetailsOpen]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const res = event.target.result as string;
              if (res.length > 2000000) {
                toast.error("Imagem muito grande. Tente recortar ou reduzir.");
                return;
              }
              setPastedImage(res);
              toast.success("Imagem colada!");
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleCreateTicket = () => {
    if (!user) return;

    if (!newTicket.title || !newTicket.description || !newTicket.category_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createTicket.mutate({
      title: newTicket.title,
      description: newTicket.description,
      category_id: newTicket.category_id,
      priority: newTicket.priority,
      requester_id: user.id,
      status: 'open',
      parent_id: newTicket.parent_id, // Added parent_id
      metadata: {
        department: newTicket.department,
        preferred_schedule: newTicket.schedule,
        screenshot: pastedImage
      },
      asset_id: newTicket.asset_id || null
    } as any, {
      onSuccess: () => {
        setIsNewTicketOpen(false);
        setNewTicket({
          title: "", description: "", category_id: "", priority: "medium", department: "", schedule: "", asset_id: "", parent_id: null
        });
        setPastedImage(null);
        toast.success("Ticket criado com sucesso!");
      }
    });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedTicketId || !user) return;

    sendMessage.mutate({
      ticket_id: selectedTicketId,
      content: messageInput,
      user_id: user.id,
      is_internal: isInternalNote
    }, {
      onSuccess: () => {
        setMessageInput("");
        setIsInternalNote(false);
      }
    });
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    open: { label: "Aberto", className: "bg-blue-100 text-blue-800 border-blue-200" },
    in_progress: { label: "Em Andamento", className: "bg-purple-100 text-purple-800 border-purple-200" },
    pending: { label: "Pendente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    resolved: { label: "Resolvido", className: "bg-green-100 text-green-800 border-green-200" },
    closed: { label: "Fechado", className: "bg-gray-100 text-gray-800 border-gray-200" },
  };

  const priorityMap: Record<string, { label: string; className: string }> = {
    low: { label: "Baixa", className: "text-gray-500" },
    medium: { label: "Média", className: "text-blue-500" },
    high: { label: "Alta", className: "text-orange-500 font-medium" },
    critical: { label: "Crítica", className: "text-red-500 font-bold" },
  };

  const filteredTickets = tickets?.filter(ticket => {
    const t = ticket as any;
    const matchesSearch =
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusTab === 'all' ||
      t.status === statusTab ||
      (statusTab === 'pending' && (t.status === 'pending_user' || t.status === 'pending_vendor'));

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDetailsOpen(true);
  };

  const handleFieldUpdate = (id: string, field: string, value: any) => {
    if (field.startsWith('metadata.')) {
      const metaKey = field.split('.')[1];
      const currentMeta = (selectedTicket as any)?.metadata || {};
      updateTicket.mutate({
        id,
        metadata: { ...currentMeta, [metaKey]: value }
      });
    } else {
      updateTicket.mutate({ id, [field]: value });
    }
  };

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    if (newStatus === 'resolved' || newStatus === 'closed') {
      // Check for open children
      const children = tickets?.filter(t => (t as any).parent_id === ticketId && (t.status === 'open' || t.status === 'in_progress' || t.status === 'pending_user' || t.status === 'pending_vendor'));

      if (children && children.length > 0) {
        setTicketToClose({ id: ticketId, status: newStatus, childrenIds: children.map(c => c.id) });
        setIsCloseDialogOpen(true);
        return;
      }
    }
    updateTicket.mutate({ id: ticketId, status: newStatus });
  };

  const confirmCloseWithChildren = () => {
    if (!ticketToClose) return;

    // Close Parent
    updateTicket.mutate({ id: ticketToClose.id, status: ticketToClose.status });

    // Close Children
    ticketToClose.childrenIds.forEach(childId => {
      updateTicket.mutate({ id: childId, status: ticketToClose.status });
    });

    setIsCloseDialogOpen(false);
    setTicketToClose(null);
    toast.success(`Ticket pai e ${ticketToClose.childrenIds.length} tickets filhos fechados.`);
  };

  const openChildTicketModal = () => {
    if (selectedTicket) {
      setNewTicket(prev => ({
        ...prev,
        parent_id: selectedTicket.id,
        title: `[Filho] Relacionado a: ${selectedTicket.title}`, // Optional: pre-fill title
        department: (selectedTicket as any).metadata?.department || ""
      }));
      setIsNewTicketOpen(true);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Gestão de Tickets</h1>
          <p className="text-muted-foreground">
            Central de suporte técnico e acompanhamento de chamados.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mr-2 border">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'white' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={`h-8 text-xs ${viewMode === 'list' ? 'shadow-sm' : 'text-muted-foreground'}`}
            >
              <FileText className="mr-2 h-3 w-3" />
              Tickets
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'reports' ? 'white' : 'ghost'}
              onClick={() => setViewMode('reports')}
              className={`h-8 text-xs ${viewMode === 'reports' ? 'shadow-sm' : 'text-muted-foreground'}`}
            >
              <TrendingUp className="mr-2 h-3 w-3" />
              Relatórios
            </Button>
          </div>

          <Button variant="outline" onClick={() => toast.info("Exportação em breve...")}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>


          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <Mail className="mr-2 h-4 w-4" />
                Integração E-mail
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-teal-600" />
                  Configurar Abertura por E-mail
                </DialogTitle>
                <DialogDescription>
                  Permita que chamados sejam abertos enviando um e-mail para um endereço específico.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 text-teal-900">Como funciona?</h4>
                  <p className="text-muted-foreground mb-2">
                    Você pode usar serviços como <strong>Zapier, Make.com ou Power Automate</strong> para monitorar uma caixa de entrada e enviar os dados para nosso sistema.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Configure o serviço para monitorar novos e-mails.</li>
                    <li>Extraia o <strong>Remetente</strong> (From), <strong>Assunto</strong> (Subject) e <strong>Corpo</strong> (Body).</li>
                    <li>Envie uma requisição <strong>POST</strong> para nossa URL de Webhook de E-mail.</li>
                    <li>O sistema criará o ticket vinculando-o ao e-mail do remetente cadastrado.</li>
                  </ol>
                </div>

                <div>
                  <Label>URL do Webhook de E-mail (Endpoint)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input readOnly value="https://[PROJECT_REF].supabase.co/functions/v1/email-webhook" className="font-mono bg-slate-100" />
                    <Button variant="secondary" onClick={() => {
                      navigator.clipboard.writeText("https://[PROJECT_REF].supabase.co/functions/v1/email-webhook");
                      toast.success("URL copiada!");
                    }}>Copiar</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Substitua [PROJECT_REF] pelo ID do seu projeto Supabase.</p>
                </div>

                <div>
                  <Label>Exemplo de Payload Necessário (JSON)</Label>
                  <pre className="bg-slate-900 text-slate-50 p-3 rounded-md mt-1 overflow-x-auto text-xs font-mono">
                    {`{
  "from": "funcionario@empresa.com",
  "subject": "Problema no Outlook",
  "body": "Não consigo enviar e-mails desde hoje cedo.",
  "priority": "medium"
}`}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {newTicket.parent_id ? "Abrir Ticket Filho (Vinculado)" : "Abrir Novo Chamado"}
                </DialogTitle>
                <DialogDescription>
                  {newTicket.parent_id
                    ? "Este ticket será vinculado ao chamado pai para rastreamento conjunto."
                    : "Descreva o problema detalhadamente para agilizar o atendimento."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título do Problema *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Impressora não conecta"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />

                  {kbSuggestions && kbSuggestions.length > 0 && (
                    <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-md p-3 animate-in fade-in slide-in-from-top-1">
                      <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Bookmark className="h-3 w-3" /> Sugestões da Base de Conhecimento
                      </p>
                      <div className="space-y-2">
                        {kbSuggestions.map((article: any) => (
                          <div
                            key={article.id}
                            className="bg-white p-2 rounded border border-indigo-200 shadow-sm flex items-center justify-between group hover:border-indigo-400 transition-colors cursor-pointer"
                            onClick={() => window.open(`/kb/${article.id}`, '_blank')}
                          >
                            <span className="text-xs font-medium text-slate-700 truncate mr-2">{article.title}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Setor / Departamento</Label>
                    <Input
                      placeholder="Ex: Comercial, RH..."
                      value={newTicket.department}
                      onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Horário Ideal para Atendimento</Label>
                    <Input
                      placeholder="Ex: 08:00 às 12:00"
                      value={newTicket.schedule}
                      onChange={(e) => setNewTicket({ ...newTicket, schedule: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Categoria *</Label>
                    <Select
                      value={newTicket.category_id}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label>Vincular Ativo (Opcional)</Label>
                    <Select
                      value={newTicket.asset_id}
                      onValueChange={(value) => setNewTicket({ ...newTicket, asset_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um equipamento..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {assets?.map((asset: any) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            [{asset.asset_tag}] {asset.model} - {asset.serial_number || 'S/N'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição Detalhada *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Descreva o que aconteceu..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Print do Erro (Cole aqui com Ctrl+V)</Label>
                  <div
                    className="border-2 border-dashed rounded-md h-32 flex flex-col items-center justify-center text-muted-foreground cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                    onPaste={handlePaste}
                    tabIndex={0}
                  >
                    {pastedImage ? (
                      <div className="relative h-full w-full p-2 flex items-center justify-center group">
                        <img src={pastedImage} alt="Print" className="max-h-full max-w-full object-contain" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPastedImage(null);
                          }}
                        >
                          <span className="sr-only">Remover</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center pointer-events-none">
                        <p className="text-sm font-medium">Clique aqui e pressione Ctrl+V</p>
                        <p className="text-xs">para colar um print da tela</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTicket} disabled={createTicket.isPending}>
                  {createTicket.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {
        slaStats && (slaStats.expired > 0 || slaStats.warning > 0) && (
          <Alert variant={slaStats.expired > 0 ? "destructive" : "default"} className={`border-l-4 ${slaStats.expired > 0 ? 'border-l-red-600 bg-red-50' : 'border-l-orange-500 bg-orange-50'}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção aos Prazos!</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              {slaStats.expired > 0 && (
                <div className="text-red-700">
                  <span className="font-semibold block mb-1">
                    {slaStats.expired} chamado(s) com SLA vencido! Priorize imediatamente:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {slaStats.expiredTickets.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => handleRowClick(t.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded-md border border-red-200 transition-colors font-mono"
                      >
                        #{t.ticket_number || t.id.slice(0, 8)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {slaStats.warning > 0 && (
                <div className="text-orange-700">
                  <span className="font-medium block mb-1">
                    {slaStats.warning} chamado(s) vencendo nas próximas 4 horas:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {slaStats.warningTickets.map((t: any) => (
                      <button
                        key={t.id}
                        onClick={() => handleRowClick(t.id)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded-md border border-orange-200 transition-colors font-mono"
                      >
                        #{t.ticket_number || t.id.slice(0, 8)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )
      }

      {
        viewMode === 'list' ? (
          <Card className="border-t-4 border-t-primary shadow-md">
            <CardHeader className="pb-3 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Meus Chamados</CardTitle>
                  <CardDescription>Acompanhe o status e SLA dos seus tickets.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por ID ou Título..."
                      className="pl-9 w-[250px] bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" value={statusTab} onValueChange={setStatusTab} className="w-full">
                <TabsList className="w-full justify-start bg-transparent p-0 border-b rounded-none h-auto px-4">
                  <TabsTrigger
                    value="all"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Todos
                  </TabsTrigger>
                  <TabsTrigger
                    value="open"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Abertos
                  </TabsTrigger>
                  <TabsTrigger
                    value="in_progress"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Em Andamento
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Pendentes
                  </TabsTrigger>
                  <TabsTrigger
                    value="resolved"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Resolvidos
                  </TabsTrigger>
                  <TabsTrigger
                    value="closed"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                  >
                    Fechados
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={statusTab} className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="w-[120px]">ID</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Abertura</TableHead>
                        <TableHead>Previsão (SLA)</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              Carregando tickets...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredTickets?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <FileText className="h-8 w-8 text-slate-300" />
                              <p>Nenhum ticket encontrado com os filtros atuais.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTickets?.map((ticket) => {
                          const t = ticket as any;
                          const status = statusMap[t.status || 'open'] || statusMap.open;
                          const priority = priorityMap[t.priority || 'medium'] || priorityMap.medium;

                          return (
                            <TableRow
                              key={t.id}
                              className="cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => handleRowClick(t.id)}
                            >
                              <TableCell className="font-mono font-medium text-primary">
                                {t.ticket_number || t.id.slice(0, 8)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {t.title}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">
                                  {t.category?.name || '-'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className={`text-xs flex items-center gap-1 ${priority.className}`}>
                                  <AlertCircle className="h-3 w-3" />
                                  {priority.label}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${status.className} border`}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {t.created_at ? format(new Date(t.created_at), "dd/MM/yyyy HH:mm") : '-'}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {t.due_date ? (
                                  (() => {
                                    const dueDate = new Date(t.due_date);
                                    const now = new Date();
                                    const isResolved = t.status === 'resolved' || t.status === 'closed';
                                    const hoursRemaining = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

                                    if (isResolved) {
                                      return <span className="text-muted-foreground">{format(dueDate, "dd/MM/yyyy HH:mm")}</span>;
                                    }

                                    if (dueDate < now) {
                                      return (
                                        <div className="flex items-center gap-1 text-red-600 font-bold animate-pulse">
                                          <AlertCircle className="h-3 w-3" />
                                          <span>{format(dueDate, "dd/MM/yyyy HH:mm")}</span>
                                        </div>
                                      );
                                    }

                                    if (hoursRemaining < 4) {
                                      return (
                                        <div className="flex items-center gap-1 text-orange-600 font-bold">
                                          <Clock className="h-3 w-3" />
                                          <span>{format(dueDate, "dd/MM/yyyy HH:mm")}</span>
                                        </div>
                                      );
                                    }

                                    return <span className="text-muted-foreground">{format(dueDate, "dd/MM/yyyy HH:mm")}</span>;
                                  })()
                                ) : '-'}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" onClick={() => handleRowClick(t.id)}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <TechReports />
        )
      }

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-[800px] w-full  overflow-hidden flex flex-col p-0 gap-0">
          <SheetHeader className="p-6 border-b bg-slate-50/50">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-white">
                  {(selectedTicket as any)?.ticket_number || "Ticket"}
                </Badge>
                {(selectedTicket as any)?.priority && (
                  <Badge variant="outline" className={`capitalize ${(selectedTicket as any).priority === 'critical' ? 'text-red-600 border-red-200 bg-red-50' : ''}`}>
                    {(selectedTicket as any).priority}
                  </Badge>
                )}
                {(selectedTicket as any)?.metadata?.ticket_type && (
                  <Badge variant="secondary" className="capitalize flex items-center gap-1">
                    {(() => {
                      const type = (selectedTicket as any).metadata.ticket_type;
                      if (type === 'implantation') return <><Zap className="h-3 w-3" /> Implantação</>;
                      if (type === 'request') return <><FileQuestion className="h-3 w-3" /> Requisição</>;
                      if (type === 'problem') return <><AlertTriangle className="h-3 w-3" /> Problema</>;
                      if (type === 'incident') return <><ShieldAlert className="h-3 w-3" /> Incidente</>;
                      return type;
                    })()}
                  </Badge>
                )}
              </div>

              {/* Status Selector - Native HTML to prevent crashes */}
              <div className="flex items-center gap-2">
                <select
                  className="h-8 w-[140px] text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={(selectedTicket as any)?.status || 'open'}
                  onChange={(e) => {
                    if (!selectedTicket) return;
                    handleStatusChange(selectedTicket.id, e.target.value);
                  }}
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="pending_user">Pendente (Usuário)</option>
                  <option value="pending_vendor">Pendente (Fornecedor)</option>
                  <option value="resolved">Resolvido</option>
                  <option value="closed">Fechado</option>
                </select>
              </div>
            </div>
            <SheetTitle className="text-xl">
              {selectedTicket?.title || "Carregando..."}
            </SheetTitle>
            <SheetDescription className="line-clamp-2">
              {selectedTicket?.description}
            </SheetDescription>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" onClick={openChildTicketModal}>
                <Plus className="mr-1 h-3 w-3" /> Criar Ticket Filho
              </Button>
              {(selectedTicket as any)?.parent_id && (
                <Badge variant="secondary" className="ml-auto">
                  Ticket Filho
                </Badge>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
            {selectedTicket ? (
              <>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">

                    {/* AI COPILOT SECTION */}
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 ${isAnalyzing ? 'animate-pulse' : ''}`}
                        onClick={() => {
                          if (!showAnalysis && !analysis) {
                            analyzeTicket(selectedTicket);
                          }
                          setShowAnalysis(!showAnalysis);
                        }}
                      >
                        {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        {isAnalyzing ? "Analisando..." : (analysis || showAnalysis) ? "Ocultar Copilot" : "IA Copilot"}
                      </Button>
                    </div>

                    {showAnalysis && (
                      <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="flex items-center gap-2 mb-3 text-indigo-800 font-semibold">
                          <Bot className="h-5 w-5" />
                          <h3>Análise Inteligente</h3>
                        </div>

                        {isAnalyzing && !analysis ? (
                          <div className="flex flex-col items-center justify-center py-4 text-indigo-400 gap-2">
                            <RefreshCw className="h-6 w-6 animate-spin" />
                            <p className="text-sm">Lendo ticket e consultando base de conhecimento...</p>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                            {analysis}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ticket Info Card */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">

                      {/* Metadata Grid for TI Management */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-b pb-6">
                        {/* Requester Info */}
                        <div className="col-span-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Solicitante</p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={(selectedTicket as any).requester?.avatar_url} />
                              <AvatarFallback className="text-[10px]">{(selectedTicket as any).requester?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                              <p className="text-sm font-semibold truncate">{(selectedTicket as any).requester?.full_name || 'Usuário'}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{(selectedTicket as any).requester?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Operator / Assigned To */}
                        <div className="col-span-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operador Responsável</p>
                            <button
                              onClick={() => handleFieldUpdate(selectedTicket.id, 'assigned_to', user?.id)}
                              className="text-[9px] text-primary hover:underline font-medium"
                            >
                              Me atribuir
                            </button>
                          </div>
                          <select
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.assigned_to || ''}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'assigned_to', e.target.value || null)}
                          >
                            <option value="">Não atribuído</option>
                            {techTeam?.map((tech: any) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Priority */}
                        <div className="col-span-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridade</p>
                          <select
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.priority || 'medium'}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'priority', e.target.value)}
                          >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="critical">Crítica</option>
                          </select>
                        </div>

                        {/* Ticket Type */}
                        <div className="col-span-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Ticket</p>
                          <select
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.metadata?.ticket_type || ''}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'metadata.ticket_type', e.target.value)}
                          >
                            <option value="">Não definido</option>
                            <option value="implantation">Implantação</option>
                            <option value="request">Requisição</option>
                            <option value="problem">Problema</option>
                            <option value="incident">Incidente</option>
                          </select>
                        </div>

                        {/* Category */}
                        <div className="col-span-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Categoria</p>
                          <select
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.category_id || ''}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'category_id', e.target.value)}
                          >
                            <option value="">Sem categoria</option>
                            {categories?.map((cat: any) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Asset Linkage */}
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Equipamento Vinculado</p>
                          <select
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.asset_id || ''}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'asset_id', e.target.value || null)}
                          >
                            <option value="">Nenhum equipamento vinculado</option>
                            {assets?.map((asset: any) => (
                              <option key={asset.id} value={asset.id}>
                                [{asset.asset_tag}] {asset.model} - {asset.serial_number || 'S/N'}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* SLA Due Override */}
                        <div className="col-span-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vencimento SLA</p>
                          <input
                            type="datetime-local"
                            className="w-full h-8 text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                            value={(selectedTicket as any)?.sla_resolution_due ? new Date((selectedTicket as any).sla_resolution_due).toISOString().slice(0, 16) : ''}
                            onChange={(e) => handleFieldUpdate(selectedTicket.id, 'sla_resolution_due', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-foreground">Descrição Original</h3>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(selectedTicket.created_at), "d 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {selectedTicket.description}
                      </p>

                      {(selectedTicket as any).metadata?.screenshot && (
                        <div className="mt-4 border rounded-md p-2 bg-slate-50">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Print do Erro:</p>
                          <img
                            src={(selectedTicket as any).metadata.screenshot}
                            alt="Screenshot"
                            className="max-w-full rounded border cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              const w = window.open("");
                              w?.document.write(`<img src="${(selectedTicket as any).metadata.screenshot}" />`);
                            }}
                          />
                        </div>
                      )}

                    </div>

                    <div className="relative py-2">
                      <Tabs defaultValue="messages" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="messages">Mensagens</TabsTrigger>
                          <TabsTrigger value="history">Histórico</TabsTrigger>
                        </TabsList>

                        <TabsContent value="messages" className="mt-4 space-y-4">
                          {/* Messages List moved inside here */}
                        </TabsContent>

                        <TabsContent value="history" className="mt-4 space-y-2">
                          {history?.map((h: any) => (
                            <div key={h.id} className="flex gap-3 text-xs border-b pb-2 last:border-0">
                              <div className="h-2 w-2 rounded-full bg-slate-300 mt-1" />
                              <div className="flex-1">
                                <p className="font-semibold text-slate-700">
                                  {h.user?.full_name || 'Sistema'}
                                </p>
                                <p className="text-muted-foreground italic">
                                  {h.action === 'status_change' && `Alterou status de ${h.old_value} para ${h.new_value}`}
                                  {h.action === 'assignment_change' && `Atribuiu ticket para ${h.new_value || 'Ninguém'}`}
                                  {h.action === 'priority_change' && `Alterou prioridade para ${h.new_value}`}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {format(new Date(h.created_at), "dd/MM HH:mm")}
                                </p>
                              </div>
                            </div>
                          ))}
                          {(!history || history.length === 0) && (
                            <div className="text-center py-4 text-muted-foreground">Sem histórico registrado.</div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Messages List */}
                    <div className="space-y-4 pb-4">
                      {isLoadingMessages ? (
                        <div className="flex justify-center p-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : messages?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg bg-slate-50/50">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          Nenhuma interação registrada ainda.
                        </div>
                      ) : (
                        messages?.map((msg) => {
                          const isSystem = msg.content.startsWith('Sistema:') || (msg as any).is_internal;
                          const isMe = msg.user_id === user?.id;

                          if (isSystem) {
                            return (
                              <div key={msg.id} className="flex justify-center my-4">
                                <span className="text-[11px] text-muted-foreground bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {msg.content.replace('Sistema: ', '')}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className={isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                    {isMe ? <User className="h-4 w-4" /> : 'T'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`relative rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                  ? (msg.is_internal ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tr-none' : 'bg-primary text-primary-foreground rounded-tr-none')
                                  : 'bg-white border rounded-tl-none'
                                  }`}>
                                  {msg.is_internal && (
                                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mb-1 opacity-70">
                                      <ShieldAlert className="h-3 w-3" /> Nota Interna
                                    </div>
                                  )}
                                  <p>{msg.content}</p>
                                  <span className={`text-[10px] block mt-1 ${isMe && !msg.is_internal ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {format(new Date(msg.created_at), "HH:mm")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={scrollRef} />
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 bg-white border-t mt-auto">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="internal"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="internal" className="text-[10px] font-medium text-slate-500 cursor-pointer flex items-center gap-1">
                        <ShieldAlert className="h-3 w-3" /> Nota Interna (Privada)
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2 items-end">
                    <Textarea
                      placeholder="Digite sua resposta..."
                      className="min-h-[80px] resize-none focus-visible:ring-primary"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="h-[80px] w-[60px]"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessage.isPending}
                    >
                      {sendMessage.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Pressione Enter para enviar. Shift+Enter para quebra de linha.
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>


      <AlertDialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Existem Tickets Filhos Abertos</AlertDialogTitle>
            <AlertDialogDescription>
              Este chamado possui {ticketToClose?.childrenIds.length} tickets filhos que ainda estão abertos.
              Ao fechar este chamado pai, o sistema recomenda fechar todos os filhos também.
              Deseja encerrar todos os tickets relacionados?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCloseDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseWithChildren} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Sim, Fechar Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
}
