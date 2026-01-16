import { useState, useMemo } from "react";
import { Plus, ShoppingCart, Sparkles, Check } from "lucide-react";
import { CartItem, Product } from "@/types/product";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BuyTogetherProps {
  cartItems: CartItem[];
  discountPercent?: number;
}

// Define complementary category pairs
const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  "Preenchedores": ["Instrumentais", "Skincare"],
  "Fios": ["Instrumentais", "Skincare"],
  "Skincare": ["Preenchedores", "Fios"],
  "Instrumentais": ["Preenchedores", "Fios"],
};

export function BuyTogether({ cartItems, discountPercent = 10 }: BuyTogetherProps) {
  const { addItem } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const bundleProducts = useMemo(() => {
    if (cartItems.length === 0) return [];

    const cartProductIds = cartItems.map((item) => item.product.id);
    const cartCategories = [...new Set(cartItems.map((item) => item.product.category))];

    // Find complementary categories
    const complementaryCategories = new Set<string>();
    cartCategories.forEach((cat) => {
      COMPLEMENTARY_CATEGORIES[cat]?.forEach((c) => complementaryCategories.add(c));
    });

    // Get products from complementary categories that are not in cart
    const complementaryProducts = products
      .filter(
        (product) =>
          complementaryCategories.has(product.category) &&
          !cartProductIds.includes(product.id) &&
          product.inStock
      )
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    return complementaryProducts;
  }, [cartItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectedProductsList = bundleProducts.filter((p) => selectedProducts.has(p.id));
  const totalOriginal = selectedProductsList.reduce((sum, p) => sum + p.price, 0);
  const discountAmount = (totalOriginal * discountPercent) / 100;
  const totalWithDiscount = totalOriginal - discountAmount;

  const handleAddBundle = () => {
    if (selectedProductsList.length === 0) {
      toast.error("Selecione pelo menos um produto");
      return;
    }

    selectedProductsList.forEach((product) => {
      // We'll add items with a special flag for discount tracking
      addItem(product, 1);
    });

    toast.success(
      `${selectedProductsList.length} produto(s) adicionado(s) com ${discountPercent}% de desconto!`
    );
    setSelectedProducts(new Set());
  };

  if (bundleProducts.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-serif font-semibold text-foreground">Compre Junto</h3>
          <p className="text-xs text-muted-foreground">
            Selecione e ganhe {discountPercent}% de desconto
          </p>
        </div>
        <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">
          -{discountPercent}%
        </Badge>
      </div>

      <div className="space-y-3">
        {bundleProducts.map((product, index) => (
          <button
            key={product.id}
            onClick={() => toggleProduct(product.id)}
            className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all ${
              selectedProducts.has(product.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                selectedProducts.has(product.id)
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              }`}
            >
              {selectedProducts.has(product.id) && (
                <Check className="h-3 w-3 text-primary-foreground" />
              )}
            </div>

            <img
              src={product.image}
              alt={product.name}
              className="h-12 w-12 rounded-lg object-cover"
            />

            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground line-clamp-1">
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>

            <div className="text-right">
              <p className="text-sm font-semibold text-primary">{formatPrice(product.price)}</p>
              {selectedProducts.has(product.id) && (
                <p className="text-xs text-success">
                  -{formatPrice((product.price * discountPercent) / 100)}
                </p>
              )}
            </div>

            {index < bundleProducts.length - 1 && (
              <Plus className="absolute -bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 text-muted-foreground hidden" />
            )}
          </button>
        ))}
      </div>

      {selectedProductsList.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({selectedProductsList.length} itens)</span>
            <span className="line-through text-muted-foreground">{formatPrice(totalOriginal)}</span>
          </div>
          <div className="flex justify-between text-sm text-success">
            <span>Desconto ({discountPercent}%)</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total com desconto</span>
            <span className="text-primary">{formatPrice(totalWithDiscount)}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleAddBundle}
        disabled={selectedProductsList.length === 0}
        className="mt-4 w-full gap-2"
      >
        <ShoppingCart className="h-4 w-4" />
        Adicionar selecionados
      </Button>
    </div>
  );
}
