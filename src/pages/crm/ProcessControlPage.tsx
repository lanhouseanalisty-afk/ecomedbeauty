
import { KanbanBoard } from '@/components/workflow/KanbanBoard';
import { ReportsDashboard } from '@/components/workflow/ReportsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Trello } from 'lucide-react';

export default function ProcessControlPage() {
    return (
        <div className="container mx-auto p-6 max-w-7xl animate-in fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Controle de Processos</h1>
                <p className="text-muted-foreground mt-2">
                    Visão geral de demandas, gargalos e métricas de desempenho.
                </p>
            </div>

            <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="kanban" className="flex items-center gap-2">
                        <Trello className="w-4 h-4" /> Kanban
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" /> Relatórios
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban" className="space-y-4">
                    <KanbanBoard />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <ReportsDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
