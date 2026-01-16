import { useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { CartItem, Product } from "@/types/product";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Button } from "@/components/ui/button";

interface CartRecommendationsProps {
  cartItems: CartItem[];
  maxItems?: number;
}

// Define complementary category pairs for smarter recommendations
const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  "Preenchedores": ["Instrumentais", "Skincare"],
  "Fios": ["Instrumentais", "Skincare"],
  "Skincare": ["Preenchedores", "Fios"],
  "Instrumentais": ["Preenchedores", "Fios"],
};

export function CartRecommendations({ cartItems, maxItems = 8 }: CartRecommendationsProps) {
  const { addItem } = useCart();
  const { items: recentlyViewed } = useRecentlyViewed();
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const recommendations = useMemo(() => {
    if (cartItems.length === 0) return [];

    const cartProductIds = new Set(cartItems.map((item) => item.product.id));
    const cartCategories = [...new Set(cartItems.map((item) => item.product.category))];

    // Score-based recommendation system
    const scoredProducts = products
      .filter((product) => !cartProductIds.has(product.id) && product.inStock)
      .map((product) => {
        let score = 0;

        // +3 points if from same category as cart items
        if (cartCategories.includes(product.category)) {
          score += 3;
        }

        // +4 points if from complementary category
        const isComplementary = cartCategories.some((cat) =>
          COMPLEMENTARY_CATEGORIES[cat]?.includes(product.category)
        );
        if (isComplementary) {
          score += 4;
        }

        // +5 points if recently viewed (highest priority)
        if (recentlyViewed.some((rv) => rv.id === product.id)) {
          score += 5;
        }

        // +1-2 points based on rating
        if (product.rating) {
          score += product.rating >= 4.8 ? 2 : product.rating >= 4.5 ? 1 : 0;
        }

        // +1 point if has badge (bestseller, new, etc)
        if (product.badge) {
          score += 1;
        }

        return { product, score };
      });

    // Sort by score descending, then by rating
    return scoredProducts
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.product.rating || 0) - (a.product.rating || 0);
      })
      .slice(0, maxItems)
      .map((item) => item.product);
  }, [cartItems, recentlyViewed, maxItems]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 animate-fade-in-up opacity-0" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Você também pode gostar
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link
            to="/produtos"
            className="hidden sm:flex items-center gap-1 text-sm text-primary hover:underline ml-2"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {recommendations.map((product, index) => (
            <div
              key={product.id}
              className="min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] flex-shrink-0"
            >
              <div
                className="group h-full rounded-xl border border-border bg-card p-3 transition-all hover:shadow-lg hover:border-primary/30 animate-fade-in-up opacity-0"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                {/* Image */}
                <Link to={`/produto/${product.id}`} className="block overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {/* Info */}
                <div className="mt-3 space-y-2">
                  <Link
                    to={`/produto/${product.id}`}
                    className="block text-sm font-medium text-foreground line-clamp-1 hover:text-primary transition-colors"
                  >
                    {product.name}
                  </Link>

                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">
                      {product.rating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/produtos"
        className="flex sm:hidden items-center justify-center gap-1 text-sm text-primary hover:underline mt-4"
      >
        Ver todos os produtos
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
