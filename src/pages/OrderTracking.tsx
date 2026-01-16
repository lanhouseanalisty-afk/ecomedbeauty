import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  Loader2,
  ArrowLeft,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

interface SAPOrderStatus {
  docNum: number;
  docEntry: number;
  status: string;
  documentStatus: string;
  cardCode: string;
  docTotal: number;
  itemCount: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number | null;
  discount: number | null;
  items: OrderItem[];
  shipping_address: ShippingAddress | null;
  tracking_code: string | null;
  tracking_url: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
}

const statusSteps = [
  { key: "pending", label: "Pedido Recebido", icon: Clock },
  { key: "processing", label: "Em Processamento", icon: Package },
  { key: "shipped", label: "Enviado", icon: Truck },
  { key: "delivered", label: "Entregue", icon: CheckCircle },
];

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [sapStatus, setSapStatus] = useState<SAPOrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingSap, setRefreshingSap] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch SAP B1 order status
  const fetchSAPStatus = useCallback(async (trackingCode: string) => {
    // Extract SAP DocNum from tracking code (format: SAP-XXXXX)
    const sapDocNumMatch = trackingCode.match(/SAP-(\d+)/);
    if (!sapDocNumMatch) {
      console.log("Tracking code is not a SAP reference:", trackingCode);
      return null;
    }

    const docNum = parseInt(sapDocNumMatch[1]);
    
    try {
      setRefreshingSap(true);
      const response = await supabase.functions.invoke("sap-b1-orders", {
        body: null,
        method: "GET",
      });

      // Use query params for status action
      const statusResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sap-b1-orders?action=status&docNum=${docNum}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (statusResponse.ok) {
        const sapData = await statusResponse.json();
        setSapStatus(sapData);
        return sapData;
      }
    } catch (err) {
      console.error("Error fetching SAP status:", err);
    } finally {
      setRefreshingSap(false);
    }
    return null;
  }, []);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId || !user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single();

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            setError("Pedido não encontrado ou você não tem permissão para visualizá-lo.");
          } else {
            throw fetchError;
          }
          return;
        }

        // Parse items and shipping_address from JSON
        const parsedOrder: Order = {
          ...data,
          items: Array.isArray(data.items) ? (data.items as unknown as OrderItem[]) : [],
          shipping_address: data.shipping_address as unknown as ShippingAddress | null,
        };

        setOrder(parsedOrder);

        // If order has SAP tracking code, fetch SAP status
        if (parsedOrder.tracking_code?.startsWith("SAP-")) {
          await fetchSAPStatus(parsedOrder.tracking_code);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Erro ao carregar o pedido.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchOrder();
    }
  }, [orderId, user, fetchSAPStatus]);

  const handleRefreshSAPStatus = async () => {
    if (order?.tracking_code) {
      const status = await fetchSAPStatus(order.tracking_code);
      if (status) {
        toast.success("Status do SAP atualizado com sucesso!");
      } else {
        toast.error("Não foi possível atualizar o status do SAP");
      }
    }
  };

  // Map SAP status to our status
  const mapSAPStatus = (sapStatus: SAPOrderStatus): string => {
    // SAP DocStatus: bost_Open = Open, bost_Close = Closed
    // DocumentStatus: bost_Draft, bost_Open, bost_Close
    if (sapStatus.documentStatus === "bost_Close" || sapStatus.status === "bost_Close") {
      return "delivered";
    }
    if (sapStatus.documentStatus === "bost_Open" || sapStatus.status === "bost_Open") {
      return "processing";
    }
    return "pending";
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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentStep = () => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    return statusSteps.findIndex((step) => step.key === order.status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-muted";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="h-16 w-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link to="/perfil">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Perfil
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const currentStep = getCurrentStep();
  const isCancelled = order.status === "cancelled";

  return (
    <>
      <Helmet>
        <title>Rastreamento do Pedido | MedBeauty</title>
        <meta name="description" content="Acompanhe o status do seu pedido" />
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/perfil">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Perfil
          </Link>
        </Button>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    Pedido #{order.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription>
                    Realizado em {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <Badge
                  className={`${getStatusColor(order.status)} text-white`}
                >
                  {isCancelled
                    ? "Cancelado"
                    : statusSteps[currentStep]?.label || order.status}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Progress Tracker */}
          {!isCancelled && (
            <Card>
              <CardHeader>
                <CardTitle>Status do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{
                        width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <div
                          key={step.key}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`
                              flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                              ${
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted bg-background text-muted-foreground"
                              }
                              ${isCurrent ? "ring-4 ring-primary/20" : ""}
                            `}
                          >
                            <StepIcon className="h-5 w-5" />
                          </div>
                          <p
                            className={`mt-2 text-sm text-center ${
                              isActive ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SAP B1 Status */}
          {sapStatus && (
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    Status SAP B1 (Tempo Real)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshSAPStatus}
                    disabled={refreshingSap}
                  >
                    {refreshingSap ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Atualizar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nº Documento SAP</p>
                    <p className="font-mono font-medium text-lg">{sapStatus.docNum}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status ERP</p>
                    <Badge variant={sapStatus.status === "bost_Close" ? "default" : "secondary"}>
                      {sapStatus.status === "bost_Close" ? "Fechado" : 
                       sapStatus.status === "bost_Open" ? "Em Aberto" : sapStatus.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total SAP</p>
                    <p className="font-medium">{formatCurrency(sapStatus.docTotal)}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Código Cliente</p>
                    <p className="font-mono">{sapStatus.cardCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Itens no Pedido</p>
                    <p>{sapStatus.itemCount} item(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking Info */}
          {order.tracking_code && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Informações de Rastreio
                  </CardTitle>
                  {order.tracking_code.startsWith("SAP-") && !sapStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshSAPStatus}
                      disabled={refreshingSap}
                    >
                      {refreshingSap ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      <span className="ml-2">Consultar SAP</span>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Transportadora</p>
                    <p className="font-medium">{order.carrier || (order.tracking_code.startsWith("SAP-") ? "SAP Business One" : "Não informada")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código de Rastreio</p>
                    <p className="font-mono font-medium">{order.tracking_code}</p>
                  </div>
                </div>
                {order.tracking_url && (
                  <Button asChild className="w-full gap-2">
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Rastrear no Site da Transportadora
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {order.shipping_address.street}, {order.shipping_address.number}
                  {order.shipping_address.complement && ` - ${order.shipping_address.complement}`}
                </p>
                <p>
                  {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
                </p>
                <p>CEP: {order.shipping_address.zip_code}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.shipping !== null && order.shipping > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Frete</span>
                      <span>{formatCurrency(order.shipping)}</span>
                    </div>
                  )}
                  {order.discount !== null && order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
