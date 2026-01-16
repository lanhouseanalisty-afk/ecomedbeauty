import { useState } from "react";
import { 
  Trash2, 
  Download, 
  Mail, 
  Tag, 
  MoreHorizontal,
  CheckSquare,
  Square,
  MinusSquare,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  selectionState: 'none' | 'some' | 'all';
  actions: BulkAction[];
  onAction: (actionId: string) => Promise<void>;
  isProcessing?: boolean;
}

export function BulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  selectionState,
  actions,
  onAction,
  isProcessing = false,
}: BulkActionsProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const handleAction = async (action: BulkAction) => {
    if (action.requireConfirmation) {
      setConfirmAction(action);
      return;
    }
    
    await executeAction(action.id);
  };

  const executeAction = async (actionId: string) => {
    setProcessingAction(actionId);
    try {
      await onAction(actionId);
    } finally {
      setProcessingAction(null);
      setConfirmAction(null);
    }
  };

  const SelectIcon = selectionState === 'all' 
    ? CheckSquare 
    : selectionState === 'some' 
      ? MinusSquare 
      : Square;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-primary/5 border rounded-lg animate-fade-in-up">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={selectionState === 'all' ? onDeselectAll : onSelectAll}
        >
          <SelectIcon className="h-4 w-4 mr-2" />
          {selectionState === 'all' ? 'Desmarcar todos' : 'Selecionar todos'}
        </Button>

        <Badge variant="secondary" className="font-normal">
          {selectedCount} de {totalCount} selecionados
        </Badge>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {actions.slice(0, 3).map((action) => (
            <Button
              key={action.id}
              variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={isProcessing || processingAction !== null}
            >
              {processingAction === action.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <action.icon className="h-4 w-4 mr-2" />
              )}
              {action.label}
            </Button>
          ))}

          {actions.length > 3 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.slice(3).map((action, index) => (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => handleAction(action)}
                    className={cn(
                      action.variant === 'destructive' && "text-destructive"
                    )}
                    disabled={isProcessing || processingAction !== null}
                  >
                    {processingAction === action.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <action.icon className="h-4 w-4 mr-2" />
                    )}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={onDeselectAll}>
          Cancelar
        </Button>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar ação</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmationMessage || 
                `Tem certeza que deseja ${confirmAction?.label.toLowerCase()} ${selectedCount} itens selecionados? Esta ação não pode ser desfeita.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction.id)}
              className={cn(
                confirmAction?.variant === 'destructive' && "bg-destructive hover:bg-destructive/90"
              )}
            >
              {processingAction === confirmAction?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
