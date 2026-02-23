import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { MarketingRequest } from "@/hooks/useMarketingRequest";
import { Calendar, MapPin, Package, User, FileText, Truck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RequestDetailsDialogProps {
    request: MarketingRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStatusChange?: (id: string, status: string) => void;
    isManager?: boolean;
}

export function RequestDetailsDialog({
    request,
    open,
    onOpenChange,
    onStatusChange,
    isManager = false,
}: RequestDetailsDialogProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    if (!request) return null;

    const handleStatusChange = (status: string) => {
        if (request.id && onStatusChange) {
            onStatusChange(request.id, status);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Detalhes da Solicitação</DialogTitle>
                        <RequestStatusBadge status={request.status || "pending"} />
                    </div>
                    <DialogDescription>ID: {request.request_id}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Dados do Evento */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Dados do Evento
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Nome do Evento</p>
                                <p className="font-medium">{request.event_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Tipo de KIT</p>
                                <Badge variant="secondary">{request.kit_type}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Data do Evento</p>
                                <p className="font-medium flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(request.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Solicitante */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Solicitante
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Consultor/GR</p>
                                <p className="font-medium">{request.consultant_name}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Gerente Regional</p>
                                <Badge>{request.regional_manager}</Badge>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Setor Requisitante</p>
                                <Badge variant="outline" className="capitalize">{request.sector || "Marketing"}</Badge>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Regras de Negócio */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3">Regras de Negócio</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Acompanha pedido de fios?</p>
                                <Badge variant={request.has_thread_order ? "default" : "outline"}>
                                    {request.has_thread_order ? "Sim" : "Não"}
                                </Badge>
                            </div>
                            {request.has_thread_order && request.bonus_order_number && (
                                <div>
                                    <p className="text-muted-foreground">Nº Pedido Bonificação</p>
                                    <p className="font-medium">{request.bonus_order_number}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Local de Entrega */}
                    <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Local de Entrega
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p className="font-medium">
                                {request.street}, {request.number}
                            </p>
                            <p className="text-muted-foreground">
                                {request.neighborhood} - {request.city}/{request.state}
                            </p>
                            <p className="text-muted-foreground">CEP: {request.cep}</p>
                        </div>
                    </div>

                    {request.tracking_number && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-700">
                                    <Truck className="h-5 w-5" />
                                    Informações de Envio
                                </h3>
                                <div className="text-sm">
                                    <p className="text-muted-foreground">Código de Rastreio</p>
                                    <p className="font-mono font-bold text-base">{request.tracking_number}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {request.extra_materials && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Materiais Extras
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {request.extra_materials}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {isManager && request.status === "pending" && (
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange("rejected")}
                        >
                            Rejeitar
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => handleStatusChange("approved")}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Aprovar
                        </Button>
                    </DialogFooter>
                )}

                {isManager && request.status === "approved" && (
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => handleStatusChange("in_progress")}
                        >
                            Marcar como Em Andamento
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => handleStatusChange("completed")}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Marcar como Concluído
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
