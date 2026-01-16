import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestDetailsDialog } from "./RequestDetailsDialog";
import { MarketingRequest } from "@/hooks/useMarketingRequest";
import { Eye, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RequestsTableProps {
    requests: MarketingRequest[];
    onStatusChange?: (id: string, status: string) => void;
    onRefresh?: () => void;
    isManager?: boolean;
}

export function RequestsTable({
    requests,
    onStatusChange,
    onRefresh,
    isManager = false,
}: RequestsTableProps) {
    const [selectedRequest, setSelectedRequest] = useState<MarketingRequest | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [managerFilter, setManagerFilter] = useState<string>("all");

    const filteredRequests = requests.filter((request) => {
        const matchesSearch =
            request.request_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.consultant_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || request.status === statusFilter;
        const matchesManager =
            managerFilter === "all" || request.regional_manager === managerFilter;

        return matchesSearch && matchesStatus && matchesManager;
    });

    const handleViewDetails = (request: MarketingRequest) => {
        setSelectedRequest(request);
        setDialogOpen(true);
    };

    const handleStatusChange = (id: string, status: string) => {
        if (onStatusChange) {
            onStatusChange(id, status);
            setDialogOpen(false);
            if (onRefresh) {
                setTimeout(onRefresh, 500);
            }
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por ID, evento ou consultor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Gerente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Gerentes</SelectItem>
                        <SelectItem value="Jaqueline">Jaqueline</SelectItem>
                        <SelectItem value="Laice">Laice</SelectItem>
                        <SelectItem value="Milena">Milena</SelectItem>
                        <SelectItem value="Thiago">Thiago</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Evento</TableHead>
                            <TableHead>Consultor</TableHead>
                            <TableHead>GR</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead>KIT</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Nenhuma solicitação encontrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-mono text-sm">
                                        {request.request_id}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {request.event_name}
                                    </TableCell>
                                    <TableCell>{request.consultant_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{request.regional_manager}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(request.event_date), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-xs">
                                            {request.kit_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <RequestStatusBadge status={request.status || "pending"} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetails(request)}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
                Mostrando {filteredRequests.length} de {requests.length} solicitações
            </div>

            {/* Details Dialog */}
            <RequestDetailsDialog
                request={selectedRequest}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onStatusChange={handleStatusChange}
                isManager={isManager}
            />
        </div>
    );
}
