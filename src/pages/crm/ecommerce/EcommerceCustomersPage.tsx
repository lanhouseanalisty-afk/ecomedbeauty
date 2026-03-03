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

import { useEcommerceCustomers } from "@/hooks/useEcommerce";
import { Loader2 } from "lucide-react";

export default function EcommerceCustomersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: customers, isLoading } = useEcommerceCustomers();
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const filteredCustomers = (customers || []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Carregando base de clientes...</p>
            </div>
        );
    }

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
                            <div className="text-2xl font-bold">{customers?.length || 0}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Carrinhos Abandonados</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                            <User className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customers?.filter(c => c.status === 'active' || c.status === 'vip').length || 0}</div>
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
                                        <TableCell>R$ {customer.totalSpent?.toFixed(2) || "0,00"}</TableCell>
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
                                                                        Ultima compra: {customer.lastPurchaseDate ? new Date(customer.lastPurchaseDate).toLocaleDateString() : 'Nenhuma'}
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
                                                                    {customer.cart && customer.cart.length > 0 ? (
                                                                        <div className="space-y-3">
                                                                            {customer.cart.map((item: any, idx: number) => (
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
                                                                                <span>R$ {customer.cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                                                                            </div>
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
                                                                                        <Badge>{customer.lastOrder.status || 'Pendente'}</Badge>
                                                                                        <div className="font-bold">R$ {Number(customer.lastOrder.total).toFixed(2)}</div>
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
                                                                            {customer.searchHistory && customer.searchHistory.length > 0 ? (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {customer.searchHistory.map((term: string, i: number) => (
                                                                                        <Badge key={i} variant="secondary" className="px-3 py-1">
                                                                                            {term}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-muted-foreground text-sm">Sem histórico de pesquisas recente.</p>
                                                                            )}
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
