import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  XCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalUsers: number;
  newUsersToday: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user_email?: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Real-time updates for orders
    const channel = supabase
      .channel("dashboard-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all orders
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch user count
      const { count: userCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Fetch users created today
      const { count: newUsersCount, error: newUsersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      if (newUsersError) throw newUsersError;

      // Calculate stats
      const ordersToday = orders?.filter(
        (o) => new Date(o.created_at) >= today
      ) || [];

      const statusCounts = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders?.forEach((o) => {
        if (o.status in statusCounts) {
          statusCounts[o.status as keyof typeof statusCounts]++;
        }
      });

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        ordersToday: ordersToday.length,
        revenueToday: ordersToday.reduce((sum, o) => sum + (o.total || 0), 0),
        pendingOrders: statusCounts.pending,
        processingOrders: statusCounts.processing,
        shippedOrders: statusCounts.shipped,
        deliveredOrders: statusCounts.delivered,
        cancelledOrders: statusCounts.cancelled,
        totalUsers: userCount || 0,
        newUsersToday: newUsersCount || 0,
      });

      // Get recent orders with user info
      const recentOrdersData = orders?.slice(0, 5).map((o) => ({
        id: o.id,
        total: o.total,
        status: o.status,
        created_at: o.created_at,
      })) || [];

      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoje: {formatCurrency(stats?.revenueToday || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoje: {stats?.ordersToday || 0} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Novos hoje: {stats?.newUsersToday || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                stats?.totalOrders
                  ? (stats.totalRevenue || 0) / stats.totalOrders
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por pedido</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Pedidos</CardTitle>
          <CardDescription>Visão geral por status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.processingOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Processando</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-lg">
              <Truck className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.shippedOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Enviados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.deliveredOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Entregues</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.cancelledOrders || 0}</p>
                <p className="text-sm text-muted-foreground">Cancelados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Orders */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Atalhos Rápidos</CardTitle>
            <CardDescription>Acesse as principais funções</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-3"
              onClick={() => document.querySelector('[value="orders"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
            >
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Gerenciar Pedidos</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.pendingOrders || 0} pedidos aguardando
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-3"
              onClick={() => document.querySelector('[value="users"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
            >
              <Users className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Gerenciar Usuários</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalUsers || 0} usuários cadastrados
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-3"
              onClick={() => document.querySelector('[value="coupons"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
            >
              <Package className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">Gerenciar Cupons</p>
                <p className="text-xs text-muted-foreground">
                  Criar e editar cupons de desconto
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto py-3"
              onClick={() => document.querySelector('[value="reports"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
            >
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div className="text-left">
                <p className="font-medium">Ver Relatórios</p>
                <p className="text-xs text-muted-foreground">
                  Análises e métricas detalhadas
                </p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum pedido ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-medium text-sm">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.total)}</p>
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
