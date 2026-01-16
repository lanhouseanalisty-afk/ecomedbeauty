import { Shield, Truck, CreditCard, Award, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  {
    icon: Shield,
    label: "Aprovado ANVISA",
    description: "Produtos regulamentados",
  },
  {
    icon: Truck,
    label: "Frete Grátis",
    description: "Acima de R$ 500",
  },
  {
    icon: Lock,
    label: "Pagamento Seguro",
    description: "Criptografia SSL",
  },
  {
    icon: RefreshCw,
    label: "Troca Fácil",
    description: "30 dias para troca",
  },
];

interface TrustBadgesProps {
  variant?: "horizontal" | "grid";
  className?: string;
}

export function TrustBadges({ variant = "horizontal", className }: TrustBadgesProps) {
  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-2 gap-4 lg:grid-cols-4",
          className
        )}
      >
        {badges.map((badge) => (
          <div
            key={badge.label}
            className="flex flex-col items-center rounded-xl border border-border bg-card p-4 text-center transition-all hover:border-primary/30 hover:shadow-soft"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <badge.icon className="h-6 w-6 text-primary" />
            </div>
            <h4 className="mt-3 font-semibold text-foreground">{badge.label}</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {badge.description}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-8",
        className
      )}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-3 text-muted-foreground"
        >
          <badge.icon className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">{badge.label}</p>
            <p className="text-xs">{badge.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
