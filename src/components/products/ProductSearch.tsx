import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductSearchProps {
  onClose?: () => void;
  className?: string;
}

export function ProductSearch({ onClose, className }: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: productsData, isLoading } = useProducts({
    query: query.length >= 2 ? query : undefined,
    enabled: query.length >= 2,
    top: 5
  });

  const results = productsData?.items || [];

  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleSelect = () => {
    setQuery("");
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder="Buscar produtos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-card shadow-elegant animate-fade-in-down">
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhum produto encontrado para "{query}"
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.slice(0, 5).map((product) => (
                <Link
                  key={product.id}
                  to={`/produto/${product.id}`}
                  onClick={handleSelect}
                  className="flex items-center gap-4 p-3 transition-colors hover:bg-muted"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.category}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              ))}

              {productsData && productsData.total > 5 && (
                <Link
                  to={`/produtos?q=${encodeURIComponent(query)}`}
                  onClick={handleSelect}
                  className="block p-3 text-center text-sm font-medium text-primary hover:bg-muted"
                >
                  Ver todos os {productsData.total} resultados
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
