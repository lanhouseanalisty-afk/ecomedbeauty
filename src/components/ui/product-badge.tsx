import { cn } from "@/lib/utils";
import { Sparkles, Star, Clock, Percent } from "lucide-react";

interface ProductBadgeProps {
  badge: "new" | "bestseller" | "limited" | "sale";
  className?: string;
}

const badgeConfig = {
  new: {
    label: "Novo",
    icon: Sparkles,
    className: "bg-info text-info-foreground",
  },
  bestseller: {
    label: "Mais Vendido",
    icon: Star,
    className: "bg-warning text-warning-foreground",
  },
  limited: {
    label: "Edição Limitada",
    icon: Clock,
    className: "bg-destructive text-destructive-foreground",
  },
  sale: {
    label: "Promoção",
    icon: Percent,
    className: "bg-success text-success-foreground",
  },
};

export function ProductBadge({ badge, className }: ProductBadgeProps) {
  const config = badgeConfig[badge];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
