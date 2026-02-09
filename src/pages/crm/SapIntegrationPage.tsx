
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { RefreshCw, Database, DollarSign, Package, Settings } from 'lucide-react';
import { sapService, SapProduct, SapOrder, SapConfig } from '@/services/sap-mock';
import { toast } from '@/components/ui/use-toast';

export default function SapIntegrationPage() {
    const [products, setProducts] = useState<SapProduct[]>([]);
    const [orders, setOrders] = useState<SapOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    // Config State
    const [config, setConfig] = useState<SapConfig>(sapService.getConfig());

    useEffect(() => {
        // Load config from LocalStorage on mount
        const savedConfig = localStorage.getItem('sap_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig(parsed);
            sapService.updateConfig(parsed);
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prods, ords] = await Promise.all([
                sapService.getInventory(),
                sapService.getRecentOrders()
            ]);
            setProducts(prods);
            setOrders(ords);
            setLastSync(new Date());
            toast({
                title: config.useRealConnection ? 'Dados REAIS sincronizados' : 'Dados MOCK sincronizados',
                description: config.useRealConnection ? 'Conexão com SAP Service Layer bem sucedida.' : 'Modo de simulação ativo.'
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Erro de conexão',
                description: 'Verifique as configurações ou a VPN. Voltando para Mock...',
                variant: 'destructive'
            });
            // Fallback to mock for UI stability if desired, or show error state
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = () => {
        sapService.updateConfig(config);
        localStorage.setItem('sap_config', JSON.stringify(config));
        setShowConfig(false);
        toast({ title: 'Configurações salvas!' });
        fetchData(); // Retry with new config
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Database className="w-8 h-8 text-blue-600" />
                        Integração SAP Business One
                    </h1>
                    <p className="text-muted-foreground mt-2 flex items-center gap-2">
                        Status:
                        <Badge variant={config.useRealConnection ? "default" : "secondary"}>
                            {config.useRealConnection ? "PRODUÇÃO (Real)" : "SIMULAÇÃO (Mock)"}
                        </Badge>
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        <Dialog open={showConfig} onOpenChange={setShowConfig}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Settings className="w-4 h-4 mr-2" /> Configurar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Configuração SAP Service Layer</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="use-real"
                                            checked={config.useRealConnection}
                                            onCheckedChange={c => setConfig({ ...config, useRealConnection: c })}
                                        />
                                        <Label htmlFor="use-real">Usar Conexão Real</Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>API URL (Service Layer)</Label>
                                        <Input value={config.apiUrl} onChange={e => setConfig({ ...config, apiUrl: e.target.value })} placeholder="https://server:50000/b1s/v1" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Company DB</Label>
                                        <Input value={config.companyDB} onChange={e => setConfig({ ...config, companyDB: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Usuário SAP</Label>
                                            <Input value={config.user} onChange={e => setConfig({ ...config, user: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Senha</Label>
                                            <Input type="password" value={config.password} onChange={e => setConfig({ ...config, password: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveConfig}>Salvar & Testar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={fetchData} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sincronizar
                        </Button>
                    </div>
                    {lastSync && (
                        <span className="text-xs text-muted-foreground">
                            Última sync: {lastSync.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Status da Conexão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.useRealConnection ? 'bg-blue-500' : 'bg-yellow-500'} animate-pulse`} />
                            <span className="text-2xl font-bold">{loading ? 'Verificando...' : (config.useRealConnection ? 'Online (Real)' : 'Simulado')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Service Layer v1</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Itens em Estoque</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="text-2xl font-bold">{products.reduce((acc, p) => acc + p.OnHand, 0)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Unidades totais</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pedidos do Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="text-2xl font-bold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    orders.reduce((acc, o) => acc + o.DocTotal, 0)
                                )}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Volume de vendas</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inventory" className="w-full">
                <TabsList>
                    <TabsTrigger value="inventory">Estoque (OITM)</TabsTrigger>
                    <TabsTrigger value="orders">Pedidos (ORDR)</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mestre de Itens</CardTitle>
                            <CardDescription>Visualização em tempo real da tabela OITM</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ItemCode</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Estoque</TableHead>
                                        <TableHead>Preço Unit.</TableHead>
                                        <TableHead>Depósito</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.ItemCode}>
                                            <TableCell className="font-mono text-xs">{product.ItemCode}</TableCell>
                                            <TableCell>{product.ItemName}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.OnHand < 20 ? 'destructive' : 'outline'}>
                                                    {product.OnHand} un
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.Price)}
                                            </TableCell>
                                            <TableCell>{product.WhsCode}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="orders">
                    <Card>
                        <CardHeader>
                            <CardTitle>Últimos Pedidos</CardTitle>
                            <CardDescription>Visualização da tabela ORDR</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>DocEntry</TableHead>
                                        <TableHead>Cliente (CardName)</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.DocEntry}>
                                            <TableCell className="font-mono text-xs">{order.DocEntry}</TableCell>
                                            <TableCell>{order.CardName}</TableCell>
                                            <TableCell>{new Date(order.DocDate).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.DocTotal)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={order.DocStatus === 'C' ? 'secondary' : 'default'}>
                                                    {order.DocStatus === 'O' ? 'Aberto' : 'Fechado'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
