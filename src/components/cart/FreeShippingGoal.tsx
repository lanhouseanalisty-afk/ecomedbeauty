import { Truck, Gift, ShoppingBag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FreeShippingGoalProps {
  cartTotal: number;
  threshold?: number;
}

export function FreeShippingGoal({ cartTotal, threshold = 500 }: FreeShippingGoalProps) {
  const { addItem } = useCart();
  const remaining = threshold - cartTotal;
  const progress = Math.min((cartTotal / threshold) * 100, 100);
  const hasReached = remaining <= 0;

  // Find products that would help reach the threshold
  const suggestedProducts = products
    .filter((p) => p.inStock && p.price <= remaining && p.price >= remaining * 0.3)
    .sort((a, b) => Math.abs(remaining - a.price) - Math.abs(remaining - b.price))
    .slice(0, 3);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (hasReached) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/5 p-4 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20">
            <Gift className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-medium text-success">Parabéns! Você ganhou frete grátis!</p>
            <p className="text-sm text-muted-foreground">
              Compras acima de {formatPrice(threshold)} têm entrega gratuita
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">
            Faltam <span className="text-primary font-bold">{formatPrice(remaining)}</span> para frete grátis!
          </p>
          <p className="text-sm text-muted-foreground">
            Adicione mais itens para desbloquear a entrega gratuita
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(cartTotal)}</span>
          <span>{formatPrice(threshold)}</span>
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-sm font-medium text-foreground">Adicione e ganhe frete grátis:</p>
          <div className="space-y-2">
            {suggestedProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addItem(product, 1)}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-2 transition-all hover:border-primary/50 hover:bg-primary/5 group"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    + {formatPrice(product.price)}
                  </span>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link to="/produtos">Ver todos os produtos</Link>
      </Button>
    </div>
  );
}
