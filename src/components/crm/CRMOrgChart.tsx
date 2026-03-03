import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Network,
    Users,
    CreditCard,
    Monitor,
    ShoppingBag,
    Truck,
    Megaphone,
    ChevronRight,
    ChevronDown,
    Building2,
    ShoppingCart,
    Wrench,
    UserCircle,
    Briefcase,
    Scale,
    Beaker
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for the tree
const orgStructure = {
    id: "root",
    name: "Diretoria",
    role: "Gestor: Pedro Miguel",
    icon: Building2,
    color: "bg-purple-100 text-purple-700",
    startOpen: true,
    children: [
        {
            id: "rh",
            name: "Recursos Humanos",
            role: "Gestora: Gleice Silva",
            icon: Users,
            color: "bg-pink-100 text-pink-700",
            children: [
                { name: "Talent Acquisition", role: "Recrutamento" },
                { name: "Departamento Pessoal", role: "Administrativo" },
                { name: "T&D", role: "Treinamento" },
                { name: "Clima & Cultura", role: "Engajamento" }
            ]
        },
        {
            id: "comercial",
            name: "Comercial",
            role: "Vendas & CRM",
            icon: ShoppingBag,
            color: "bg-green-100 text-green-700",
            children: [
                { name: "Inside Sales", role: "Gestor: Cesar Camargo", highlight: true },
                { name: "Key Accounts", role: "Grandes Contas" },
                { name: "Pós-Venda / CS", role: "Retenção" },
                { name: "Franquias", role: "Expansão" }
            ]
        },
        {
            id: "financeiro",
            name: "Financeiro",
            role: "Gestor: Lucas Voltarelli",
            icon: CreditCard,
            color: "bg-blue-100 text-blue-700",
            children: [
                { name: "Contas a Pagar", role: "Operacional" },
                { name: "Contas a Receber", role: "Operacional" },
                { name: "Controladoria", role: "Estratégico" },
                { name: "Fiscal", role: "Tributário" }
            ]
        },
        {
            id: "marketing",
            name: "Marketing",
            role: "Gestora: Viviane Toledo",
            icon: Megaphone,
            color: "bg-orange-100 text-orange-700",
            children: [
                { name: "Performance", role: "Ads/Traffic" },
                { name: "Conteúdo & Social", role: "Branding" },
                { name: "Design", role: "Criação" },
                { name: "Trade Marketing", role: "PDV" }
            ]
        },
        {
            id: "tech",
            name: "Tech TI",
            role: "Gestor: Marcelo Ravagnani",
            icon: Monitor,
            color: "bg-indigo-100 text-indigo-700",
            children: [
                { name: "Infraestrutura", role: "Suporte N1/N2" },
                { name: "Dev & Sistemas", role: "Desenvolvimento" },
                { name: "Segurança", role: "Dados" }
            ]
        },
        {
            id: "logistica",
            name: "Logística",
            role: "Gestora: Luciana Borri",
            icon: Truck,
            color: "bg-slate-100 text-slate-700",
            children: [
                { name: "Estoque / Warehouse", role: "Armazenagem" },
                { name: "Transporte / Frota", role: "Entrega" },
                { name: "Expedição", role: "Saída" }
            ]
        },
        {
            id: "compras",
            name: "Compras",
            role: "Gestor: Gilcimar Gil",
            icon: ShoppingCart,
            color: "bg-teal-100 text-teal-700",
            children: [
                { name: "Gestão de Fornecedores", role: "Sourcing" },
                { name: "Controle de Estoque", role: "Almoxarifado" },
                { name: "Importação", role: "Comex" }
            ]
        },
        {
            id: "manutencao",
            name: "Manutenção",
            role: "Gestor: Laércio",
            icon: Wrench,
            color: "bg-red-100 text-red-700",
            children: [
                { name: "Predial", role: "Infraestrutura" },
                { name: "Equipamentos", role: "Preventiva/Corretiva" }
            ]
        },
        {
            id: "juridico",
            name: "Jurídico",
            role: "Gestor: Denis Ranieri",
            icon: Scale,
            color: "bg-amber-100 text-amber-700",
            children: [
                { name: "Contratos", role: "Gestão Legal" },
                { name: "Compliance", role: "Conformidade" }
            ]
        },
        {
            id: "cientifica",
            name: "Científica",
            role: "Gestora: Luciana Maluf",
            icon: Beaker,
            color: "bg-orange-100 text-orange-700",
            children: [
                { name: "Pesquisa & Desenvolvimento", role: "P&D" },
                { name: "Inovação", role: "Novas Tecnologias" }
            ]
        }
    ]
};

// Modern Tree Node Component
const TreeNode = ({ node, isRoot = false, isLast = false }: { node: any, isRoot?: boolean, isLast?: boolean }) => {
    const [isOpen, setIsOpen] = useState(node.startOpen || false);
    const Icon = node.icon || Network;
    const hasChildren = node.children && node.children.length > 0;

    // Split role into Title and Name if structured as "Title: Name"
    const [roleTitle, roleName] = node.role ? node.role.split(':') : [node.role, ''];

    return (
        <div className="relative">
            {/* Connector Line for Children (L-Shape) */}
            {!isRoot && (
                <div
                    className={cn(
                        "absolute -left-6 top-0 w-6 h-8 border-l-2 border-b-2 border-slate-200 rounded-bl-lg",
                        isLast ? "h-8" : "h-full" // Stop the vertical line if it's the last child
                    )}
                />
            )}

            {/* Node Card */}
            <div
                className={cn(
                    "relative flex items-center p-3 mb-3 rounded-xl border transition-all duration-200 group",
                    isRoot ? "bg-white border-primary/20 shadow-md p-4" : "bg-white border-slate-100 hover:border-primary/30 hover:shadow-sm"
                )}
            >
                {/* Arrow Toggle */}
                {hasChildren && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border shadow-sm flex items-center justify-center z-10 text-slate-400 hover:text-primary transition-colors"
                    >
                        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </button>
                )}

                {/* Icon Box */}
                <div className={cn(
                    "flex-shrink-0 flex items-center justify-center rounded-lg mr-4",
                    isRoot ? "h-14 w-14 bg-primary/10 text-primary" : "h-10 w-10",
                    !isRoot && node.color ? node.color : "bg-slate-100 text-slate-500"
                )}>
                    <Icon className={cn(isRoot ? "h-7 w-7" : "h-5 w-5")} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className={cn("font-bold truncate", isRoot ? "text-lg text-primary" : "text-sm text-slate-800")}>
                            {node.name}
                        </h4>
                        {node.highlight && <Badge variant="secondary" className="text-[10px] h-5">Destaque</Badge>}
                    </div>

                    {node.role && (
                        <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            {roleName ? (
                                <>
                                    <span className="font-medium mr-1">{roleTitle}:</span>
                                    <span className="text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{roleName}</span>
                                </>
                            ) : (
                                <span>{roleTitle}</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Optional Status or Indicator */}
                {!isRoot && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="text-[10px] h-5 border-slate-200">Ver Equipe</Badge>
                    </div>
                )}
            </div>

            {/* Children Container */}
            {hasChildren && isOpen && (
                <div className="ml-8 pl-4 border-l-2 border-slate-200/50 space-y-1 pb-2">
                    {node.children.map((child: any, idx: number) => (
                        <TreeNode
                            key={idx}
                            node={child}
                            isLast={idx === node.children.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export function CRMOrgChart() {
    const [expandAll, setExpandAll] = useState(false);

    return (
        <Card className="lg:col-span-3 border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Estrutura Organizacional
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            Mapa hierárquico dos departamentos, gestores e setores da Ecomedbeauty.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-white p-2 rounded-lg border shadow-sm flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Atualizado hoje
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className="relative">
                    {/* Main Tree */}
                    <div className="max-w-4xl">
                        <TreeNode node={orgStructure} isRoot={true} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
