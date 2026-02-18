
import { useState, useMemo } from "react";
import {
    ShoppingBag,
    Search,
    Tag,
    ShoppingCart,
    History,
    Plus,
    Minus,
    Trash2,
    CheckCircle2,
    Package,
    CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProductsAdmin } from "@/hooks/useEcommerce";
import { useCreateStoreRequest, useCorporateStoreRequests, useEmployeeDirectory } from "@/hooks/useIntranet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils"; // Assuming this utility exists or I'll define it

export default function CorporateStorePage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number, image_url?: string }[]>([]);

    const { data: products, isLoading: loadingProducts } = useProductsAdmin();
    const { data: employees } = useEmployeeDirectory();

    const currentEmployee = useMemo(() =>
        employees?.find(e => e.email === user?.email),
        [employees, user]
    );

    const { data: requests, isLoading: loadingRequests } = useCorporateStoreRequests(currentEmployee?.id);
    const createRequest = useCreateStoreRequest();

    const filteredProducts = products?.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.is_active
    );

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (!currentEmployee) return;

        for (const item of cart) {
            await createRequest.mutateAsync({
                employee_id: currentEmployee.id,
                product_id: item.id,
                quantity: item.quantity,
                payment_method: 'payroll_deduction',
            });
        }
        setCart([]);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pendente</Badge>;
            case 'approved': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Aprovado</Badge>;
            case 'delivered': return <Badge variant="secondary" className="bg-green-100 text-green-700">Entregue</Badge>;
            case 'cancelled': return <Badge variant="secondary" className="bg-rose-100 text-rose-700">Cancelado</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Loja Corporativa</h1>
                    <p className="text-muted-foreground italic">
                        "Benefícios exclusivos para quem faz a Medbeauty crescer."
                    </p>
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="rounded-full h-12 px-6 gap-3 relative shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            <ShoppingCart className="h-5 w-5" />
                            <span>Meu Carrinho</span>
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {cart.length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md flex flex-col p-0 rounded-l-[40px]">
                        <SheetHeader className="p-8 pb-4">
                            <SheetTitle className="text-2xl font-serif">Meu Carrinho</SheetTitle>
                            <SheetDescription>
                                Confira seus itens antes de solicitar o benefício.
                            </SheetDescription>
                        </SheetHeader>

                        <ScrollArea className="flex-1 px-8">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <ShoppingBag className="h-12 w-12 text-slate-200" />
                                    <p className="text-slate-400">Seu carrinho está vazio.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="h-20 w-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex-shrink-0">
                                                <img src={item.image_url || "https://placehold.co/100"} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
                                                <p className="text-primary font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}</p>
                                                <div className="flex items-center justify-between pt-2">
                                                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white" onClick={() => updateQuantity(item.id, -1)}>
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white" onClick={() => updateQuantity(item.id, 1)}>
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => removeFromCart(item.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        <div className="p-8 border-t bg-slate-50/50 rounded-bl-[40px]">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-serif font-bold pt-4 border-t border-slate-200">
                                    <span>Total do Pedido</span>
                                    <span className="text-primary">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6 flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-primary tracking-wider">Método de Pagamento</p>
                                    <p className="text-xs text-slate-600">Desconto em Folha (Próximo Mês)</p>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 rounded-2xl text-base font-bold"
                                disabled={cart.length === 0 || createRequest.isPending}
                                onClick={handleCheckout}
                            >
                                {createRequest.isPending ? "Processando..." : "Confirmar Solicitação"}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <Tabs defaultValue="browse" className="space-y-6">
                <TabsList className="bg-white border p-1 rounded-full w-fit">
                    <TabsTrigger value="browse" className="rounded-full px-6 gap-2">
                        <ShoppingBag className="h-4 w-4" />
                        Catálogo
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-full px-6 gap-2">
                        <History className="h-4 w-4" />
                        Meus Pedidos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="browse" className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="Encontrar produto pelo nome..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl text-lg"
                        />
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72 w-full rounded-3xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts?.map((product) => (
                                <Card key={product.id} className="group rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
                                    <div className="relative h-48 overflow-hidden bg-slate-50">
                                        <img
                                            src={product.image_url || "https://placehold.co/300"}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <Badge className="bg-white/90 text-primary backdrop-blur-sm border-none font-bold">
                                                Benefício
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader className="p-5 pb-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                {product.name}
                                            </h3>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Tag className="h-3 w-3 text-slate-400" />
                                            <span className="text-xs text-slate-500">{product.sku || "SEM SKU"}</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-900">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="p-5 pt-0">
                                        <Button
                                            className="w-full rounded-xl bg-slate-50 text-slate-600 hover:bg-primary hover:text-white border-none h-11 font-bold"
                                            onClick={() => addToCart(product)}
                                        >
                                            Adicionar
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!loadingProducts && filteredProducts?.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-400">Nenhum produto encontrado na loja corporativa.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader>
                            <CardTitle>Histórico de Solicitações</CardTitle>
                            <CardDescription>Acompanhe o status dos seus benefícios.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingRequests ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                                </div>
                            ) : requests?.length === 0 ? (
                                <div className="py-20 text-center space-y-4">
                                    <History className="h-12 w-12 text-slate-200 mx-auto" />
                                    <p className="text-slate-400">Você ainda não fez nenhum pedido.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests?.map((req) => (
                                        <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 p-1 flex-shrink-0">
                                                    <img src={req.product?.image_url || "https://placehold.co/50"} className="h-full w-full object-cover rounded-lg" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{req.product?.name}</h4>
                                                    <p className="text-xs text-slate-500">Qtd: {req.quantity} • {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(req.product?.price || 0)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Solicitado em</p>
                                                    <p className="text-xs font-medium text-slate-600">{new Date(req.created_at).toLocaleDateString()}</p>
                                                </div>
                                                {getStatusBadge(req.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
