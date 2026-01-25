import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    User,
    Building,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Globe,
    MessageSquare,
    Clock,
    Briefcase
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeadDetailsDialogProps {
    lead: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeadDetailsDialog({ lead, open, onOpenChange }: LeadDetailsDialogProps) {
    if (!lead) return null;

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800';
            case 'contacted': return 'bg-purple-100 text-purple-800';
            case 'qualified': return 'bg-amber-100 text-amber-800';
            case 'converted': return 'bg-green-100 text-green-800';
            case 'lost': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'new': return 'Novo Lead';
            case 'contacted': return 'Contatado';
            case 'qualified': return 'Qualificado';
            case 'converted': return 'Convertido';
            case 'lost': return 'Perdido';
            default: return status;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-muted/50 to-background border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {getInitials(lead.first_name, lead.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl font-bold font-serif mb-1">
                                    {lead.first_name} {lead.last_name}
                                </DialogTitle>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={getStatusColor(lead.status)}>
                                        {getStatusLabel(lead.status)}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground capitalize">{lead.source || 'Manual'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Editar</Button>
                            <Button size="sm">Contatar</Button>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 text-primary mb-3">
                                    <User className="h-4 w-4" />
                                    Informações Pessoais
                                </h3>
                                <div className="space-y-3 pl-6">
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Nome:</span>
                                        <span className="font-medium">{lead.first_name} {lead.last_name}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="flex items-center gap-2">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            {lead.email || "-"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Telefone:</span>
                                        <span className="flex items-center gap-2">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            {lead.phone || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold flex items-center gap-2 text-primary mb-3">
                                    <Building className="h-4 w-4" />
                                    Empresa & Trabalho
                                </h3>
                                <div className="space-y-3 pl-6">
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Empresa:</span>
                                        <span className="font-medium">{lead.company || "-"}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Cargo:</span>
                                        <span>{lead.job_title || "-"}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-muted-foreground">Site:</span>
                                        {lead.website ? (
                                            <a href={lead.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Globe className="h-3 w-3" />
                                                {lead.website}
                                            </a>
                                        ) : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 text-primary mb-3">
                                    <MessageSquare className="h-4 w-4" />
                                    Observações
                                </h3>
                                <div className="bg-muted/30 p-4 rounded-md text-sm min-h-[100px] whitespace-pre-wrap border">
                                    {lead.notes || "Nenhuma observação registrada."}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold flex items-center gap-2 text-primary mb-3">
                                    <Clock className="h-4 w-4" />
                                    Histórico
                                </h3>
                                <div className="space-y-4 pl-2 border-l-2 border-muted ml-2">
                                    <div className="relative pl-4 pb-2">
                                        <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary" />
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {new Date(lead.created_at).toLocaleDateString()} às {new Date(lead.created_at).toLocaleTimeString().slice(0, 5)}
                                        </p>
                                        <p className="text-sm font-medium">Lead Criado</p>
                                        <p className="text-xs text-muted-foreground">Origem: {lead.source || 'Manual'}</p>
                                    </div>

                                    {lead.status !== 'new' && (
                                        <div className="relative pl-4 pb-2">
                                            <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-muted-foreground" />
                                            <p className="text-xs text-muted-foreground mb-1">Status Atual</p>
                                            <p className="text-sm">Mudou para <span className="font-medium">{getStatusLabel(lead.status)}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
