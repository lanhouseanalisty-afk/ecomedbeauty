import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Bell, Plus, Loader2, Megaphone, Sparkles, Pin, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: 'urgent' | 'notice' | 'info';
    target_sector?: string;
    created_at: string;
    expires_at?: string | null;
}

interface Position {
    x: number;
    y: number;
    rotate: number;
}

export function NoticeBoard() {
    const { roles } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemPositions, setItemPositions] = useState<Record<string, Position>>({});
    const boardRef = useRef<HTMLDivElement>(null);

    // Create Notice States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        priority: 'info',
        target_sector: '',
        expires_at: ''
    });

    const { isAdmin, canAccessModule } = useUserRole();
    const isManager = roles.some(role => role === 'admin' || role.includes('_manager'));

    useEffect(() => {
        fetchNotices();
    }, []);

    // Load positions from localStorage
    useEffect(() => {
        const savedPositions = localStorage.getItem('notice_positions');
        if (savedPositions) {
            try {
                setItemPositions(JSON.parse(savedPositions));
            } catch (e) {
                console.error("Error parsing saved positions", e);
            }
        }
    }, []);

    const fetchNotices = async () => {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('active', true)
            .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching notices:', error);
        else {
            const fetchedNotices: Notice[] = data || [];
            setNotices(fetchedNotices);

            // Generate random positions for new notices if not saved
            setItemPositions(prev => {
                const newPos = { ...prev };
                fetchedNotices.forEach((notice, index) => {
                    if (!newPos[notice.id]) {
                        newPos[notice.id] = {
                            x: (index % 3) * 280 + 20,
                            y: Math.floor(index / 3) * 200 + 20,
                            rotate: Math.random() * 6 - 3 // -3 to 3 degrees
                        };
                    }
                });
                return newPos;
            });
        }
        setLoading(false);
    };

    const handleDragEnd = (id: string, info: any) => {
        setItemPositions(prev => {
            const updated = {
                ...prev,
                [id]: {
                    ...prev[id],
                    x: prev[id].x + info.offset.x,
                    y: prev[id].y + info.offset.y
                }
            };
            localStorage.setItem('notice_positions', JSON.stringify(updated));
            return updated;
        });
    };

    const handleCreateNotice = async () => {
        if (!newNotice.title || !newNotice.content) {
            toast.error("Preencha título e conteúdo.");
            return;
        }

        setCreating(true);
        try {
            const { error } = await supabase.from('notices').insert([{
                title: newNotice.title,
                content: newNotice.content,
                priority: newNotice.priority,
                target_sector: newNotice.target_sector || null,
                expires_at: newNotice.expires_at || null,
                active: true
            }]);

            if (error) throw error;

            toast.success("Aviso publicado com sucesso!");
            setIsCreateOpen(false);
            setNewNotice({ title: '', content: '', priority: 'info', target_sector: '', expires_at: '' });
            fetchNotices();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao publicar aviso.");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir permanentemente este aviso do mural?")) return;
        try {
            const { error } = await supabase.from('notices').update({ active: false }).eq('id', id);
            if (error) throw error;
            toast.success("Aviso excluído com sucesso!");
            fetchNotices();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir aviso.");
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-[#fff0f0] border-rose-200 shadow-rose-100';
            case 'notice': return 'bg-[#fff9e6] border-amber-200 shadow-amber-100';
            default: return 'bg-[#f0f9ff] border-sky-200 shadow-sky-100';
        }
    };

    const getPinColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-rose-500';
            case 'notice': return 'text-amber-500';
            default: return 'text-sky-500';
        }
    };

    return (
        <Card className="h-full border-none shadow-2xl bg-slate-100 overflow-hidden flex flex-col rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-white/50 backdrop-blur-md px-8 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-2.5 rounded-2xl text-white shadow-lg">
                        <Pin className="w-5 h-5 rotate-45" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-slate-800 tracking-tightest uppercase">
                            Mural Interativo
                        </CardTitle>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Arraste os avisos como quiser</p>
                    </div>
                </div>
                {isManager && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 h-11 shadow-xl transition-all hover:scale-105 active:scale-95">
                                <Plus className="w-5 h-5" /> Novo Post-it
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-slate-900 text-center pt-4">CRIAR AVISO</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-8 px-2">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase ml-1">Título</Label>
                                    <Input
                                        placeholder="Título curto e direto..."
                                        value={newNotice.title}
                                        onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                        className="h-14 rounded-2xl border-2 border-slate-100 focus:border-slate-900 transition-all text-lg font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase ml-1">Mensagem</Label>
                                    <Textarea
                                        placeholder="O que você quer comunicar?"
                                        rows={4}
                                        value={newNotice.content}
                                        onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                        className="rounded-2xl border-2 border-slate-100 focus:border-slate-900 transition-all text-base font-medium resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-500 uppercase ml-1">Prioridade</Label>
                                        <Select
                                            value={newNotice.priority}
                                            onValueChange={v => setNewNotice({ ...newNotice, priority: v as any })}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                <SelectItem value="info" className="font-bold">📘 Informação</SelectItem>
                                                <SelectItem value="notice" className="font-bold">📙 Aviso</SelectItem>
                                                <SelectItem value="urgent" className="font-bold">📕 Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black text-slate-500 uppercase ml-1">Setor</Label>
                                        <Input
                                            placeholder="Ex: RH"
                                            value={newNotice.target_sector}
                                            onChange={e => setNewNotice({ ...newNotice, target_sector: e.target.value })}
                                            className="h-14 rounded-2xl border-2 border-slate-100 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black text-slate-500 uppercase ml-1">Data de Expiração (Opcional)</Label>
                                    <Input
                                        type="datetime-local"
                                        value={newNotice.expires_at}
                                        onChange={e => setNewNotice({ ...newNotice, expires_at: e.target.value })}
                                        className="h-14 rounded-2xl border-2 border-slate-100 font-bold"
                                    />
                                </div>
                            </div>
                            <DialogFooter className="pb-4">
                                <Button onClick={handleCreateNotice} disabled={creating} className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xl font-black shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95">
                                    {creating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 mr-2" />}
                                    PUBLICAR NO MURAL
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]" ref={boardRef}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="w-12 h-12 text-slate-800 animate-spin" />
                    </div>
                ) : notices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30 grayscale">
                        <Megaphone className="w-32 h-32 text-slate-400" />
                        <p className="text-2xl font-black text-slate-500 uppercase tracking-tighter">O mural está limpo</p>
                    </div>
                ) : (
                    <div className="w-full h-[700px] p-8">
                        <AnimatePresence>
                            {notices.map((notice) => {
                                const pos = itemPositions[notice.id] || { x: 0, y: 0, rotate: 0 };
                                return (
                                    <motion.div
                                        key={notice.id}
                                        drag
                                        dragConstraints={boardRef}
                                        dragElastic={0.1}
                                        dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
                                        onDragEnd={(_, info) => handleDragEnd(notice.id, info)}
                                        initial={{ opacity: 0, scale: 0.5, x: pos.x, y: pos.y, rotate: pos.rotate }}
                                        animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y, rotate: pos.rotate }}
                                        whileDrag={{
                                            scale: 1.05,
                                            zIndex: 50,
                                            rotate: 0,
                                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                                        }}
                                        className={`absolute w-[260px] p-6 rounded-sm border-t-4 shadow-xl cursor-grab active:cursor-grabbing select-none ${getPriorityStyles(notice.priority)}`}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 transition-transform group-hover:scale-110">
                                            <Pin className={`w-6 h-6 drop-shadow-md fill-current ${getPinColor(notice.priority)}`} />
                                        </div>
                                        {(isAdmin || canAccessModule('rh')) && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }}
                                                className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 bg-white/70 hover:bg-white rounded-full p-1.5 backdrop-blur-sm transition-colors shadow-sm z-20"
                                                title="Excluir aviso permanentemente"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}

                                        <div className="space-y-3 pt-2">
                                            <h4 className="font-black text-slate-900 text-lg leading-none uppercase tracking-tighter border-b-2 border-black/5 pb-2">
                                                {notice.title}
                                            </h4>
                                            <p className="text-sm text-slate-800 font-bold leading-relaxed whitespace-pre-wrap italic">
                                                "{notice.content}"
                                            </p>

                                            <div className="flex justify-between items-center pt-2 mt-4 border-t border-black/5">
                                                <span className="text-[9px] font-black uppercase text-black/40">
                                                    {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                                {notice.target_sector && (
                                                    <span className="text-[9px] font-black uppercase bg-black/10 px-2 py-0.5 rounded">
                                                        {notice.target_sector}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
