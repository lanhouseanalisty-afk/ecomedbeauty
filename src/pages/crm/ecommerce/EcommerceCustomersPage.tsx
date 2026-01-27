import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Users, ShoppingCart, History, Search as SearchIcon, AlertTriangle, Mail, Phone, Calendar } from "lucide-react";

// Mock Data for Customers
const MOCK_CUSTOMERS = [
    {
        id: "CUST-001",
        name: "Ana Silva",
        email: "ana.silva@email.com",
        phone: "(11) 99999-1111",
        since: "2023-05-15",
        totalSpent: 1250.00,
        lastPurchaseDate: "2024-01-20",
        status: "active",
        cart: [
            { id: 101, name: "Kit Skin Care Premium", price: 299.90, quantity: 1, image: "https://images.unsplash.com/photo-1556228578-8d84f564495e?w=100&h=100&fit=crop" },
            { id: 102, name: "Sérum Vitamina C", price: 89.90, quantity: 2, image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop" }
        ],
        lastOrder: {
            id: "ORD-7782",
            date: "2024-01-20",
            total: 450.50,
            items: ["Hidratante Facial", "Protetor Solar FPS 70"]
        },
        searchHistory: ["protetor solar", "anti-rugas", "vitamina c", "creme noturno"],
        abandonedCart: false
    },
    {
        id: "CUST-002",
        name: "Carlos Oliveira",
        email: "carlos.o@email.com",
        phone: "(21) 98888-2222",
        since: "2023-08-10",
        totalSpent: 450.00,
        lastPurchaseDate: "2023-11-05",
        status: "inactive",
        cart: [
            { id: 201, name: "Shampoo Antiqueda", price: 45.00, quantity: 1, image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=100&h=100&fit=crop" }
        ],
        lastOrder: {
            id: "ORD-5541",
            date: "2023-11-05",
            total: 120.00,
            items: ["Gel Limpeza", "Tônico"]
        },
        searchHistory: ["shampoo", "condicionador", "queda de cabelo"],
        abandonedCart: true
    },
    {
        id: "CUST-003",
        name: "Mariana Souza",
        email: "mari.souza@email.com",
        phone: "(31) 97777-3333",
        since: "2024-01-05",
        totalSpent: 0.00,
        lastPurchaseDate: null,
        status: "lead",
        cart: [],
        lastOrder: null,
        searchHistory: ["batom vermelho", "base matte", "pó compacto"],
        abandonedCart: false
    },
    {
        id: "CUST-004",
        name: "Roberto Lima",
        email: "beto.lima@email.com",
        phone: "(11) 96666-4444",
        since: "2022-11-20",
        totalSpent: 3500.00,
        lastPurchaseDate: "2024-01-25",
        status: "vip",
        cart: [
            { id: 301, name: "Perfume Importado X", price: 450.00, quantity: 1, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop" }
        ],
        lastOrder: {
            id: "ORD-9901",
            date: "2024-01-25",
            total: 890.00,
            items: ["Perfume Y", "Desodorante"]
        },
        searchHistory: ["perfume", "presente", "kit masculino"],
        abandonedCart: true
    }
];

export default function EcommerceCustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);

    const filteredCustomers = MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <Helmet>
                <title>Clientes E-commerce | MedBeauty CRM</title>
            </Helmet>

            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Clientes E-commerce</h1>
                        <p className="text-muted-foreground">
                            Gestão completa da base de clientes, carrinhos e histórico.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MOCK_CUSTOMERS.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MOCK_CUSTOMERS.filter(c => c.abandonedCart).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                            <User className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{MOCK_CUSTOMERS.filter(c => c.status === 'active' || c.status === 'vip').length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Clients Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Base de Clientes</CardTitle>
                        <CardDescription>Clique em um cliente para ver detalhes completos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total Gasto</TableHead>
                                    <TableHead>Última Compra</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{customer.name}</span>
                                                <span className="text-xs text-muted-foreground">{customer.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                customer.status === 'vip' ? 'default' :
                                                    customer.status === 'active' ? 'secondary' :
                                                        customer.status === 'inactive' ? 'outline' : 'secondary'
                                            } className={customer.status === 'vip' ? 'bg-purple-600' : ''}>
                                                {customer.status.toUpperCase()}
                                            </Badge>
                                            {customer.abandonedCart && (
                                                <Badge variant="destructive" className="ml-2 text-[10px]">Carrinho Abandonado</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>R$ {customer.totalSpent.toFixed(2)}</TableCell>
                                        <TableCell>{customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>
                                                        Detalhes
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                                                    <DialogHeader>
                                                        <DialogTitle>Perfil do Cliente: {customer.name}</DialogTitle>
                                                        <DialogDescription>ID: {customer.id} • Cliente desde {new Date(customer.since).toLocaleDateString()}</DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">

                                                        {/* Coluna 1: Info Básica */}
                                                        <div className="md:col-span-1 space-y-4">
                                                            <Card>
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="text-sm">Contato</CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="text-sm space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                                        {customer.email}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                                        {customer.phone}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        Ultima compra: {customer.lastPurchaseDate || 'Nunk'}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>

                                                            <Card className={customer.abandonedCart ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20" : ""}>
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                                        <ShoppingCart className="h-4 w-4" />
                                                                        Carrinho Atual (Ao Vivo)
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    {customer.cart.length > 0 ? (
                                                                        <div className="space-y-3">
                                                                            {customer.cart.map((item, idx) => (
                                                                                <div key={idx} className="flex gap-3 items-center">
                                                                                    <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                                                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <p className="text-sm font-medium">{item.name}</p>
                                                                                        <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.price.toFixed(2)}</p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            <div className="pt-2 border-t mt-2 flex justify-between font-bold text-sm">
                                                                                <span>Total Carrinho:</span>
                                                                                <span>R$ {customer.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                                                                            </div>
                                                                            {customer.abandonedCart && (
                                                                                <div className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                                                                                    <AlertTriangle className="h-3 w-3" />
                                                                                    Cliente não finalizou a compra há 3 dias.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-muted-foreground">Carrinho vazio no momento.</p>
                                                                    )}
                                                                </CardContent>
                                                            </Card>
                                                        </div>

                                                        {/* Coluna 2 e 3: Histórico e Detalhes */}
                                                        <div className="md:col-span-2 space-y-4">
                                                            <Tabs defaultValue="historico">
                                                                <TabsList className="w-full justify-start">
                                                                    <TabsTrigger value="historico">Últimas Compras</TabsTrigger>
                                                                    <TabsTrigger value="pesquisas">Histórico de Pesquisas</TabsTrigger>
                                                                    <TabsTrigger value="interacoes">Interações</TabsTrigger>
                                                                </TabsList>

                                                                <TabsContent value="historico" className="mt-4">
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle className="text-base">Último Pedido Realizado</CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                            {customer.lastOrder ? (
                                                                                <div className="space-y-2">
                                                                                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                                                                                        <div>
                                                                                            <span className="font-bold block text-sm">#{customer.lastOrder.id}</span>
                                                                                            <span className="text-xs text-muted-foreground">{new Date(customer.lastOrder.date).toLocaleDateString()}</span>
                                                                                        </div>
                                                                                        <Badge>Concluído</Badge>
                                                                                        <div className="font-bold">R$ {customer.lastOrder.total.toFixed(2)}</div>
                                                                                    </div>
                                                                                    <div className="pl-4 border-l-2 border-muted">
                                                                                        <p className="text-sm font-medium mb-1">Itens:</p>
                                                                                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                                                                                            {customer.lastOrder.items.map((item, i) => (
                                                                                                <li key={i}>{item}</li>
                                                                                            ))}
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-muted-foreground text-sm">O cliente ainda não realizou compras.</p>
                                                                            )}
                                                                        </CardContent>
                                                                    </Card>
                                                                </TabsContent>

                                                                <TabsContent value="pesquisas" className="mt-4">
                                                                    <Card>
                                                                        <CardHeader>
                                                                            <CardTitle className="text-base flex items-center gap-2">
                                                                                <SearchIcon className="h-4 w-4" />
                                                                                Termos pesquisados recentemente
                                                                            </CardTitle>
                                                                        </CardHeader>
                                                                        <CardContent>
                                                                            {customer.searchHistory.length > 0 ? (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {customer.searchHistory.map((term, i) => (
                                                                                        <Badge key={i} variant="secondary" className="px-3 py-1">
                                                                                            {term}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-muted-foreground text-sm">Sem histórico de pesquisas recente.</p>
                                                                            )}
                                                                            <p className="text-xs text-muted-foreground mt-4">
                                                                                * Baseado nos logs de navegação dos últimos 30 dias.
                                                                            </p>
                                                                        </CardContent>
                                                                    </Card>
                                                                </TabsContent>

                                                                <TabsContent value="interacoes" className="mt-4">
                                                                    <p className="text-sm text-muted-foreground">Histórico de chats e tickets de suporte aparecerão aqui.</p>
                                                                </TabsContent>
                                                            </Tabs>
                                                        </div>

                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
