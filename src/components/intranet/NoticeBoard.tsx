
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, Bell, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: 'urgent' | 'notice' | 'info';
    target_sector?: string;
    created_at: string;
}

export function NoticeBoard() {
    const { roles } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Notice States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: '',
        content: '',
        priority: 'info',
        target_sector: ''
    });

    const isManager = roles.some(role => role === 'admin' || role.includes('_manager'));

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        const { data, error } = await supabase
            .from('notices')
            .select('*')
            .eq('active', true)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching notices:', error);
        else setNotices(data || []);
        setLoading(false);
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
                active: true
            }]);

            if (error) throw error;

            toast.success("Aviso publicado com sucesso!");
            setIsCreateOpen(false);
            setNewNotice({ title: '', content: '', priority: 'info', target_sector: '' });
            fetchNotices();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao publicar aviso.");
        } finally {
            setCreating(false);
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'notice': return <Bell className="w-5 h-5 text-amber-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'notice': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <Bell className="w-5 h-5" />
                    Mural de Avisos
                </CardTitle>
                {isManager && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" /> Novo Aviso
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Novo Aviso</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Título</Label>
                                    <Input
                                        placeholder="Ex: Manutenção Programada"
                                        value={newNotice.title}
                                        onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Conteúdo</Label>
                                    <Textarea
                                        placeholder="Digite a mensagem..."
                                        rows={4}
                                        value={newNotice.content}
                                        onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Prioridade</Label>
                                        <Select
                                            value={newNotice.priority}
                                            onValueChange={v => setNewNotice({ ...newNotice, priority: v as any })}
                                        >
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="info">Informação</SelectItem>
                                                <SelectItem value="notice">Aviso</SelectItem>
                                                <SelectItem value="urgent">Urgente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Setor Alvo (Opcional)</Label>
                                        <Input
                                            placeholder="Ex: Comercial"
                                            value={newNotice.target_sector}
                                            onChange={e => setNewNotice({ ...newNotice, target_sector: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                                <Button onClick={handleCreateNotice} disabled={creating}>
                                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Publicar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center py-4">Carregando...</div>
                ) : notices.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">Nenhum aviso no momento.</div>
                ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {notices.map((notice) => (
                            <div key={notice.id} className={`p-4 rounded-lg border flex gap-4 ${getPriorityColor(notice.priority)} shadow-sm`}>
                                <div className="mt-1 shrink-0">
                                    {getPriorityIcon(notice.priority)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm">{notice.title}</h4>
                                        <span className="text-[10px] opacity-70 whitespace-nowrap ml-2">
                                            {new Date(notice.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1 whitespace-pre-wrap leading-relaxed opacity-90">{notice.content}</p>
                                    {notice.target_sector && (
                                        <div className="mt-2 text-right">
                                            <Badge variant="outline" className="bg-white/40 border-current text-[10px]">
                                                {notice.target_sector}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
