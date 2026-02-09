import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { ProductBadge } from "@/components/ui/product-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { ShoppingCart, Heart, Eye, Microscope, ArrowRight } from "lucide-react";
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
        "group relative flex flex-col overflow-hidden rounded-[2rem] border border-[#2B0F54]/5 bg-white shadow-soft transition-all duration-500 hover:border-[#2B0F54]/20 hover:shadow-elegant hover:-translate-y-2",
        "animate-fade-in-up opacity-0"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product badges */}
      {product.badge && (
        <div className="absolute left-4 top-4 z-10">
          <ProductBadge badge={product.badge} className="bg-white/80 backdrop-blur-md border-[#2B0F54]/10 text-[#2B0F54] font-bold" />
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleWishlistClick}
        className={cn(
          "absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/20 transition-all hover:bg-white hover:scale-110",
          isInWishlist(product.id) ? "text-destructive" : "text-[#2B0F54]/40 hover:text-[#2B0F54]"
        )}
      >
        <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
      </button>

      {/* Product image */}
      <Link to={`/produto/${product.id}`} className="block overflow-hidden bg-slate-50 relative aspect-[4/5]">
        <img
          src={product.image}
          alt={`${product.name} - MedBeauty`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Scientific Precision Watermark */}
        <div className="absolute bottom-4 right-4 opacity-10 blur-[0.5px] group-hover:opacity-30 transition-opacity">
          <Microscope className="h-16 w-16 text-[#2B0F54]" />
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 z-10">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 flex gap-2 shadow-lg border border-white/20">
            <Button
              className="flex-1 rounded-xl bg-[#2B0F54] text-white hover:bg-[#1a0933] h-12 gap-2"
              onClick={(e) => { e.preventDefault(); addItem(product); }}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Comprar</span>
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-[#2B0F54]/10">
              <Eye className="h-5 w-5 text-[#2B0F54]" />
            </Button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#cfa79d]">
            {product.category}
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#cfa79d]/30 to-transparent" />
        </div>

        <Link to={`/produto/${product.id}`} className="block group/title">
          <h3 className="font-serif text-xl font-bold text-[#2B0F54] transition-colors group-hover/title:text-[#cfa79d] line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed font-medium">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="pt-1 flex items-center justify-between">
            <RatingStars
              rating={product.rating}
              size="sm"
              reviewCount={product.reviewCount}
            />
            <span className="text-[10px] font-bold text-[#2B0F54]/40 uppercase tracking-widest">Clinicamente Testado</span>
          </div>
        )}

        <div className="flex items-end justify-between pt-4 mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-[#2B0F54]">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="h-8 w-8 rounded-full border border-[#2B0F54]/5 flex items-center justify-center bg-slate-50">
            <ArrowRight className="h-4 w-4 text-[#2B0F54]/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

