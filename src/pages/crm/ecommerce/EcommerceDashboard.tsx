import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  MoreHorizontal,
  Loader2,
  Layout,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useEcommerce";
import { Link } from "react-router-dom";
import { EcommerceLiveEditor } from "@/components/crm/ecommerce/EcommerceLiveEditor";

// Define strict types to avoid inference errors
interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Profile {
  full_name?: string;
  email?: string;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total: number;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: Profile; // The alias from the query
  profiles?: Profile; // Fallback if alias fails
}

export default function EcommerceDashboard() {
  const { data: rawOrdersData, isLoading } = useOrders();
  // Safe cast to avoid TS errors with Supabase relations
  const orders = (rawOrdersData as unknown as Order[]) || [];

  const stats = useMemo(() => {
    if (!orders) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const ordersToday = orders.filter(o => new Date(o.created_at).getTime() >= today);
    const revenueToday = ordersToday.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const totalRevenue = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Unique customers (from profiles)
    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;

    return [
      { title: "Pedidos Hoje", value: ordersToday.length.toString(), icon: ShoppingCart, color: "text-primary" },
      { title: "Receita Hoje", value: revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: DollarSign, color: "text-success" },
      { title: "Ticket Médio", value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: TrendingUp, color: "text-info" },
      { title: "Clientes Ativos", value: uniqueCustomers.toString(), icon: Users, color: "text-warning" },
    ];
  }, [orders]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      processing: { label: "Processando", className: "bg-info/10 text-info" },
      shipped: { label: "Enviado", className: "bg-primary/10 text-primary" },
      delivered: { label: "Entregue", className: "bg-success/10 text-success" },
      cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
    };
    const config = statusMap[status] || { label: status, className: "" };
    return <Badge className={config.className}>{config.label || status}</Badge>;
  };

  const getPaymentBadge = (payment: string) => {
    const paymentMap: Record<string, { label: string; className: string }> = {
      paid: { label: "Pago", className: "bg-success/10 text-success" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      refunded: { label: "Reembolsado", className: "bg-muted text-muted-foreground" },
    };
    const config = paymentMap[payment] || { label: payment, className: "" };
    return <Badge variant="outline" className={config.className}>{config.label || payment}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">E-commerce</h1>
          <p className="text-muted-foreground">Gestão de produtos, pedidos e loja virtual</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/crm/intranet/contratos/novo?sector=ecommerce">
              <FileText className="h-4 w-4" />
              Solicitar Contrato
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="editor">Editor da Loja</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat) => (
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
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>Últimos pedidos da loja</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.slice(0, 10).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>{order.profile?.full_name || order.profile?.email || "N/A"}</TableCell>
                        <TableCell>{(order.order_items as any[])?.length || 0} itens</TableCell>
                        <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                        <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                        <TableCell>{formatDate(order.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/admin/rastreamento/${order.id}`}>Ver Detalhes</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                              <DropdownMenuItem>Enviar Nota</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editor">
          <EcommerceLiveEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
