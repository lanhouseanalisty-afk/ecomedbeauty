import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { ProductBadge } from "@/components/ui/product-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { StockIndicator } from "@/components/ui/stock-indicator";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-lifted hover-lift",
        "animate-fade-in-up opacity-0"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product badges */}
      {product.badge && (
        <div className="absolute left-3 top-3 z-10">
          <ProductBadge badge={product.badge} />
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleWishlistClick}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur transition-all hover:bg-card",
          isInWishlist(product.id) ? "text-destructive" : "text-muted-foreground hover:text-primary"
        )}
      >
        <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
      </button>

      {/* Product image */}
      <Link to={`/produto/${product.id}`} className="img-zoom block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={`${product.name} - MedBeauty`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {product.originalPrice && (
            <span className="absolute bottom-3 left-3 rounded-full bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </span>
          )}
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button variant="secondary" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Ver Detalhes
            </Button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {product.category}
        </span>
        
        <Link to={`/produto/${product.id}`}>
          <h3 className="mt-1 font-serif text-lg font-semibold text-foreground transition-colors hover:text-primary line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="mt-2">
            <RatingStars
              rating={product.rating}
              size="sm"
              reviewCount={product.reviewCount}
            />
          </div>
        )}
        
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        {/* Stock indicator */}
        <div className="mt-3">
          <StockIndicator stock={product.stock} inStock={product.inStock} />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions */}
        <Button
          onClick={() => addItem(product)}
          className="mt-4 w-full gap-2"
          disabled={!product.inStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.inStock ? "Adicionar" : "Indisponível"}
        </Button>
      </div>
    </div>
  );
}

