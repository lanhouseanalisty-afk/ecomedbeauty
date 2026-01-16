import { cn } from "@/lib/utils";
import { ActionButton } from "./QuickActions";
import { ShoppingCart } from "lucide-react";

// Import product images
import ithreadImg from "@/assets/product-ithread.jpg";
import eptqImg from "@/assets/product-eptq.jpg";
import idebenoneImg from "@/assets/product-idebenone.jpg";
import nanocannulaImg from "@/assets/product-nanocannula.jpg";

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: string;
  image?: string;
  href: string;
}

// Map product IDs to images
const productImages: Record<string, string> = {
  "1": ithreadImg,
  "2": eptqImg,
  "3": idebenoneImg,
  "4": nanocannulaImg,
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const imageUrl = productImages[product.id] || product.image;

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-soft",
        "animate-scale-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product image */}
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={`Produto ${product.name} - MedBeauty`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>

        {product.price && (
          <p className="mt-2 font-semibold text-primary">{product.price}</p>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton label="Ver detalhes" href={product.href} />
          <button className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
            <ShoppingCart className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}
