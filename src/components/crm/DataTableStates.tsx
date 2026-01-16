import { AlertCircle, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Erro ao carregar dados", 
  message = "Ocorreu um erro. Tente novamente.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "pending" | "info";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusIndicator({ status, label, size = "md" }: StatusIndicatorProps) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    pending: Clock,
    info: AlertCircle,
  };

  const colors = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    pending: "text-muted-foreground",
    info: "text-info",
  };

  const sizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const Icon = icons[status];

  return (
    <div className="flex items-center gap-1.5">
      <Icon className={`${sizes[size]} ${colors[status]}`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
