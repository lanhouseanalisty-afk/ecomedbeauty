import { Badge } from "@/components/ui/badge";

interface RequestStatusBadgeProps {
    status: string;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        pending: {
            label: "Pendente",
            className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        },
        approved: {
            label: "Aprovado",
            className: "bg-green-500/10 text-green-600 border-green-500/20",
        },
        rejected: {
            label: "Rejeitado",
            className: "bg-red-500/10 text-red-600 border-red-500/20",
        },
        in_progress: {
            label: "Em Andamento",
            className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        },
        completed: {
            label: "Concluído",
            className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        },
    };

    const config = statusConfig[status] || {
        label: status,
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };

    return (
        <Badge variant="outline" className={config.className}>
            {config.label}
        </Badge>
    );
}
