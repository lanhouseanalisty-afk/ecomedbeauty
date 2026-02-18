import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Package,
    Plus,
    Search,
    History,
    ShoppingCart,
    CheckCircle,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface BonusManagementPageProps {
    sectorId: string;
    sectorName: string;
}

interface BonusItem {
    id: string;
    name: string;
    current_stock: number;
    image_url?: string;
    active: boolean;
}

interface BonusUsage {
    id: string;
    created_at: string;
    quantity: number;
    sales_order: string;
    item_id: string;
    manager_auth: boolean;
    item: {
        name: string;
    };
}

export default function BonusManagementPage({ sectorId, sectorName }: BonusManagementPageProps) {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form States
    const [selectedItem, setSelectedItem] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [salesOrder, setSalesOrder] = useState("");
    const [managerAuth, setManagerAuth] = useState(false);

    // Fetch Active Items
    const { data: items, isLoading: isLoadingItems } = useQuery({
        queryKey: ['bonus_items_active'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bonus_inventory_items')
                .select('*')
                .eq('active', true)
                .order('name');
            if (error) throw error;
            return data as BonusItem[];
        }
    });

    // Fetch Usage History for Sector
    const { data: usageHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['bonus_usage_history', sectorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bonus_usage_log')
                .select(`
                    *,
                    item:item_id(name)
                `)
                .eq('sector', sectorId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data as BonusUsage[];
        }
    });

    // Register Usage Mutation
    const registerUsage = useMutation({
        mutationFn: async () => {
            const qty = parseInt(quantity);
            if (isNaN(qty) || qty <= 0) throw new Error("Quantidade inválida");

            // 1. Check stock
            const item = items?.find(i => i.id === selectedItem);
            if (!item) throw new Error("Item não encontrado");
            if (item.current_stock < qty) throw new Error("Estoque insuficiente");

            // 2. Insert Log
            const { error: logError } = await supabase.from('bonus_usage_log').insert({
                item_id: selectedItem,
                quantity: qty,
                sector: sectorId,
                sales_order: salesOrder,
                manager_auth: managerAuth
            });
            if (logError) throw logError;

            // 3. Update Stock
            const { error: stockError } = await supabase.from('bonus_inventory_items')
                .update({ current_stock: item.current_stock - qty })
                .eq('id', selectedItem);

            if (stockError) throw stockError;
        },
        onSuccess: () => {
            toast.success("Bonificação registrada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['bonus_items_active'] });
            queryClient.invalidateQueries({ queryKey: ['bonus_usage_history', sectorId] });
            resetForm();
            setIsDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao registrar bonificação.");
        }
    });

    const resetForm = () => {
        setSelectedItem("");
        setQuantity("1");
        setSalesOrder("");
        setManagerAuth(false);
    };

    const selectedItemData = items?.find(i => i.id === selectedItem);

    const filteredUsage = usageHistory?.filter(usage =>
        usage.sales_order.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usage.item?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Bonificações - {sectorName}</h1>
                    <p className="text-muted-foreground">Registre a saída de itens bonificados para o seu setor.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                            <Plus className="h-4 w-4" />
                            Registrar Saída
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar Bonificação</DialogTitle>
                            <DialogDescription>Informe os dados do pedido e o item utilizado.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label>Item</Label>
                                <Select value={selectedItem} onValueChange={setSelectedItem}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um item..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items?.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                <div className="flex items-center gap-2">
                                                    {item.image_url && (
                                                        <img src={item.image_url} alt={item.name} className="h-6 w-6 rounded object-cover" />
                                                    )}
                                                    <span>{item.name} (Estoque: {item.current_stock})</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedItemData?.image_url && (
                                <div className="flex justify-center py-2">
                                    <img src={selectedItemData.image_url} alt={selectedItemData.name} className="h-32 rounded-lg object-contain" />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="order">Nº Pedido (PV)</Label>
                                    <Input id="order" value={salesOrder} onChange={(e) => setSalesOrder(e.target.value)} placeholder="Ex: 123456" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="qty">Quantidade</Label>
                                    <Input id="qty" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="auth"
                                    checked={managerAuth}
                                    onCheckedChange={(checked) => setManagerAuth(checked as boolean)}
                                />
                                <Label htmlFor="auth" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Autorizado pelo Gestor?
                                </Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={() => registerUsage.mutate()}
                                disabled={registerUsage.isPending || !selectedItem || !salesOrder || !quantity}
                            >
                                {registerUsage.isPending ? "Registrando..." : "Registrar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Simple Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Itens Enviados</CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {usageHistory?.reduce((acc, curr) => acc + curr.quantity, 0) || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Total de unidades (Histórico)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Bonificados</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(usageHistory?.map(u => u.sales_order)).size}
                        </div>
                        <p className="text-xs text-muted-foreground">Pedidos distintos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Autorizações Especiais</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {usageHistory?.filter(u => u.manager_auth).length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Registros autorizados por gestor</p>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Histórico de Saídas</CardTitle>
                            <CardDescription>Registro de brindes enviados nos pedidos.</CardDescription>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar pedido ou item..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Pedido (PV)</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Qtd</TableHead>
                                <TableHead>Autorizado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingHistory ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredUsage.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsage.map((usage) => (
                                    <TableRow key={usage.id}>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(usage.created_at), "dd/MM/yyyy HH:mm")}
                                        </TableCell>
                                        <TableCell className="font-mono font-medium">
                                            {usage.sales_order}
                                        </TableCell>
                                        <TableCell>
                                            {usage.item?.name}
                                        </TableCell>
                                        <TableCell className="font-bold">
                                            {usage.quantity}
                                        </TableCell>
                                        <TableCell>
                                            {usage.manager_auth ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Sim</Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
