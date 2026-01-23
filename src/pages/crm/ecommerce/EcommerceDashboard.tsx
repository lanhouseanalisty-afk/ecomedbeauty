import { useState, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Users,
  MoreHorizontal,
  Loader2
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

export default function EcommerceDashboard() {
  const { data: ordersData, isLoading } = useOrders();
  const orders = ordersData || [];

  const stats = useMemo(() => {
    if (!ordersData) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const ordersToday = ordersData.filter(o => new Date(o.created_at).getTime() >= today);
    const revenueToday = ordersToday.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const totalRevenue = ordersData.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const avgTicket = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

    // Unique customers (from profiles)
    const uniqueCustomers = new Set(ordersData.map(o => o.user_id)).size;

    return [
      { title: "Pedidos Hoje", value: ordersToday.length.toString(), icon: ShoppingCart, color: "text-primary" },
      { title: "Receita Hoje", value: revenueToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: DollarSign, color: "text-success" },
      { title: "Ticket Médio", value: avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: TrendingUp, color: "text-info" },
      { title: "Clientes Ativos", value: uniqueCustomers.toString(), icon: Users, color: "text-warning" },
    ];
  }, [ordersData]);

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
          <p className="text-muted-foreground">Gestão de produtos, pedidos e vendas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/crm/ecommerce/produtos">
              <Package className="mr-2 h-4 w-4" />
              Produtos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/crm/ecommerce/produtos">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>
      </div>

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
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="processing">Processando</TabsTrigger>
              <TabsTrigger value="shipped">Enviados</TabsTrigger>
              <TabsTrigger value="delivered">Entregues</TabsTrigger>
            </TabsList>

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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
