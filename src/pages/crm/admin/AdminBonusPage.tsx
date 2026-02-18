import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Package,
    Plus,
    Search,
    History,
    FileSpreadsheet,
    AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";

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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface BonusItem {
    id: string;
    name: string;
    description: string;
    current_stock: number;
    active: boolean;
    image_url?: string;
    created_at: string;
}

interface BonusUsage {
    id: string;
    created_at: string;
    quantity: number;
    sector: string;
    sales_order: string;
    item: {
        name: string;
    };
}

export default function AdminBonusPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemDesc, setNewItemDesc] = useState("");
    const [newItemStock, setNewItemStock] = useState("0");
    const [newItemImage, setNewItemImage] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Fetch Items
    const { data: items, isLoading } = useQuery({
        queryKey: ['bonus_items_admin'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bonus_inventory_items')
                .select('*')
                .order('name');
            if (error) throw error;
            return data as BonusItem[];
        }
    });

    // Fetch History
    const { data: usageHistory, isLoading: isLoadingUsage } = useQuery({
        queryKey: ['bonus_usage_history'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bonus_usage_log')
                .select(`
                    *,
                    item:item_id(name)
                `)
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) throw error;
            return data as any[];
        }
    });

    // Create Item
    const createItem = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('bonus_inventory_items').insert({
                name: newItemName,
                description: newItemDesc,
                current_stock: parseInt(newItemStock),
                image_url: newItemImage || null,
                active: true
            });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Item criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['bonus_items_admin'] });
            setIsDialogOpen(false);
            setNewItemName("");
            setNewItemDesc("");
            setNewItemStock("0");
            setNewItemImage("");
        },
        onError: () => toast.error("Erro ao criar item.")
    });

    // Update Stock / Toggle Active
    const updateStock = useMutation({
        mutationFn: async ({ id, newStock }: { id: string, newStock: number }) => {
            const { error } = await supabase.from('bonus_inventory_items').update({ current_stock: newStock }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Estoque atualizado!");
            queryClient.invalidateQueries({ queryKey: ['bonus_items_admin'] });
        }
    });

    const toggleActive = useMutation({
        mutationFn: async ({ id, currentState }: { id: string, currentState: boolean }) => {
            const { error } = await supabase.from('bonus_inventory_items').update({ active: !currentState }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bonus_items_admin'] })
    });

    const exportToExcel = () => {
        if (!items) return;
        const worksheet = XLSX.utils.json_to_sheet(items.map(item => ({
            Nome: item.name,
            Descrição: item.description,
            Estoque: item.current_stock,
            Status: item.active ? 'Ativo' : 'Inativo',
            CriadoEm: new Date(item.created_at).toLocaleDateString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Estoque Bonificações");
        XLSX.writeFile(workbook, "estoque_bonificacoes.xlsx");
    };

    const filteredItems = items?.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Gestão de Bonificações</h1>
                    <p className="text-muted-foreground">Controle de estoque e histórico de saídas.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToExcel} className="gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Exportar
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 bg-pink-600 hover:bg-pink-700">
                                <Plus className="h-4 w-4" />
                                Novo Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Item</DialogTitle>
                                <DialogDescription>Cadastre um novo produto para bonificação.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nome do Item</Label>
                                    <Input id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Ex: Necessaire Rosa" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="desc">Descrição</Label>
                                    <Input id="desc" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Breve descrição" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">URL da Imagem</Label>
                                    <Input id="image" value={newItemImage} onChange={(e) => setNewItemImage(e.target.value)} placeholder="https://..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="stock">Estoque Inicial</Label>
                                    <Input id="stock" type="number" value={newItemStock} onChange={(e) => setNewItemStock(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => createItem.mutate()} disabled={createItem.isPending}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4" /> Estoque</TabsTrigger>
                    <TabsTrigger value="history" className="gap-2"><History className="h-4 w-4" /> Histórico de Saídas</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Itens em Estoque</CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar item..."
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
                                        <TableHead>Item</TableHead>
                                        <TableHead>Estoque Atual</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
                                    ) : filteredItems.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum item encontrado.</TableCell></TableRow>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{item.name}</span>
                                                            <span className="text-xs text-muted-foreground">{item.description}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={item.current_stock > 0 ? "outline" : "destructive"}>
                                                        {item.current_stock} un
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={item.active}
                                                        onCheckedChange={() => toggleActive.mutate({ id: item.id, currentState: item.active })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newStock = prompt("Novo valor de estoque:", item.current_stock.toString());
                                                            if (newStock !== null && !isNaN(parseInt(newStock))) {
                                                                updateStock.mutate({ id: item.id, newStock: parseInt(newStock) });
                                                            }
                                                        }}
                                                    >
                                                        Ajustar Estoque
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Saídas</CardTitle>
                            <CardDescription>Registro de todas as bonificações enviadas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Qtd</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingUsage ? (
                                        <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
                                    ) : usageHistory?.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
                                    ) : (
                                        usageHistory?.map((usage) => (
                                            <TableRow key={usage.id}>
                                                <TableCell>{format(new Date(usage.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                                                <TableCell><Badge variant="secondary" className="uppercase text-[10px]">{usage.sector}</Badge></TableCell>
                                                <TableCell className="font-mono">{usage.sales_order}</TableCell>
                                                <TableCell>{usage.item?.name}</TableCell>
                                                <TableCell className="font-bold">{usage.quantity}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
