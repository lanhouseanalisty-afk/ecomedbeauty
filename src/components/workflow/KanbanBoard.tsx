import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    priority: string;
    sector: string;
    assigned_to?: string;
    created_at: string;
}

const COLUMN_CONFIG = [
    { id: 'pending', title: 'A Fazer', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'in_progress', title: 'Em Execução', color: 'bg-blue-100 text-blue-800' },
    { id: 'completed', title: 'Concluído', color: 'bg-green-100 text-green-800' },
    { id: 'rejected', title: 'Cancelado', color: 'bg-red-100 text-red-800' }
];

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const navigate = useNavigate();
    const { roles } = useAuth();

    // Get user's primary sector (first non-admin role)
    const userSector = roles.find(role =>
        role !== 'admin' &&
        role !== 'manager' &&
        role !== 'editor' &&
        role !== 'viewer'
    );

    useEffect(() => {
        const fetchTasks = async () => {
            if (!userSector) return;

            const { data, error } = await supabase
                .from('team_tasks')
                .select('*')
                .eq('sector', userSector)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
            } else {
                setTasks(data || []);
            }
        };
        fetchTasks();
    }, [userSector]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const getColumnTasks = (status: string) => {
        return tasks.filter(t => t.status === status);
    };

    return (
        <div className={cn(
            "space-y-4 transition-all duration-300",
            isFullScreen ? "fixed inset-0 z-[100] bg-slate-50 p-6 overflow-y-auto" : ""
        )}>
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold">Quadro de Tarefas - {userSector?.toUpperCase()}</h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                    >
                        {isFullScreen ? (
                            <><Minimize2 className="h-4 w-4 mr-2" /> Minimizar</>
                        ) : (
                            <><Maximize2 className="h-4 w-4 mr-2" /> Tela Cheia</>
                        )}
                    </Button>
                    <button
                        onClick={() => navigate('/crm/tarefas/nova')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded shadow-md transform hover:scale-105 transition-all text-sm flex items-center gap-2"
                    >
                        + Nova Nota
                    </button>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 md:grid-cols-4 gap-4 transition-all duration-300",
                isFullScreen ? "h-[calc(100vh-140px)]" : "h-[600px]"
            )}>
                {COLUMN_CONFIG.map(col => (
                    <div key={col.id} className="flex flex-col h-full bg-slate-50/50 rounded-xl border p-2">
                        <div className={`p-3 rounded-lg font-semibold mb-3 ${col.color} text-center shadow-sm`}>
                            {col.title} <Badge variant="secondary" className="ml-2 bg-white/50">{getColumnTasks(col.id).length}</Badge>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="space-y-3 px-1 pb-2">
                                {getColumnTasks(col.id).map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => navigate(`/crm/tarefas/${task.id}`)}
                                        className="cursor-pointer bg-[#fff7d1] hover:bg-[#fff9c4] text-gray-800 p-4 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 hover:rotate-1 relative group min-h-[120px] flex flex-col justify-between"
                                        style={{
                                            boxShadow: '2px 2px 5px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        {/* Pin Effect (Visual) */}
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500 opacity-80" />

                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                                                {userSector}
                                            </span>
                                            {task.priority === 'urgent' && (
                                                <span className="text-[10px] font-bold text-red-600 border border-red-200 px-1 rounded bg-red-50">
                                                    URGENTE
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-sm font-medium leading-tight mb-2 font-handwriting">
                                            {task.title}
                                        </h4>

                                        <div className="text-[10px] text-gray-400 text-right mt-auto">
                                            #{task.id.slice(0, 4)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                ))}
            </div>
        </div>
    );
}
