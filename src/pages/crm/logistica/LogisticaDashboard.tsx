import { useState } from "react";
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
  RefreshCw
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShipments, useLogisticsStats } from "@/hooks/useLogistica";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { KPIChart } from "@/components/crm/shared/KPIChart";
import { SearchFilter } from "@/components/crm/shared/SearchFilter";
import { DataExport } from "@/components/crm/shared/DataExport";
import { EmptyState } from "@/components/crm/shared/EmptyState";

const deliveryData = [
  { name: "Seg", value: 45 },
  { name: "Ter", value: 52 },
  { name: "Qua", value: 38 },
  { name: "Qui", value: 65 },
  { name: "Sex", value: 72 },
  { name: "Sáb", value: 28 },
  { name: "Dom", value: 12 },
];

const carrierData = [
  { name: "Correios", value: 45 },
  { name: "JadLog", value: 25 },
  { name: "Total Express", value: 18 },
  { name: "Outros", value: 12 },
];

export default function LogisticaDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { shipments, isLoading, updateShipment } = useShipments();
  const { data: stats } = useLogisticsStats();

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
        <div className="flex gap-2">
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

      <QuickStats stats={quickStats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <KPIChart
          title="Entregas por Dia"
          description="Volume de entregas na última semana"
          data={deliveryData}
          type="bar"
        />
        <KPIChart
          title="Distribuição por Transportadora"
          description="Percentual de envios por transportadora"
          data={carrierData}
          type="pie"
        />
      </div>

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
