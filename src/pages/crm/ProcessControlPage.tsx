import { KanbanBoard } from '@/components/workflow/KanbanBoard';
import { ReportsDashboard } from '@/components/workflow/ReportsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, LayoutGrid } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface ProcessControlPageProps {
    sector?: string;
    sectorLabel?: string;
}

export default function ProcessControlPage({ sector: propSector, sectorLabel: propSectorLabel }: ProcessControlPageProps) {
    const location = useLocation();

    // Determine sector from URL if not provided by prop
    const pathParts = location.pathname.split('/');
    const urlSector = pathParts[2]; // Index 2 should be the sector (crm is index 1)

    const sector = propSector || urlSector || 'marketing';

    const sectorLabels: Record<string, string> = {
        'marketing': 'Marketing',
        'comercial': 'Comercial',
        'tech': 'TI',
        'cientifica': 'Científica',
        'admin': 'Administração',
        'compras': 'Compras',
        'ecommerce': 'E-commerce',
        'financeiro': 'Financeiro',
        'juridico': 'Jurídico',
        'logistica': 'Logística',
        'manutencao': 'Manutenção',
        'rh': 'Recursos Humanos',
        'com_inside': 'Inside Sales',
        'com_franchises': 'Franquias',
        'com_sudeste': 'Sudeste',
        'com_sul': 'Sul',
        'com_centro': 'Centro-Oeste',
        'com_norte': 'Norte/Nordeste'
    };

    const sectorLabel = propSectorLabel || sectorLabels[sector] || sector.toUpperCase();

    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Controle de Processos - {sectorLabel}</h1>
                <p className="text-muted-foreground mt-2">
                    Visão geral de demandas, gargalos e métricas de desempenho para {sectorLabel}.
                </p>
            </div>

            <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="kanban" className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4" /> Kanban
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Relatórios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban" className="space-y-4">
                    <KanbanBoard sector={sector} />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportsDashboard sector={sector} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
