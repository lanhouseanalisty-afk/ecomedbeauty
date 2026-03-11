import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  MoreHorizontal,
  Loader2,
  Warehouse,
  BarChart3,
  Eye,
  RefreshCw,
  Search,
  FileText,
  UserPlus,
  Send,
  Coffee
} from "lucide-react";
import { useMarketingRequest } from "@/hooks/useMarketingRequest";
import { useEffect } from "react";
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
import { LimpezaRequestDialog } from "@/components/crm/limpeza/LimpezaRequestDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShipments, useLogisticsStats, useDeliveryTrend } from "@/hooks/useLogistica";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";


export default function LogisticaDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { shipments, isLoading, updateShipment } = useShipments();
  const { data: stats } = useLogisticsStats();
  const { data: realDeliveryData } = useDeliveryTrend();
  const { getAllRequests } = useMarketingRequest();
  const [supplyRequestsCount, setSupplyRequestsCount] = useState(0);

  useEffect(() => {
    const fetchSupplyRequests = async () => {
      const result = await getAllRequests();
      if (result.success && result.data) {
        // Count approved requests that need logistics processing
        setSupplyRequestsCount(result.data.filter(r => r.status === 'approved').length);
      }
    };
    fetchSupplyRequests();
  }, []);

  // Aggregate carrier data from shipments
  const carrierDistribution = shipments?.reduce((acc: any[], ship: any) => {
    const carrierName = (ship as any).carrier?.name || 'Outros';
    const existing = acc.find(c => c.name === carrierName);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: carrierName, value: 1 });
    }
    return acc;
  }, []) || [];

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "Pendente", className: "bg-muted text-muted-foreground", icon: <Clock className="h-3 w-3 mr-1" /> },
      processing: { label: "Processando", className: "bg-info/10 text-info", icon: <Package className="h-3 w-3 mr-1" /> },
      in_transit: { label: "Em Trânsito", className: "bg-primary/10 text-primary", icon: <Truck className="h-3 w-3 mr-1" /> },
      delivered: { label: "Entregue", className: "bg-success/10 text-success", icon: <CheckCircle className="h-3 w-3 mr-1" /> },
      exception: { label: "Exceção", className: "bg-destructive/10 text-destructive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    };
    const config = statusMap[status || 'pending'] || { label: status || 'Pendente', className: "", icon: null };
    return (
      <Badge className={`${config.className} flex items-center`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const quickStats = [
    { title: "Pedidos Hoje", value: stats?.todayShipments || 0, icon: Package, color: "text-primary", trend: { value: 8 } },
    { title: "Em Trânsito", value: stats?.inTransit || 0, icon: Truck, color: "text-info" },
    { title: "Entregues (Mês)", value: stats?.delivered || 0, icon: CheckCircle, color: "text-success", trend: { value: 12 } },
    { title: "OTIF", value: "94.5%", icon: BarChart3, color: "text-warning", description: "On Time In Full" },
  ];

  const filteredShipments = shipments?.filter(ship => {
    const matchesSearch = ship.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || ship.status === activeTab;
    return matchesSearch && matchesTab;
  }) || [];

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
          <h1 className="font-serif text-3xl font-bold">Logística</h1>
          <p className="text-muted-foreground">Gestão de envios, estoque e fulfillment</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="h-9 px-4 text-sm hidden md:flex">Gestora: Luciana Borri</Badge>
          <Button onClick={() => window.location.href = "/crm/logistica/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700">
            <UserPlus className="h-4 w-4" />
            Admissão & Demissão
          </Button>
          <LimpezaRequestDialog />
          <DataExport
            data={filteredShipments}
            filename="envios"
            columns={[
              { key: 'tracking_code', label: 'Rastreio' },
              { key: 'order_id', label: 'Pedido' },
              { key: 'status', label: 'Status' },
            ]}
          />
          <Button>
            <Truck className="mr-2 h-4 w-4" />
            Novo Envio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="supply-requests">Insumos {supplyRequestsCount > 0 && <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center rounded-full p-0 text-[10px]">{supplyRequestsCount}</Badge>}</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <QuickStats stats={quickStats} />

          <div className="grid gap-6 lg:grid-cols-2">
            <KPIChart
              title="Entregas por Dia"
              description="Volume de entregas na última semana"
              data={realDeliveryData || []}
              type="bar"
            />
            <KPIChart
              title="Distribuição por Transportadora"
              description="Percentual de envios por transportadora"
              data={carrierDistribution}
              type="pie"
            />
          </div>
        </TabsContent>

        <TabsContent value="supply-requests" className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Solicitações de Insumos Aprovadas</CardTitle>
                <CardDescription>
                  Existem {supplyRequestsCount} solicitações aprovadas pelo Marketing aguardando envio.
                </CardDescription>
              </div>
              <Button onClick={() => window.location.href = "/crm/logistica/pedidos"} className="bg-blue-600 hover:bg-blue-700">
                Ver Pedidos de Insumos
              </Button>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Contratos</CardTitle>
              <CardDescription>Gerencie as solicitações e contratos do departamento de Logística</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  onClick={() => navigate("/crm/intranet/contratos/novo?sector=logistica")}
                  className="h-24 flex flex-col gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                  variant="outline"
                >
                  <FileText className="h-4 w-4" />
                  <span>Solicitar Novo Contrato</span>
                </Button>
                <Button
                  onClick={() => window.location.href = "/crm/logistica/contratos"}
                  className="h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  <Search className="h-4 w-4" />
                  <span>Ver Todos os Contratos do Setor</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Envios</CardTitle>
              <CardDescription>Rastreamento e status de entregas</CardDescription>
            </div>
            <SearchFilter
              searchPlaceholder="Buscar por rastreio ou pedido..."
              onSearchChange={setSearchTerm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todos ({shipments?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pendentes ({shipments?.filter(s => s.status === 'pending').length || 0})</TabsTrigger>
              <TabsTrigger value="in_transit">Em Trânsito ({shipments?.filter(s => s.status === 'in_transit').length || 0})</TabsTrigger>
              <TabsTrigger value="delivered">Entregues ({shipments?.filter(s => s.status === 'delivered').length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredShipments.length === 0 ? (
                <EmptyState
                  variant={searchTerm ? 'search' : 'empty'}
                  title={searchTerm ? 'Nenhum resultado' : 'Nenhum envio'}
                  description={searchTerm
                    ? 'Tente um código de rastreio diferente'
                    : 'Os envios aparecerão aqui quando forem criados'
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rastreio</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Transportadora</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {shipment.tracking_code || '-'}
                        </TableCell>
                        <TableCell>{shipment.order_id || '-'}</TableCell>
                        <TableCell>{(shipment as any).carrier?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {(shipment as any).destination_address?.city || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Atualizar Rastreio
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Imprimir Etiqueta</DropdownMenuItem>
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
