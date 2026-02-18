import { useState } from "react";
import {
  Headphones,
  Plus,
  TicketCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Loader2,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useTickets, useTicketCategories, useTicketStats } from "@/hooks/useTech";
import { useAuth } from "@/contexts/AuthContext";

export default function TechDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tickets, isLoading, createTicket } = useTickets();
  const { data: categories } = useTicketCategories();
  const { data: stats } = useTicketStats();
  const { user } = useAuth();

  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category_id: "",
    priority: "medium" as const,
  });

  const handleCreateTicket = () => {
    if (!user) return;

    createTicket.mutate({
      ...newTicket,
      requester_id: user.id,
      status: 'open',
    } as any, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewTicket({
          title: "",
          description: "",
          category_id: "",
          priority: "medium",
        });
      }
    });
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      open: { label: "Aberto", className: "bg-info/10 text-info" },
      in_progress: { label: "Em Andamento", className: "bg-primary/10 text-primary" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      resolved: { label: "Resolvido", className: "bg-success/10 text-success" },
      closed: { label: "Fechado", className: "bg-muted text-muted-foreground" },
    };
    const config = statusMap[status || 'open'] || { label: status || 'Aberto', className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string | null) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-info/10 text-info" },
      high: { label: "Alta", className: "bg-warning/10 text-warning" },
      critical: { label: "Crítica", className: "bg-destructive/10 text-destructive" },
    };
    const config = priorityMap[priority || 'medium'] || { label: priority || 'Média', className: "" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const statCards = [
    { title: "Tickets Abertos", value: stats?.open || 0, icon: TicketCheck, color: "text-primary" },
    { title: "Em Andamento", value: stats?.inProgress || 0, icon: Clock, color: "text-info" },
    { title: "Resolvidos", value: stats?.resolved || 0, icon: CheckCircle2, color: "text-success" },
    { title: "Críticos", value: stats?.critical || 0, icon: AlertCircle, color: "text-destructive" },
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
          <h1 className="font-serif text-3xl font-bold">Tech TI</h1>
          <p className="text-muted-foreground">Gestão de tickets e base de conhecimento</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestor: Marcelo Ravagnani</Badge>
          <Button onClick={() => window.location.href = "/crm/intranet/contratos/novo?sector=tech"} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Solicitar Contrato
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Novo Ticket</DialogTitle>
                <DialogDescription>
                  Abra um novo chamado de suporte.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newTicket.category_id}
                      onValueChange={(value) => setNewTicket({ ...newTicket, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}
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
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>Sistema de chamados e suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({tickets?.length || 0})</TabsTrigger>
              <TabsTrigger value="open">Abertos ({tickets?.filter(t => t.status === 'open').length || 0})</TabsTrigger>
              <TabsTrigger value="in_progress">Em Andamento ({tickets?.filter(t => t.status === 'in_progress').length || 0})</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos ({tickets?.filter(t => t.status === 'resolved').length || 0})</TabsTrigger>
            </TabsList>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum ticket encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(ticket as any).category?.name || '-'}</Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Responder</DropdownMenuItem>
                            <DropdownMenuItem>Atribuir</DropdownMenuItem>
                            <DropdownMenuItem>Alterar Prioridade</DropdownMenuItem>
                            <DropdownMenuItem>Fechar Ticket</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
