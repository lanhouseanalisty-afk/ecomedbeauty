import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Wrench, AlertTriangle, CheckCircle, Clock, Users, TrendingUp, FileText, UserPlus, Search, Coffee
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LimpezaRequestDialog } from "@/components/crm/limpeza/LimpezaRequestDialog";

export default function ManutencaoDashboard() {
    const navigate = useNavigate();
    const stats = [
        {
            title: "Chamados Abertos",
            value: "-",
            icon: AlertTriangle,
            description: "Aguardando atendimento",
            color: "text-amber-600"
        },
        {
            title: "Em Andamento",
            value: "-",
            icon: Clock,
            description: "Sendo resolvidos",
            color: "text-blue-600"
        },
        {
            title: "Concluídos Hoje",
            value: "-",
            icon: CheckCircle,
            description: "Finalizados",
            color: "text-emerald-600"
        },
        {
            title: "Tempo Médio",
            value: "- min",
            icon: TrendingUp,
            description: "De resolução",
            color: "text-purple-600"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">🔧</div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Manutenção</h1>
                        <p className="text-muted-foreground">Infraestrutura e Facilities</p>
                    </div>
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-fit">
                        Gestor: Laércio
                    </Badge>
                    <Button onClick={() => window.location.href = "/crm/manutencao/operacoes"} variant="outline" className="gap-2 border-orange-200 hover:border-orange-300 bg-orange-50/30 text-orange-700">
                        <UserPlus className="h-4 w-4" />
                        Admissão & Demissão
                    </Button>
                    <LimpezaRequestDialog />
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="contracts">Contratos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="contracts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Contratos</CardTitle>
                            <CardDescription>Gerencie as solicitações e contratos do departamento de Manutenção</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Button
                                    onClick={() => navigate(`/crm/intranet/contratos/novo?sector=manutencao`)}
                                    className="h-24 flex flex-col gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
                                    variant="outline"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Solicitar Novo Contrato</span>
                                </Button>
                                <Button
                                    onClick={() => window.location.href = "/crm/manutencao/contratos"}
                                    className="h-24 flex flex-col gap-2"
                                    variant="outline"
                                >
                                    <Search className="h-4 w-4" />
                                    <span>Ver Todos os Contratos do Setor</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


            {/* Informações do Gestor */}
            <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Gestor do Departamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div>
                            <p className="text-lg font-semibold">Laércio</p>
                            <p className="text-sm text-muted-foreground">Gerente de Manutenção</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>📧</span>
                            <a
                                href="mailto:laercio@medbeauty.com.br"
                                className="hover:text-primary hover:underline"
                            >
                                laercio@medbeauty.com.br
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Funcionalidades */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-amber-600" />
                            Chamados
                        </CardTitle>
                        <CardDescription>
                            Abrir e acompanhar solicitações
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            Manutenção Preventiva
                        </CardTitle>
                        <CardDescription>
                            Agenda de manutenções programadas
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Emergências
                        </CardTitle>
                        <CardDescription>
                            Atendimento prioritário
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                            Histórico
                        </CardTitle>
                        <CardDescription>
                            Registro de manutenções realizadas
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-purple-600" />
                            Equipe
                        </CardTitle>
                        <CardDescription>
                            Técnicos e responsáveis
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Relatórios
                        </CardTitle>
                        <CardDescription>
                            Indicadores e análises
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            {/* Áreas de Atuação */}
            <Card>
                <CardHeader>
                    <CardTitle>Áreas de Atuação</CardTitle>
                    <CardDescription>Principais responsabilidades do departamento</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Elétrica</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Hidráulica</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Ar Condicionado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Pintura</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Marcenaria</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm">Limpeza e Conservação</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Informação */}
            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                        Departamento de Manutenção
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                        Responsável pela manutenção preventiva e corretiva de toda a infraestrutura física
                        da empresa. Garante o bom funcionamento das instalações, equipamentos e facilities,
                        proporcionando um ambiente de trabalho seguro e adequado para todos os colaboradores.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
