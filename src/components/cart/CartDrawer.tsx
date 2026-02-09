
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg bg-white/95 backdrop-blur-xl border-l-[#2B0F54]/10 shadow-elegant">
                <SheetHeader className="px-6 border-b border-[#2B0F54]/5 pb-4">
                    <SheetTitle className="flex items-center gap-2 font-serif text-2xl text-[#2B0F54]">
                        <ShoppingBag className="h-6 w-6 text-[#cfa79d]" />
                        Seu Carrinho
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 px-6 text-center">
                            <div className="rounded-full bg-[#fdfbf7] p-6">
                                <ShoppingBag className="h-12 w-12 text-[#cfa79d]/40" />
                            </div>
                            <p className="text-lg font-serif font-medium text-[#2B0F54]">Carrinho vazio</p>
                            <p className="text-sm text-slate-500">Comece a explorar nossa linha científica de estética.</p>
                            <Button
                                variant="outline"
                                className="rounded-full border-[#2B0F54]/20 text-[#2B0F54] hover:bg-[#2B0F54] hover:text-white"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Continuar Comprando
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-full px-6 py-4">
                            <div className="flex flex-col gap-6">
                                {items.map((item) => (
                                    <div key={item.product.id} className="flex gap-4 group">
                                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#2B0F54]/5 bg-slate-50">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col">
                                            <div className="flex justify-between gap-2">
                                                <div className="space-y-1">
                                                    <h4 className="font-serif text-base font-bold text-[#2B0F54] line-clamp-1">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-xs text-[#cfa79d] font-medium uppercase tracking-wider">
                                                        {item.product.category}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-[#2B0F54]">
                                                    {formatCurrency(item.product.price)}
                                                </p>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between">
                                                <div className="flex items-center rounded-full border border-[#2B0F54]/10 bg-white shadow-sm">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-[#2B0F54]/60 hover:text-[#2B0F54]"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-xs font-bold text-[#2B0F54]">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-full text-[#2B0F54]/60 hover:text-[#2B0F54]"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-300 hover:text-destructive transition-colors"
                                                    onClick={() => removeItem(item.product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-[#2B0F54]/5 bg-slate-50/50 p-6 space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-base font-serif font-bold text-[#2B0F54]">
                                <span>Total estimado</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <p className="text-xs text-slate-500 italic">
                                * Impostos e frete calculados no checkout
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button
                                asChild
                                className="w-full rounded-full bg-[#2B0F54] hover:bg-[#1a0933] py-6 text-sm font-bold uppercase tracking-widest shadow-lg shadow-[#2B0F54]/20 transition-all hover:scale-[1.02]"
                            >
                                <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                                    Finalizar Compra
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-[#2B0F54]"
                                onClick={() => setIsCartOpen(false)}
                            >
                                Continuar Navegando
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
