import { useState } from "react";
import {
    Plus,
    Search,
    Filter,
    AlertTriangle,
    Package,
    ArrowRightLeft,
    History,
    MoreHorizontal,
    Download,
    Warehouse,
    Loader2
} from "lucide-react";
import { useInventory, useWarehouses } from "@/hooks/useLogistica";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuickStats } from "@/components/crm/shared/QuickStats";
import { cn } from "@/lib/utils";

export default function LogisticaEstoquePage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [warehouseFilter, setWarehouseFilter] = useState("all");
    const [activeTab, setActiveTab] = useState("all");

    const { data: inventory, isLoading } = useInventory();
    const { data: warehouses } = useWarehouses();
    const { canEditModule } = useUserRole();
    const canEdit = canEditModule('logistica');

    const filteredInventory = inventory?.filter(item => {
        const matchesSearch = item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWarehouse = warehouseFilter === "all" || item.warehouse_id === warehouseFilter;

        if (activeTab === "low") {
            return matchesSearch && matchesWarehouse && (item.quantity_available <= (item.min_stock || 0));
        }

        return matchesSearch && matchesWarehouse;
    }) || [];

    const totalItems = inventory?.length || 0;
    const lowStockItems = inventory?.filter(item => item.quantity_available <= (item.min_stock || 0)).length || 0;
    const totalValue = 0; // Se tivéssemos preço aqui
    const totalQuantity = inventory?.reduce((acc, item) => acc + item.quantity_available, 0) || 0;

    const quickStats = [
        {
            title: "Total de SKUs",
            value: totalItems,
            icon: Package,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            title: "Quantidade Total",
            value: totalQuantity,
            icon: Warehouse,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            title: "Estoque Baixo",
            value: lowStockItems,
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            description: "Itens abaixo do nível mínimo"
        },
        {
            title: "Giro de Estoque",
            value: "4.2",
            icon: ArrowRightLeft,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            trend: { value: 12, isPositive: true }
        }
    ];

    const getStockStatus = (item: any) => {
        if (item.quantity_available <= 0) return { label: "Sem Estoque", variant: "destructive" as const };
        if (item.quantity_available <= (item.min_stock || 0)) return { label: "Baixo", variant: "warning" as const };
        return { label: "Normal", variant: "default" as const };
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                        Gestão de Estoque
                    </h1>
                    <p className="text-muted-foreground mt-1">Controle físico e movimentação de mercadorias</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    {canEdit && (
                        <Button className="bg-gradient-to-r from-primary to-orange-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Entrada de Estoque
                        </Button>
                    )}
                </div>
            </div>

            <QuickStats stats={quickStats} />

            <Card className="border-t-4 border-t-primary/20 shadow-md">
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Inventário por Depósito</CardTitle>
                            <CardDescription>Visualize o saldo e status dos itens em cada armazém</CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar SKU ou Produto..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Todos Depósitos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos Depósitos</SelectItem>
                                    {warehouses?.map(w => (
                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" onValueChange={setActiveTab}>
                        <TabsList className="mb-4 bg-muted/50 p-1">
                            <TabsTrigger value="all">Todos ({inventory?.length || 0})</TabsTrigger>
                            <TabsTrigger value="low" className="data-[state=active]:text-amber-600">
                                Estoque Baixo ({lowStockItems})
                            </TabsTrigger>
                            <TabsTrigger value="reserved">Reservados</TabsTrigger>
                            <TabsTrigger value="incoming">Em Chegada</TabsTrigger>
                        </TabsList>

                        <div className="rounded-md border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead>Produto / SKU</TableHead>
                                        <TableHead>Depósito</TableHead>
                                        <TableHead className="text-center">Disponível</TableHead>
                                        <TableHead className="text-center">Reservado</TableHead>
                                        <TableHead className="text-center">Mínimo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                                <span className="text-sm text-muted-foreground mt-2 inline-block">Carregando inventário...</span>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredInventory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                                Nenhum item encontrado.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredInventory.map((item) => {
                                            const status = getStockStatus(item);
                                            return (
                                                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-semibold">{item.product_id}</p>
                                                            <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                                                SKU: {item.sku}
                                                            </code>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            <Warehouse className="h-3 w-3 text-muted-foreground" />
                                                            <span className="text-sm">{(item as any).warehouse?.name || 'Geral'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center font-bold">
                                                        {item.quantity_available}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {item.quantity_reserved}
                                                    </TableCell>
                                                    <TableCell className="text-center text-muted-foreground">
                                                        {item.min_stock || 0}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={status.variant === "warning" ? "outline" : status.variant}
                                                            className={cn(
                                                                status.variant === "warning" && "border-amber-500 text-amber-600 bg-amber-50"
                                                            )}
                                                        >
                                                            {status.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {canEdit ? (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                                    <DropdownMenuItem>
                                                                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferência
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Plus className="mr-2 h-4 w-4" /> Ajuste Manual
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <History className="mr-2 h-4 w-4" /> Ver Histórico
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        ) : (
                                                            <Button variant="ghost" size="icon" disabled>
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
