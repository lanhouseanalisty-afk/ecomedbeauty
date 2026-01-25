import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
}

interface OrganizationChartProps {
    manager: TeamMember;
    members: TeamMember[];
    className?: string;
}

export function OrganizationChart({ manager, members, className }: OrganizationChartProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            'manager': 'bg-purple-500',
            'vendedor': 'bg-blue-500',
            'coordenador': 'bg-emerald-500',
            'assistente': 'bg-amber-500',
        };
        return colors[role.toLowerCase()] || 'bg-gray-500';
    };

    return (
        <div className={cn("space-y-8", className)}>
            {/* Gestor no Topo */}
            <div className="flex justify-center">
                <Card className="w-full max-w-md border-2 border-purple-500/50 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-purple-500/20">
                                <AvatarFallback className={cn("text-lg font-bold text-white", getRoleColor('manager'))}>
                                    {getInitials(manager.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{manager.name}</CardTitle>
                                <Badge variant="secondary" className="mt-1 bg-purple-500/10 text-purple-700 border-purple-500/20">
                                    {manager.role}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <a href={`mailto:${manager.email}`} className="hover:text-primary hover:underline">
                                {manager.email}
                            </a>
                        </div>
                        {manager.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                <a href={`tel:${manager.phone}`} className="hover:text-primary hover:underline">
                                    {manager.phone}
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Linha Conectora */}
            {members.length > 0 && (
                <div className="flex justify-center">
                    <div className="h-12 w-0.5 bg-gradient-to-b from-purple-500/50 to-blue-500/50" />
                </div>
            )}

            {/* Equipe */}
            {members.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {members.map((member, index) => (
                        <div key={member.id} className="relative">
                            {/* Linha conectora para cada membro */}
                            <div className="absolute -top-12 left-1/2 h-12 w-0.5 bg-gradient-to-b from-blue-500/30 to-transparent transform -translate-x-1/2" />

                            <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className={cn("text-sm font-semibold text-white", getRoleColor(member.role))}>
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">{member.name}</CardTitle>
                                            <Badge variant="outline" className="mt-1 text-xs">
                                                {member.role}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-1.5 pt-0">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Mail className="h-3 w-3 flex-shrink-0" />
                                        <a
                                            href={`mailto:${member.email}`}
                                            className="hover:text-primary hover:underline truncate"
                                            title={member.email}
                                        >
                                            {member.email}
                                        </a>
                                    </div>
                                    {member.phone && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Phone className="h-3 w-3 flex-shrink-0" />
                                            <a href={`tel:${member.phone}`} className="hover:text-primary hover:underline">
                                                {member.phone}
                                            </a>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Nenhum colaborador cadastrado</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Os colaboradores cadastrados neste sub-setor aparecerão aqui em uma estrutura hierárquica.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
