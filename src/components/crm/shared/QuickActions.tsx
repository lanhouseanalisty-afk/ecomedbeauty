import { useState, useEffect, useCallback } from "react";
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { 
  Plus, 
  Search, 
  Users, 
  FileText, 
  DollarSign, 
  Package, 
  TicketCheck,
  Megaphone,
  Scale,
  Truck,
  Settings,
  Moon,
  Sun,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  group: string;
}

interface QuickActionsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuickActionsDialog({ open, onOpenChange }: QuickActionsDialogProps) {
  const [isOpen, setIsOpen] = useState(open ?? false);
  const navigate = useNavigate();

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  }, [onOpenChange]);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!isOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, handleOpenChange]);

  const actions: QuickAction[] = [
    // Criar
    { id: 'new-lead', label: 'Novo Lead', icon: Plus, group: 'Criar', shortcut: '⌘L', action: () => navigate('/crm/comercial') },
    { id: 'new-employee', label: 'Novo Funcionário', icon: Users, group: 'Criar', action: () => navigate('/crm/rh') },
    { id: 'new-ticket', label: 'Novo Ticket', icon: TicketCheck, group: 'Criar', action: () => navigate('/crm/tech') },
    { id: 'new-invoice', label: 'Nova Fatura', icon: DollarSign, group: 'Criar', action: () => navigate('/crm/financeiro') },
    { id: 'new-campaign', label: 'Nova Campanha', icon: Megaphone, group: 'Criar', action: () => navigate('/crm/marketing') },
    { id: 'new-contract', label: 'Novo Contrato', icon: Scale, group: 'Criar', action: () => navigate('/crm/juridico') },
    { id: 'new-shipment', label: 'Novo Envio', icon: Truck, group: 'Criar', action: () => navigate('/crm/logistica') },
    { id: 'new-product', label: 'Novo Produto', icon: Package, group: 'Criar', action: () => navigate('/crm/ecommerce/produtos') },
    
    // Navegar
    { id: 'nav-rh', label: 'RH Dashboard', icon: Users, group: 'Navegar', action: () => navigate('/crm/rh') },
    { id: 'nav-comercial', label: 'Comercial Dashboard', icon: FileText, group: 'Navegar', action: () => navigate('/crm/comercial') },
    { id: 'nav-financeiro', label: 'Financeiro Dashboard', icon: DollarSign, group: 'Navegar', action: () => navigate('/crm/financeiro') },
    { id: 'nav-marketing', label: 'Marketing Dashboard', icon: Megaphone, group: 'Navegar', action: () => navigate('/crm/marketing') },
    { id: 'nav-tech', label: 'Tech Dashboard', icon: TicketCheck, group: 'Navegar', action: () => navigate('/crm/tech') },
    { id: 'nav-logistica', label: 'Logística Dashboard', icon: Truck, group: 'Navegar', action: () => navigate('/crm/logistica') },
    { id: 'nav-juridico', label: 'Jurídico Dashboard', icon: Scale, group: 'Navegar', action: () => navigate('/crm/juridico') },
    { id: 'nav-ecommerce', label: 'E-commerce Dashboard', icon: Package, group: 'Navegar', action: () => navigate('/crm/ecommerce') },
    
    // Sistema
    { id: 'settings', label: 'Configurações', icon: Settings, group: 'Sistema', action: () => navigate('/crm/admin/configuracoes') },
    { id: 'store', label: 'Ir para Loja', icon: Package, group: 'Sistema', action: () => navigate('/') },
  ];

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.group]) {
      acc[action.group] = [];
    }
    acc[action.group].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <CommandDialog open={isOpen} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Buscar ações, páginas..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        {Object.entries(groupedActions).map(([group, groupActions], index) => (
          <div key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {groupActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => {
                    action.action();
                    handleOpenChange(false);
                  }}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                  {action.shortcut && (
                    <CommandShortcut>{action.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
