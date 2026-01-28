import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Network,
    Users,
    CreditCard,
    Monitor,
    ShoppingBag,
    Truck,
    Scale,
    Megaphone,
    ChevronRight,
    ChevronDown,
    Building2,
    ShoppingCart,
    Wrench
} from "lucide-react";

// Mock data for the tree
const orgStructure = {
    name: "Diretoria",
    role: "Gestor: Pedro Miguel",
    icon: Building2,
    children: [
        {
            name: "Recursos Humanos",
            role: "Gestora: Gleice Silva",
            icon: Users,
            children: [
                { name: "Talent Acquisition", role: "Recrutamento" },
                { name: "Departamento Pessoal", role: "Administrativo" },
                { name: "T&D", role: "Treinamento" }
            ]
        },
        {
            name: "Compras",
            role: "Gestor: Gilcimar Gil",
            icon: ShoppingCart,
            children: [
                { name: "Gestão de Fornecedores", role: "Compras" },
                { name: "Controle de Estoque", role: "Almoxarifado" },
                { name: "Aquisições", role: "Operacional" }
            ]
        },
        {
            name: "Financeiro",
            role: "Gestor: Lucas Voltarelli",
            icon: CreditCard,
            children: [
                { name: "Contas a Pagar", role: "Operacional" },
                { name: "Contas a Receber", role: "Operacional" },
                { name: "Controladoria", role: "Estratégico" }
            ]
        },
        {
            name: "Tech TI",
            role: "Gestor: Marcelo Ravagnani",
            icon: Monitor,
            children: [
                { name: "Infraestrutura", role: "Suporte N1/N2" },
                { name: "Dev & Sistemas", role: "Desenvolvimento" }
            ]
        },
        {
            name: "Comercial",
            role: "Vendas & CRM",
            icon: ShoppingBag,
            children: [
                { name: "Inside Sales", role: "Gestor: Cesar Camargo" },
                { name: "Account Executives (AE)", role: "Fechamento" },
                { name: "Pós-Venda / CS", role: "Retenção" }
            ]
        },
        {
            name: "Logística",
            role: "Gestora: Luciana Borri",
            icon: Truck,
            children: [
                { name: "Estoque / Warehouse", role: "Armazenagem" },
                { name: "Transporte / Frota", role: "Entrega" }
            ]
        },
        {
            name: "Manutenção",
            role: "Gestor: Laércio",
            icon: Wrench,
            children: [
                { name: "Predial", role: "Infraestrutura" },
                { name: "Equipamentos", role: "Preventiva/Corretiva" }
            ]
        },
        {
            name: "Marketing",
            role: "Gestora: Viviane Toledo",
            icon: Megaphone,
            children: [
                { name: "Performance", role: "Ads/Traffic" },
                { name: "Conteúdo & Social", role: "Branding" }
            ]
        }
    ]
};

// Recursive Tree Node Component
const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const Icon = node.icon || Network;
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="select-none text-left">
            <div
                className={`flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 ${level === 0 ? 'bg-primary/5 mb-2' : ''}`}
                style={{ marginLeft: `${level * 1.5}rem` }}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                role="button"
                tabIndex={0}
            >
                <div className="mr-2">
                    {hasChildren ? (
                        isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    ) : <span className="w-4 h-4 block" />}
                </div>

                <div className={`flex items-center gap-3 ${level === 0 ? 'py-1' : ''}`}>
                    <div className={`flex items-center justify-center rounded-full ${level === 0 ? 'bg-primary text-primary-foreground h-10 w-10' : 'bg-slate-100 h-8 w-8 text-slate-600'}`}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <p className={`font-medium ${level === 0 ? 'text-base' : 'text-sm'}`}>{node.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{node.role}</p>
                    </div>
                </div>
            </div>

            {hasChildren && isOpen && (
                <div className="relative animate-in slide-in-from-top-2 duration-300">
                    {/* Vertical Line for tree structure visual */}
                    <div
                        className="absolute border-l-2 border-slate-100 h-full w-px"
                        style={{ left: `${(level * 1.5) + 1.25}rem`, top: '0', bottom: '0' }}
                    />

                    <div className="">
                        {node.children.map((child: any, idx: number) => (
                            <TreeNode key={idx} node={child} level={level + 1} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export function CRMOrgChart() {
    return (
        <Card className="lg:col-span-3">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl">Estrutura Organizacional</CardTitle>
                        <CardDescription>Hierarquia de departamentos e setores da empresa.</CardDescription>
                    </div>
                    <Network className="h-8 w-8 text-slate-200" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-w-4xl mx-auto border rounded-xl p-6 bg-white shadow-sm">
                    <TreeNode node={orgStructure} />
                </div>
            </CardContent>
        </Card>
    );
}
