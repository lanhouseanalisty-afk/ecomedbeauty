import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  MoreHorizontal,
  Calendar,
  User,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface DetailField {
  label: string;
  value: React.ReactNode;
  type?: 'text' | 'date' | 'badge' | 'currency' | 'link';
}

interface DetailTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  fields: DetailField[];
  tabs?: DetailTab[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  actions?: { id: string; label: string; onClick: () => void }[];
  children?: React.ReactNode;
}

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  subtitle,
  badge,
  fields,
  tabs,
  createdAt,
  updatedAt,
  createdBy,
  onEdit,
  onDelete,
  actions,
  children,
}: DetailDrawerProps) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(title);
    toast.success('ID copiado para a área de transferência');
  };

  const renderFieldValue = (field: DetailField) => {
    if (!field.value && field.value !== 0) {
      return <span className="text-muted-foreground">-</span>;
    }

    switch (field.type) {
      case 'date':
        return format(new Date(field.value as string), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      case 'currency':
        return `R$ ${Number(field.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'badge':
        return <Badge variant="outline">{field.value}</Badge>;
      case 'link':
        return (
          <a 
            href={field.value as string} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
          >
            {field.value}
            <ExternalLink className="h-3 w-3" />
          </a>
        );
      default:
        return field.value;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-4 pr-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-xl">{title}</SheetTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {subtitle && (
                <SheetDescription>{subtitle}</SheetDescription>
              )}
            </div>
            {badge && (
              <Badge variant={badge.variant} className={badge.className}>
                {badge.label}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            {(onDelete || actions?.length) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions?.map((action) => (
                    <DropdownMenuItem key={action.id} onClick={action.onClick}>
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  {actions?.length && onDelete && <DropdownMenuSeparator />}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
          {tabs ? (
            <Tabs defaultValue={tabs[0]?.id}>
              <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-4">
                  {tab.content}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="grid grid-cols-3 gap-4">
                  <span className="text-sm text-muted-foreground">{field.label}</span>
                  <span className="col-span-2 text-sm font-medium">
                    {renderFieldValue(field)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {children}

          {(createdAt || updatedAt || createdBy) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-2 text-xs text-muted-foreground">
                {createdBy && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Criado por {createdBy}</span>
                  </div>
                )}
                {createdAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Criado em {format(new Date(createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
                {updatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      Atualizado em {format(new Date(updatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
