import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Target, DollarSign, Loader2, UserPlus } from "lucide-react";
import { OrganizationChart } from "@/components/crm/comercial/OrganizationChart";
import { useDepartmentMembers } from "@/hooks/useDepartmentMembers";

const subDepartmentData: Record<string, {
    name: string;
    code: string;
    icon: string;
    manager: {
        name: string;
        email: string;
        phone: string;
    };
    description: string;
    regions?: string[];
}> = {
    "inside-sales": {
        name: "Inside Sales",
        code: "com_inside",
        icon: "💼",
        manager: {
            name: "Cesar Camargo",
            email: "cesar.camargo@medbeauty.com.br",
            phone: "(11) 98765-4321"
        },
        description: "Equipe de vendas internas focada em atendimento remoto e digital"
    },
    "sudeste": {
        name: "Sudeste",
        code: "com_sudeste",
        icon: "🌆",
        manager: {
            name: "Milena Fireman",
            email: "milena.fireman@medbeauty.com.br",
            phone: "(11) 98765-4322"
        },
        description: "Região Sudeste",
        regions: ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Espírito Santo"]
    },
    "sul": {
        name: "Sul",
        code: "com_sul",
        icon: "🌲",
        manager: {
            name: "Jaqueline Grasel",
            email: "jaqueline.grasel@medbeauty.com.br",
            phone: "(11) 98765-4323"
        },
        description: "Região Sul",
        regions: ["Paraná", "Santa Catarina", "Rio Grande do Sul"]
    },
    "centro": {
        name: "Centro",
        code: "com_centro",
        icon: "🌾",
        manager: {
            name: "Laice Santos",
            email: "laice.santos@medbeauty.com.br",
            phone: "(11) 98765-4324"
        },
        description: "Região Centro-Oeste",
        regions: ["Goiás", "Mato Grosso", "Mato Grosso do Sul", "Distrito Federal"]
    },
    "norte": {
        name: "Norte",
        code: "com_norte",
        icon: "🌴",
        manager: {
            name: "Thiago Carvalho",
            email: "thiago.carvalho@medbeauty.com.br",
            phone: "(11) 98765-4325"
        },
        description: "Região Norte",
        regions: ["Amazonas", "Pará", "Acre", "Rondônia", "Roraima", "Amapá", "Tocantins"]
    }
};

export default function ComercialSubDepartmentPage() {
    const { subdepartment } = useParams<{ subdepartment: string }>();
    const data = subdepartment ? subDepartmentData[subdepartment] : null;

    const { data: members, isLoading } = useDepartmentMembers(data?.code || '');

    if (!data) {
        return (
            <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Sub-setor não encontrado</h2>
                    <p className="text-muted-foreground mt-2">O sub-setor solicitado não existe.</p>
                </div>
            </div>
        );
    }

    // Separar gestor e membros da equipe
    const teamMembers = members?.filter(m => m.role !== 'manager').map(m => ({
        id: m.user_id,
        name: m.user.full_name,
        email: m.user.email,
        phone: m.user.phone,
        role: m.role === 'member' ? 'Vendedor' : m.role
    })) || [];

    const manager = {
        id: 'manager',
        name: data.manager.name,
        email: data.manager.email,
        phone: data.manager.phone,
        role: 'Gestor Regional'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">{data.icon}</div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold">{data.name}</h1>
                        <p className="text-muted-foreground">{data.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="font-mono">
                        {data.code}
                    </Badge>
                    <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Colaborador
                    </Button>
                </div>
            </div>

            {/* Regiões (se aplicável) */}
            {data.regions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estados Atendidos</CardTitle>
                        <CardDescription>Área de cobertura desta regional</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {data.regions.map((region) => (
                                <Badge key={region} variant="secondary">
                                    {region}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Estatísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Equipe
                        </CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{teamMembers.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Colaboradores ativos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Leads Ativos
                        </CardTitle>
                        <Target className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-</div>
                        <p className="text-xs text-muted-foreground mt-1">Em prospecção</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Taxa Conversão
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-%</div>
                        <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Pipeline
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ -</div>
                        <p className="text-xs text-muted-foreground mt-1">Valor estimado</p>
                    </CardContent>
                </Card>
            </div>

            {/* Organograma Hierárquico */}
            <Card>
                <CardHeader>
                    <CardTitle>Organograma da Equipe</CardTitle>
                    <CardDescription>
                        Estrutura hierárquica do sub-setor {data.name}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Carregando equipe...</span>
                        </div>
                    ) : (
                        <OrganizationChart
                            manager={manager}
                            members={teamMembers}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
