import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'priority' | 'in_progress' | 'waiting' | 'review' | 'completed' | 'cancelled';
    priority: string;
    sector: string;
    assigned_to?: string;
    created_at: string;
}

const COLUMN_CONFIG = [
    { id: 'pending', title: 'A Fazer', color: 'bg-amber-400', postit: 'bg-[#FEF9C3]', pin: 'bg-red-500' },
    { id: 'priority', title: 'Prioridades', color: 'bg-orange-500', postit: 'bg-[#FFEDD5]', pin: 'bg-blue-500' },
    { id: 'in_progress', title: 'Em Execução', color: 'bg-sky-500', postit: 'bg-[#E0F2FE]', pin: 'bg-yellow-500' },
    { id: 'waiting', title: 'Aguardandando', color: 'bg-purple-500', postit: 'bg-[#F3E8FF]', pin: 'bg-green-500' },
    { id: 'review', title: 'Revisão', color: 'bg-indigo-500', postit: 'bg-[#E0E7FF]', pin: 'bg-pink-500' },
    { id: 'completed', title: 'Concluído', color: 'bg-emerald-500', postit: 'bg-[#DCFCE7]', pin: 'bg-slate-400' },
    { id: 'cancelled', title: 'Cancelado', color: 'bg-rose-500', postit: 'bg-[#FEE2E2]', pin: 'bg-slate-800' }
];

export function KanbanBoard({ sector: propSector }: { sector?: string }) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const navigate = useNavigate();
    const { roles } = useAuth();
    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];

    // Get user's primary sector (first non-admin role)
    const roleSector = roles.find(role =>
        role !== 'admin' &&
        role !== 'manager' &&
        role !== 'editor' &&
        role !== 'viewer'
    );

    const userSector = propSector || roleSector;

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
                // Map legacy 'rejected' to 'cancelled' and 'pending' to 'pending'
                const mappedTasks = (data || []).map((t: any) => ({
                    ...t,
                    status: t.status === 'rejected' ? 'cancelled' : t.status
                }));
                setTasks(mappedTasks);
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
            "space-y-6 transition-all duration-500 ease-in-out",
            isFullScreen ? "fixed inset-0 z-[100] bg-[#f8f9fa] p-8 overflow-y-auto" : ""
        )}>
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-200">
                        <LayoutGrid className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quadro Kanban</h2>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                            Setor: <span className="text-yellow-600 font-bold uppercase">{userSector}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="rounded-xl text-slate-500 hover:bg-slate-100 transition-all font-bold"
                    >
                        {isFullScreen ? (
                            <><Minimize2 className="h-4 w-4 mr-2" /> Minimizar</>
                        ) : (
                            <><Maximize2 className="h-4 w-4 mr-2" /> Tela Cheia</>
                        )}
                    </Button>
                    <Button
                        onClick={() => navigate('/crm/tarefas/nova')}
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black px-6 py-6 rounded-2xl shadow-xl shadow-yellow-200 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-b-4 border-yellow-600"
                    >
                        + NOVA NOTA
                    </Button>
                </div>
            </div>

            <div className={cn(
                "flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2",
                isFullScreen ? "h-[calc(100vh-180px)]" : "h-[650px]"
            )}>
                {COLUMN_CONFIG.map(col => (
                    <div key={col.id} className="flex flex-col min-w-[320px] max-w-[320px] h-full">
                        <div className={cn(
                            "flex items-center justify-between p-4 mb-4 rounded-2xl shadow-lg border-b-4",
                            col.color,
                            "bg-opacity-90 backdrop-blur-sm"
                        )}>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-white text-sm uppercase tracking-wider">{col.title}</h3>
                            </div>
                            <span className="bg-white/30 px-2 py-0.5 rounded-lg text-[10px] font-black text-white ring-1 ring-white/50">
                                {getColumnTasks(col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 bg-slate-100/50 rounded-3xl p-3 border-2 border-dashed border-slate-200 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="space-y-6 pt-2 pb-10 px-1">
                                    {getColumnTasks(col.id).map((task, index) => (
                                        <div
                                            key={task.id}
                                            onClick={() => navigate(`/crm/tarefas/${task.id}`)}
                                            className={cn(
                                                "cursor-pointer p-5 shadow-xl hover:shadow-2xl transition-all duration-300 transform relative group min-h-[160px] flex flex-col justify-between rounded-sm",
                                                col.postit,
                                                rotations[index % rotations.length],
                                                "hover:rotate-0 hover:scale-105 hover:z-10"
                                            )}
                                            style={{
                                                clipPath: 'polygon(0 0, 100% 0, 100% 92%, 92% 100%, 0 100%)',
                                                boxShadow: '4px 4px 15px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            {/* Top Pin with shadow */}
                                            <div className={cn(
                                                "absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full shadow-md z-20 border-2 border-white/50",
                                                col.pin
                                            )} />

                                            {/* Tape/Post-it effect corner shadow */}
                                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-black/5 rounded-tl-3xl pointer-events-none" />

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-2 py-0.5 bg-black/5 rounded-full">
                                                        {task.sector || userSector}
                                                    </span>
                                                    {task.priority === 'urgent' && (
                                                        <span className="flex items-center gap-1 animate-pulse">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                                            <span className="text-[9px] font-black text-red-600">CRÍTICO</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="text-sm font-bold leading-tight text-slate-800 font-handwriting line-clamp-4">
                                                    {task.title}
                                                </h4>
                                            </div>

                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-black/5">
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {task.assigned_to?.charAt(0) || '?'}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 font-bold">
                                                    #{task.id.slice(0, 4).toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {getColumnTasks(col.id).length === 0 && (
                                        <div className="h-40 flex flex-col items-center justify-center text-slate-300 opacity-40">
                                            <LayoutGrid className="h-8 w-8 mb-2" />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
