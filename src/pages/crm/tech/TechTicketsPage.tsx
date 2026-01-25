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
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTickets, useTicketCategories, useTicketMessages, useSendMessage } from "@/hooks/useTech";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { TechReports } from "@/components/crm/tech/TechReports";

export default function TechTicketsPage() {
  const { tickets, isLoading, createTicket, updateTicket } = useTickets();
  const { data: categories } = useTicketCategories();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'reports'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Chat State
  const { data: messages, isLoading: isLoadingMessages } = useTicketMessages(selectedTicketId);
  const sendMessage = useSendMessage();
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [pastedImage, setPastedImage] = useState<string | null>(null);

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium",
    department: "",
    schedule: ""
  });

  useEffect(() => {
    if (scrollRef.current) {
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
              // Limit size roughly (checking string length ~ 500kb-1mb limit is safe for jsonb but better to warn)
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
      metadata: {
        department: newTicket.department,
        preferred_schedule: newTicket.schedule,
        screenshot: pastedImage
      }
    } as any, {
      onSuccess: () => {
        setIsNewTicketOpen(false);
        setNewTicket({
          title: "", description: "", category_id: "", priority: "medium", department: "", schedule: ""
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
      user_id: user.id
    }, {
      onSuccess: () => {
        setMessageInput("");
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

    const matchesStatus = statusTab === 'all' || t.status === statusTab;

    return matchesSearch && matchesStatus;
  });

  const handleRowClick = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setIsDetailsOpen(true);
  };

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

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
              <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                <MessageSquare className="mr-2 h-4 w-4" />
                Integração Teams
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  Integração Microsoft Teams
                </DialogTitle>
                <DialogDescription>
                  Permita que seus funcionários abram chamados diretamente pelo Microsoft Teams.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 text-sm">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2 text-indigo-900">Como funciona?</h4>
                  <p className="text-muted-foreground mb-2">
                    Você pode configurar um <strong>Workflow no Power Automate</strong> (no Teams) para enviar um formulário para nosso sistema.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700">
                    <li>Crie um "Adaptive Card" no Teams com campos: Título, Descrição e Prioridade.</li>
                    <li>Configure o Workflow para enviar uma requisição <strong>POST</strong> para nossa URL de Webhook.</li>
                    <li>O sistema identificará o funcionário pelo e-mail e criará o ticket automaticamente.</li>
                  </ol>
                </div>

                <div>
                  <Label>URL do Webhook (Endpoint)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input readOnly value="https://[PROJECT_REF].supabase.co/functions/v1/teams-webhook" className="font-mono bg-slate-100" />
                    <Button variant="secondary" onClick={() => {
                      navigator.clipboard.writeText("https://[PROJECT_REF].supabase.co/functions/v1/teams-webhook");
                      toast.success("URL copiada!");
                    }}>Copiar</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Substitua [PROJECT_REF] pelo ID do seu projeto Supabase.</p>
                </div>

                <div>
                  <Label>Exemplo de Payload (JSON)</Label>
                  <pre className="bg-slate-900 text-slate-50 p-3 rounded-md mt-1 overflow-x-auto text-xs font-mono">
                    {`{
  "email": "funcionario@empresa.com",
  "title": "Computador não liga",
  "description": "Ao tentar ligar, faz bip e desliga.",
  "priority": "high",
  "department": "Comercial"
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
                <DialogTitle>Abrir Novo Chamado</DialogTitle>
                <DialogDescription>
                  Descreva o problema detalhadamente para agilizar o atendimento.
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

      {viewMode === 'list' ? (
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
                                <span className={new Date(t.due_date) < new Date() && t.status !== 'resolved' ? "text-red-500 font-bold" : ""}>
                                  {format(new Date(t.due_date), "dd/MM/yyyy HH:mm")}
                                </span>
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
      )}

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
              </div>

              {/* Status Selector - Native HTML to prevent crashes */}
              <div className="flex items-center gap-2">
                <select
                  className="h-8 w-[140px] text-xs border rounded-md px-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={(selectedTicket as any)?.status || 'open'}
                  onChange={(e) => {
                    if (!selectedTicket) return;
                    (updateTicket as any).mutate({ id: selectedTicket.id, status: e.target.value });
                  }}
                >
                  <option value="open">Aberto</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="pending">Pendente</option>
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
          </SheetHeader>

          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
            {selectedTicket ? (
              <>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Ticket Info Card */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">

                      {/* Metadata Row */}
                      <div className="grid grid-cols-2 gap-4 border-b pb-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Solicitante</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={(selectedTicket as any).requester?.avatar_url} />
                              <AvatarFallback className="text-[10px]">{(selectedTicket as any).requester?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold">{(selectedTicket as any).requester?.full_name || 'Usuário'}</p>
                              <p className="text-[10px] text-muted-foreground">{(selectedTicket as any).requester?.email}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Setor</p>
                          <p className="text-sm font-semibold">{(selectedTicket as any).metadata?.department || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Horário Pref.</p>
                          <p className="text-sm font-semibold">{(selectedTicket as any).metadata?.preferred_schedule || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase">Prioridade</p>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {(selectedTicket as any).priority}
                          </Badge>
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
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-50/30 px-2 text-muted-foreground">Histórico de Mensagens</span>
                      </div>
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
                                <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe
                                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                                  : 'bg-white border rounded-tl-none'
                                  }`}>
                                  <p>{msg.content}</p>
                                  <span className={`text-[10px] block mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
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
    </div>
  );
}
