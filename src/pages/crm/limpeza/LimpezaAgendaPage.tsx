import { useState, useEffect, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon, Clock, Coffee, Plus, Info, Maximize, Minimize } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Meeting {
    id: string;
    title: string;
    meeting_date: string;
    start_time: string;
    end_time: string;
    special_requests: string | null;
    created_at: string;
}

import { useUserRole } from "@/hooks/useUserRole";

import { useLocation } from "react-router-dom";

export default function LimpezaAgendaPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    const location = useLocation();

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            pageRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Only show "Nova Reunião" button if accessed via RH module
    const canManageMeetings = location.pathname.includes('/crm/rh');

    // Form states
    const [title, setTitle] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");

    const { data: meetings, isLoading } = useQuery({
        queryKey: ['limpeza_meetings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('limpeza_meetings')
                .select('*')
                .order('meeting_date', { ascending: true })
                .order('start_time', { ascending: true });

            if (error) {
                console.error("Error fetching meetings:", error);
                throw error;
            }
            return data as Meeting[];
        }
    });

    const createMeeting = useMutation({
        mutationFn: async () => {
            if (!date) throw new Error("Selecione uma data");

            const { error } = await supabase.from('limpeza_meetings').insert({
                title,
                meeting_date: format(date, 'yyyy-MM-dd'),
                start_time: startTime,
                end_time: endTime,
                special_requests: specialRequests || null,
            });

            if (error) {
                console.error("Error creating meeting:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Reunião agendada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['limpeza_meetings'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao agendar reunião.");
        }
    });

    const resetForm = () => {
        setTitle("");
        setStartTime("");
        setEndTime("");
        setSpecialRequests("");
    };

    const selectedDateMeetings = meetings?.filter(m =>
        date && m.meeting_date === format(date, 'yyyy-MM-dd')
    ) || [];

    return (
        <div ref={pageRef} className={cn("space-y-6 container mx-auto p-6 animate-in fade-in transition-all", isFullscreen && "bg-gray-50 m-0 w-full h-full max-w-none overflow-y-auto")}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900">Agenda de Reuniões</h1>
                    <p className="text-muted-foreground">Gerencie o calendário de reuniões e solicitações especiais (Copa/Limpeza).</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Button variant="outline" onClick={toggleFullscreen} className="gap-2">
                        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                        <span className="hidden sm:inline">{isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}</span>
                    </Button>
                    {canManageMeetings && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Nova Reunião
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Agendar Nova Reunião</DialogTitle>
                                    <DialogDescription>
                                        Informe os detalhes da reunião para o dia {date ? format(date, "dd/MM/yyyy") : "selecionado"}.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="title">Título / Assunto</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Reunião de Diretoria"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="start">Horário de Início</Label>
                                            <Input
                                                id="start"
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="end">Horário de Término</Label>
                                            <Input
                                                id="end"
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="requests">Solicitações Especiais (Opcional)</Label>
                                        <Textarea
                                            id="requests"
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            placeholder="Ex: Café para 5 pessoas, água com gás e limpeza da sala antes de começar."
                                            className="resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                    <Button
                                        onClick={() => createMeeting.mutate()}
                                        disabled={createMeeting.isPending || !title || !startTime || !endTime || !date}
                                    >
                                        {createMeeting.isPending ? "Salvando..." : "Agendar Reunião"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calendar Column */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    <Card>
                        <CardContent className="p-3 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                locale={ptBR}
                                className="rounded-md mx-auto"
                                modifiers={{
                                    hasMeeting: (currentDate) => {
                                        const dateStr = format(currentDate, 'yyyy-MM-dd');
                                        return meetings?.some(m => m.meeting_date === dateStr) || false;
                                    }
                                }}
                                modifiersStyles={{
                                    hasMeeting: {
                                        fontWeight: 'bold',
                                        textDecoration: 'underline',
                                        color: 'var(--primary)',
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Meetings List Column */}
                <div className="lg:col-span-8">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-gray-500" />
                                Programação para {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Nenhuma data"}
                            </CardTitle>
                            <CardDescription>
                                {selectedDateMeetings.length === 0
                                    ? "Não há reuniões agendadas para este dia."
                                    : `${selectedDateMeetings.length} reunião(ões) encontrada(s).`
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Carregando agenda...</div>
                            ) : selectedDateMeetings.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedDateMeetings.map((meeting) => (
                                        <div key={meeting.id} className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-md p-3 min-w-[80px]">
                                                <span className="font-bold text-lg">{meeting.start_time.substring(0, 5)}</span>
                                                <span className="text-xs font-medium text-muted-foreground">até {meeting.end_time.substring(0, 5)}</span>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <h4 className="font-semibold text-lg">{meeting.title}</h4>

                                                {meeting.special_requests ? (
                                                    <div className="flex items-start gap-2 mt-2 text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                                                        <Coffee className="h-4 w-4 mt-0.5 shrink-0" />
                                                        <p>{meeting.special_requests}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                                        <Info className="h-4 w-4" />
                                                        <p>Sem solicitações especiais</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <CalendarIcon className="h-12 w-12 mb-4 text-gray-300" />
                                    <p>A agenda está livre neste dia.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
