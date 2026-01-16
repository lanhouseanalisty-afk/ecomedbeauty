import { cn } from "@/lib/utils";
import { Package, AlertTriangle, XCircle } from "lucide-react";

interface StockIndicatorProps {
  stock?: number;
  inStock: boolean;
  showCount?: boolean;
  className?: string;
}

export function StockIndicator({
  stock,
  inStock,
  showCount = false,
  className,
}: StockIndicatorProps) {
  if (!inStock || stock === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm text-destructive",
          className
        )}
      >
        <XCircle className="h-4 w-4" />
        <span>Indisponível</span>
      </div>
    );
  }

  if (stock && stock <= 10) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm text-warning",
          className
        )}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>
          {showCount
            ? `Apenas ${stock} em estoque`
            : "Últimas unidades"}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-success",
        className
      )}
    >
      <Package className="h-4 w-4" />
      <span>
        {showCount && stock ? `${stock} em estoque` : "Em estoque"}
      </span>
    </div>
  );
}
