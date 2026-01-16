import { LucideIcon, Plus, Search, FileX, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant = 'empty' | 'search' | 'error' | 'filter';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; iconClass: string }> = {
  empty: { icon: FileX, iconClass: "text-muted-foreground" },
  search: { icon: Search, iconClass: "text-muted-foreground" },
  error: { icon: AlertCircle, iconClass: "text-destructive" },
  filter: { icon: Search, iconClass: "text-muted-foreground" },
};

export function EmptyState({
  variant = 'empty',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className={cn(
        "flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4",
        variant === 'error' && "bg-destructive/10"
      )}>
        <Icon className={cn("h-8 w-8", icon ? "text-muted-foreground" : config.iconClass)} />
      </div>
      
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
