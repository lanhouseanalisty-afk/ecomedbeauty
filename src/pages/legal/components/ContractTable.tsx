import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export const getStatusBadge = (status: string) => {
    switch (status) {
        case 'requested': return <Badge variant="outline">Solicitado</Badge>;
        case 'draft': return <Badge variant="secondary">Rascunho</Badge>;
        case 'legal_review': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Em Análise</Badge>;
        case 'signing': return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Em Assinatura</Badge>;
        case 'active': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Vigente</Badge>;
        case 'expired': return <Badge variant="destructive">Vencido</Badge>;
        case 'terminated': return <Badge variant="destructive">Encerrado</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

interface ContractTableProps {
    data: any[];
    isLoading?: boolean;
    isLegalMember?: boolean;
    onDelete?: (id: string) => void;
    sector?: string;
}

export const ContractTable = ({ data, isLoading, isLegalMember, onDelete, sector }: ContractTableProps) => {
    const navigate = useNavigate();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>ID SAP</TableHead>
                    <TableHead>Data Criação</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
                ) : data.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum contrato encontrado.</TableCell></TableRow>
                ) : (
                    data.map((contract) => (
                        <TableRow key={contract.id}>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{contract.title}</span>
                                    <span className="text-xs text-muted-foreground line-clamp-1">{contract.description || contract.terms_summary || ""}</span>
                                </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(contract.status)}</TableCell>
                            <TableCell className="font-mono text-xs">{contract.sap_request_id || contract.payment_terms || "-"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(contract.created_at), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {isLegalMember && ['draft', 'requested', 'legal_review'].includes(contract.status) && onDelete && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Tem certeza que deseja excluir permanentemente este contrato?")) {
                                                    onDelete(contract.id);
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        if (sector) {
                                            navigate(`/crm/${sector}/contrato/${contract.id}`);
                                        } else {
                                            // Generic intelligent route that works for everyone
                                            navigate(`/crm/contrato/${contract.id}`);
                                        }
                                    }}>
                                        Detalhes
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};
