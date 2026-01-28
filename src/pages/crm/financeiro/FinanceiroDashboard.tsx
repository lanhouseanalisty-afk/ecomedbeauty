import { useState } from "react";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useInvoices, useFinancialStats } from "@/hooks/useFinanceiro";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const cashFlowData = [
  { name: "Jan", value: 42000 },
  { name: "Fev", value: 55000 },
  { name: "Mar", value: 48000 },
  { name: "Abr", value: 62000 },
  { name: "Mai", value: 71000 },
  { name: "Jun", value: 85000 },
];

export default function FinanceiroDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { invoices, isLoading, createInvoice } = useInvoices();
  const { data: stats } = useFinancialStats();

  const [newInvoice, setNewInvoice] = useState({
    invoice_number: "",
    type: "receivable",
    subtotal: 0,
    total: 0,
    due_date: new Date().toISOString().split('T')[0],
  });

  const handleCreateInvoice = () => {
    createInvoice.mutate({
      invoice_number: newInvoice.invoice_number || `INV-${Date.now()}`,
      type: newInvoice.type,
      subtotal: newInvoice.subtotal,
      total: newInvoice.total || newInvoice.subtotal,
      due_date: newInvoice.due_date,
      status: 'pending',
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewInvoice({
          invoice_number: "",
          type: "receivable",
          subtotal: 0,
          total: 0,
          due_date: new Date().toISOString().split('T')[0],
        });
      }
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-success/10 text-success hover:bg-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        );
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const quickStats = [
    {
      title: "A Receber",
      value: formatCurrency(stats?.receivable || 0),
      icon: TrendingUp,
      trend: { value: 12 },
      color: "text-success"
    },
    {
      title: "A Pagar",
      value: formatCurrency(stats?.payable || 0),
      icon: TrendingDown,
      trend: { value: -8 },
      color: "text-destructive"
    },
    {
      title: "Saldo",
      value: formatCurrency(stats?.balance || 0),
      icon: DollarSign,
      trend: { value: 18 },
      color: "text-primary"
    },
    {
      title: "Vencidos",
      value: formatCurrency(stats?.overdue || 0),
      icon: Receipt,
      description: "Requer atenção",
      color: "text-warning"
    },
  ];

  const filteredInvoices = invoices?.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || inv.type === activeTab;
    return matchesSearch && matchesTab;
  }) || [];

  const exportColumns = [
    { key: 'invoice_number', label: 'Nº Fatura' },
    { key: 'type', label: 'Tipo' },
    { key: 'total', label: 'Valor' },
    { key: 'due_date', label: 'Vencimento' },
    { key: 'status', label: 'Status' },
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
          <h1 className="font-serif text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Gestão financeira e fluxo de caixa</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestor: Lucas Voltarelli</Badge>
          <DataExport data={filteredInvoices} filename="faturas" columns={exportColumns} />
          <Button variant="outline" onClick={() => {
            setNewInvoice({ ...newInvoice, type: 'payable' });
            setIsDialogOpen(true);
          }}>
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setNewInvoice({ ...newInvoice, type: 'receivable' })}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Fatura</DialogTitle>
                <DialogDescription>
                  Registre uma nova fatura no sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="invoice_number">Número da Fatura</Label>
                  <Input
                    id="invoice_number"
                    placeholder="INV-001"
                    value={newInvoice.invoice_number}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newInvoice.type}
                      onValueChange={(value) => setNewInvoice({ ...newInvoice, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="receivable">Receita</SelectItem>
                        <SelectItem value="payable">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="total">Valor (R$)</Label>
                    <Input
                      id="total"
                      type="number"
                      value={newInvoice.subtotal}
                      onChange={(e) => setNewInvoice({
                        ...newInvoice,
                        subtotal: Number(e.target.value),
                        total: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Vencimento</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newInvoice.due_date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateInvoice} disabled={createInvoice.isPending}>
                  {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar Fatura
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuickStats stats={quickStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <KPIChart
          title="Fluxo de Caixa"
          description="Evolução do saldo nos últimos 6 meses"
          data={cashFlowData}
          type="area"
        />
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Mês</CardTitle>
            <CardDescription>Visão geral do mês atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-full">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium">Receitas</p>
                  <p className="text-xs text-muted-foreground">{invoices?.filter(i => i.type === 'receivable').length || 0} faturas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-success">
                {formatCurrency(stats?.receivable || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium">Despesas</p>
                  <p className="text-xs text-muted-foreground">{invoices?.filter(i => i.type === 'payable').length || 0} faturas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-destructive">
                {formatCurrency(stats?.payable || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Saldo Líquido</p>
                  <p className="text-xs text-muted-foreground">Receitas - Despesas</p>
                </div>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(stats?.balance || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Faturas e Pagamentos</CardTitle>
              <CardDescription>Controle de contas a pagar e receber</CardDescription>
            </div>
            <SearchFilter
              searchPlaceholder="Buscar fatura..."
              onSearchChange={setSearchTerm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas ({invoices?.length || 0})</TabsTrigger>
              <TabsTrigger value="receivable">A Receber ({invoices?.filter(i => i.type === 'receivable').length || 0})</TabsTrigger>
              <TabsTrigger value="payable">A Pagar ({invoices?.filter(i => i.type === 'payable').length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredInvoices.length === 0 ? (
                <EmptyState
                  variant={searchTerm ? 'search' : 'empty'}
                  title={searchTerm ? 'Nenhum resultado' : 'Nenhuma fatura'}
                  description={searchTerm
                    ? 'Tente um termo diferente'
                    : 'Registre sua primeira fatura'
                  }
                  actionLabel={!searchTerm ? 'Nova Fatura' : undefined}
                  onAction={() => setIsDialogOpen(true)}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Fatura</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {invoice.type === "receivable" ? (
                            <Badge variant="outline" className="text-success border-success">
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                              Receita
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-destructive border-destructive">
                              <ArrowDownRight className="mr-1 h-3 w-3" />
                              Despesa
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(invoice.total)}</TableCell>
                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                              <DropdownMenuItem>Registrar Pagamento</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
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
    </div>
  );
}
