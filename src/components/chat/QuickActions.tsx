import { cn } from "@/lib/utils";
import { Package, Truck, MessageCircle, Gift, ExternalLink } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  message: string;
}

const quickActions: QuickAction[] = [
  {
    id: "products",
    label: "Ver Produtos",
    icon: <Package className="h-4 w-4" />,
    message: "Quero conhecer os produtos MedBeauty",
  },
  {
    id: "tracking",
    label: "Rastrear Pedido",
    icon: <Truck className="h-4 w-4" />,
    message: "Quero rastrear meu pedido",
  },
  {
    id: "support",
    label: "Falar com SAC",
    icon: <MessageCircle className="h-4 w-4" />,
    message: "Preciso falar com o SAC",
  },
  {
    id: "offers",
    label: "Ofertas",
    icon: <Gift className="h-4 w-4" />,
    message: "Quero receber novidades e ofertas",
  },
];

interface QuickActionsProps {
  onActionClick: (message: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {quickActions.map((action, index) => (
        <button
          key={action.id}
          onClick={() => onActionClick(action.message)}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-card transition-all duration-200",
            "hover:border-primary/30 hover:bg-rose-gold-light/20 hover:shadow-soft",
            "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 focus:ring-offset-background",
            "animate-fade-in-up"
          )}
          style={{ animationDelay: `${index * 75}ms` }}
        >
          <span className="text-primary">{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}

export function ActionButton({ label, href, onClick, variant = "secondary" }: ActionButtonProps) {
  const className = cn(
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-soft hover:bg-rose-gold-dark focus:ring-primary"
      : "border border-border bg-card text-card-foreground hover:border-primary/30 hover:bg-rose-gold-light/20 focus:ring-primary/30"
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
}
