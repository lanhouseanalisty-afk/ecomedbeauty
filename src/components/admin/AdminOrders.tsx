import { useState, useEffect } from "react";
import { Loader2, Search, Package, Truck, RefreshCw, CheckCircle, XCircle, Clock, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  itemCode?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string | null;
  total: number;
  user_id: string | null;
  items: OrderItem[];
  tracking_code: string | null;
  tracking_url: string | null;
  carrier: string | null;
  userEmail?: string;
  userName?: string;
}

interface SAPStatus {
  docNum: number;
  docStatus: string;
  docTotal: number;
  docDate: string;
  cardCode: string;
  cardName: string;
}

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "processing", label: "Processando" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingForm, setTrackingForm] = useState({
    carrier: "",
    tracking_code: "",
    tracking_url: "",
  });
  const [sapStatuses, setSapStatuses] = useState<Record<string, SAPStatus | null>>({});
  const [loadingSapStatus, setLoadingSapStatus] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const userIds = [...new Set((ordersData || []).filter(o => o.user_id).map(o => o.user_id))];
      
      let profilesMap: Record<string, { email: string | null; full_name: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);
        
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = { email: p.email, full_name: p.full_name };
          return acc;
        }, {} as Record<string, { email: string | null; full_name: string | null }>);
      }

      const formattedOrders = (ordersData || []).map((order) => ({
        ...order,
        items: Array.isArray(order.items) ? order.items as unknown as OrderItem[] : [],
        userEmail: order.user_id ? profilesMap[order.user_id]?.email || undefined : undefined,
        userName: order.user_id ? profilesMap[order.user_id]?.full_name || undefined : undefined,
      }));

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pedidos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchSAPStatus(orderId: string, trackingCode: string) {
    const docNum = parseInt(trackingCode, 10);
    if (isNaN(docNum)) {
      toast({
        title: "Erro",
        description: "Código SAP inválido.",
        variant: "destructive",
      });
      return;
    }

    setLoadingSapStatus(prev => ({ ...prev, [orderId]: true }));

    try {
      const { data, error } = await supabase.functions.invoke("sap-b1-orders", {
        body: { action: "status", docNum },
      });

      if (error) throw error;

      if (data.success) {
        setSapStatuses(prev => ({ ...prev, [orderId]: data.data }));
      } else {
        throw new Error(data.error || "Erro ao consultar SAP");
      }
    } catch (error) {
      console.error("Error fetching SAP status:", error);
      toast({
        title: "Erro SAP B1",
        description: "Não foi possível consultar o status no SAP.",
        variant: "destructive",
      });
      setSapStatuses(prev => ({ ...prev, [orderId]: null }));
    } finally {
      setLoadingSapStatus(prev => ({ ...prev, [orderId]: false }));
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );

      if (order.userEmail) {
        try {
          await supabase.functions.invoke("send-status-email", {
            body: {
              email: order.userEmail,
              orderId: order.id,
              customerName: order.userName || "",
              status: newStatus,
              items: order.items,
              total: order.total,
            },
          });
        } catch (emailError) {
          console.error("Error sending status email:", emailError);
        }
      }

      toast({
        title: "Sucesso",
        description: "Status do pedido atualizado.",
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  }

  async function updateTracking() {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          carrier: trackingForm.carrier || null,
          tracking_code: trackingForm.tracking_code || null,
          tracking_url: trackingForm.tracking_url || null,
        })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, ...trackingForm }
            : o
        )
      );

      if (selectedOrder.userEmail && trackingForm.tracking_code) {
        try {
          await supabase.functions.invoke("send-status-email", {
            body: {
              email: selectedOrder.userEmail,
              orderId: selectedOrder.id,
              customerName: selectedOrder.userName || "",
              status: selectedOrder.status,
              items: selectedOrder.items,
              total: selectedOrder.total,
              trackingCode: trackingForm.tracking_code,
              trackingUrl: trackingForm.tracking_url,
              carrier: trackingForm.carrier,
            },
          });
          toast({
            title: "Sucesso",
            description: "Rastreio atualizado e e-mail enviado ao cliente.",
          });
        } catch (emailError) {
          console.error("Error sending tracking email:", emailError);
          toast({
            title: "Sucesso",
            description: "Rastreio atualizado (e-mail não enviado).",
          });
        }
      } else {
        toast({
          title: "Sucesso",
          description: "Informações de rastreio atualizadas.",
        });
      }

      setTrackingDialogOpen(false);
    } catch (error) {
      console.error("Error updating tracking:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o rastreio.",
        variant: "destructive",
      });
    }
  }

  const openTrackingDialog = (order: Order) => {
    setSelectedOrder(order);
    setTrackingForm({
      carrier: order.carrier || "",
      tracking_code: order.tracking_code || "",
      tracking_url: order.tracking_url || "",
    });
    setTrackingDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getSAPStatusBadge = (status: string) => {
    switch (status) {
      case "O":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Aberto</Badge>;
      case "C":
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-500/20">Fechado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.status.toLowerCase().includes(search.toLowerCase()) ||
      (order.tracking_code?.toLowerCase().includes(search.toLowerCase()) ?? false);

    if (activeTab === "synced") {
      return matchesSearch && order.tracking_code;
    } else if (activeTab === "pending") {
      return matchesSearch && !order.tracking_code;
    }
    return matchesSearch;
  });

  const syncedCount = orders.filter(o => o.tracking_code).length;
  const pendingCount = orders.filter(o => !o.tracking_code).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciar Pedidos</CardTitle>
            <CardDescription>
              Visualize e gerencie todos os pedidos da loja com integração SAP B1
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{syncedCount} sincronizados</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>{pendingCount} pendentes</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
              <TabsTrigger value="synced">Sincronizados ({syncedCount})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({pendingCount})</TabsTrigger>
            </TabsList>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, status ou código SAP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Loja</TableHead>
                      <TableHead>Código SAP</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status Loja</TableHead>
                      <TableHead>Status SAP</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {order.tracking_code ? (
                            <div className="flex items-center gap-2">
                              <Link2 className="h-4 w-4 text-green-500" />
                              <span className="font-mono text-sm">{order.tracking_code}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-500/20">
                              Não sincronizado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            <p className="font-medium">{order.userName || "—"}</p>
                            <p className="text-muted-foreground text-xs">{order.userEmail || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.items.length} item(s)
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {order.tracking_code ? (
                            <div className="flex items-center gap-2">
                              {loadingSapStatus[order.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : sapStatuses[order.id] ? (
                                getSAPStatusBadge(sapStatuses[order.id]!.docStatus)
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => fetchSAPStatus(order.id, order.tracking_code!)}
                                  className="gap-1"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Consultar
                                </Button>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTrackingDialog(order)}
                            className="gap-1"
                          >
                            <Truck className="h-4 w-4" />
                            {order.tracking_code ? "Editar" : "Sincronizar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Tracking Dialog */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sincronização SAP B1</DialogTitle>
              <DialogDescription>
                Vincule este pedido ao SAP Business One
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tracking_code">Código do Pedido SAP (DocNum)</Label>
                <Input
                  id="tracking_code"
                  value={trackingForm.tracking_code}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_code: e.target.value })}
                  placeholder="Ex: 12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier">Transportadora</Label>
                <Input
                  id="carrier"
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm({ ...trackingForm, carrier: e.target.value })}
                  placeholder="Ex: Correios, Jadlog, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tracking_url">URL de Rastreamento</Label>
                <Input
                  id="tracking_url"
                  value={trackingForm.tracking_url}
                  onChange={(e) => setTrackingForm({ ...trackingForm, tracking_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <Button onClick={updateTracking} className="w-full">
                Salvar Sincronização
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
