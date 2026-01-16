import { useState } from "react";
import { 
  ShoppingCart, 
  Plus, 
  Package,
  DollarSign,
  TrendingUp,
  Users,
  MoreHorizontal
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

const orders = [
  { id: "ORD-1234", customer: "Maria Silva", items: 3, total: 589.90, status: "processing", date: "2024-01-15 10:30", payment: "paid" },
  { id: "ORD-1235", customer: "João Santos", items: 1, total: 199.90, status: "shipped", date: "2024-01-15 09:15", payment: "paid" },
  { id: "ORD-1236", customer: "Ana Costa", items: 5, total: 1250.00, status: "pending", date: "2024-01-15 08:45", payment: "pending" },
  { id: "ORD-1237", customer: "Pedro Lima", items: 2, total: 459.80, status: "delivered", date: "2024-01-14 16:30", payment: "paid" },
  { id: "ORD-1238", customer: "Carla Mendes", items: 4, total: 890.00, status: "cancelled", date: "2024-01-14 14:20", payment: "refunded" },
];

const stats = [
  { title: "Pedidos Hoje", value: "45", icon: ShoppingCart, color: "text-primary" },
  { title: "Receita Dia", value: "R$ 12.5K", icon: DollarSign, color: "text-success" },
  { title: "Ticket Médio", value: "R$ 278", icon: TrendingUp, color: "text-info" },
  { title: "Clientes Ativos", value: "1.2K", icon: Users, color: "text-warning" },
];

export default function EcommerceDashboard() {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      processing: { label: "Processando", className: "bg-info/10 text-info" },
      shipped: { label: "Enviado", className: "bg-primary/10 text-primary" },
      delivered: { label: "Entregue", className: "bg-success/10 text-success" },
      cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
    };
    const config = statusMap[status] || { label: status, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentBadge = (payment: string) => {
    const paymentMap: Record<string, { label: string; className: string }> = {
      paid: { label: "Pago", className: "bg-success/10 text-success" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      refunded: { label: "Reembolsado", className: "bg-muted text-muted-foreground" },
    };
    const config = paymentMap[payment] || { label: payment, className: "" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">E-commerce</h1>
          <p className="text-muted-foreground">Gestão de produtos, pedidos e vendas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Produtos
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items} itens</TableCell>
                    <TableCell>R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{getPaymentBadge(order.payment)}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Atualizar Status</DropdownMenuItem>
                          <DropdownMenuItem>Enviar Nota</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Cancelar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
