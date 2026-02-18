import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, TrendingUp, DollarSign, Users, FileText } from "lucide-react";

export default function ComprasDashboard() {
    const stats = [
        {
            title: "Fornecedores Ativos",
            value: "-",
            icon: Users,
            description: "Cadastrados no sistema",
            color: "text-blue-600"
        },
        {
            title: "Pedidos Pendentes",
            value: "-",
            icon: ShoppingCart,
            description: "Aguardando aprovação",
            color: "text-amber-600"
        },
        {
            title: "Produtos em Estoque",
            value: "-",
            icon: Package,
            description: "Itens disponíveis",
            color: "text-emerald-600"
        },
        {
            title: "Economia Mensal",
            value: "R$ -",
            icon: TrendingUp,
            description: "Vs. mês anterior",
            color: "text-purple-600"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold">Compras</h1>
                    <p className="text-muted-foreground">Gestão de Aquisições, Fornecedores e Frotas</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="w-fit">
                        Gestor: Gilcimar Gil
                    </Badge>
                    <Button onClick={() => window.location.href = "/crm/intranet/contratos/novo?sector=compras"} variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Solicitar Contrato
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
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

                {/* Informações do Gestor */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Gestor do Departamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>
                                <p className="text-lg font-semibold">Gilcimar Gil</p>
                                <p className="text-sm text-muted-foreground">Gerente de Compras</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>📧</span>
                                <a
                                    href="mailto:gilcimar.gil@medbeauty.com.br"
                                    className="hover:text-primary hover:underline"
                                >
                                    gilcimar.gil@medbeauty.com.br
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
                                <ShoppingCart className="h-5 w-5 text-blue-600" />
                                Pedidos de Compra
                            </CardTitle>
                            <CardDescription>
                                Gerenciar solicitações e pedidos
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-emerald-600" />
                                Fornecedores
                            </CardTitle>
                            <CardDescription>
                                Cadastro e gestão de fornecedores
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-amber-600" />
                                Catálogo de Produtos
                            </CardTitle>
                            <CardDescription>
                                Produtos e materiais disponíveis
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-purple-600" />
                                Cotações
                            </CardTitle>
                            <CardDescription>
                                Comparar preços e condições
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
                                Análises e indicadores de compras
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-rose-600" />
                                Contratos
                            </CardTitle>
                            <CardDescription>
                                Gestão de contratos com fornecedores
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Informação */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-blue-900 dark:text-blue-100">
                            Departamento de Compras
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            Responsável por todas as aquisições de produtos, materiais e serviços da empresa.
                            Gerencia relacionamento com fornecedores, negocia contratos e busca as melhores
                            condições comerciais para a organização.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}
