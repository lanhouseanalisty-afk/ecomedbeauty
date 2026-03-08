import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Coffee, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

interface LimpezaRequestDialogProps {
    children?: React.ReactNode;
}

export function LimpezaRequestDialog({ children }: LimpezaRequestDialogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    // Form states
    const [title, setTitle] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");

    const createMeeting = useMutation({
        mutationFn: async () => {
            if (!title || !meetingDate || !startTime || !endTime) {
                throw new Error("Preencha os campos obrigatórios.");
            }

            const { error } = await supabase.from('limpeza_meetings').insert({
                title,
                meeting_date: meetingDate,
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
            toast.success("Solicitação enviada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['limpeza_meetings'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Erro ao enviar solicitação.");
        }
    });

    const resetForm = () => {
        setTitle("");
        setMeetingDate("");
        setStartTime("");
        setEndTime("");
        setSpecialRequests("");
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="gap-2 border-teal-200 hover:border-teal-300 bg-teal-50/30 text-teal-700">
                        <Coffee className="h-4 w-4" />
                        Limpeza & Copa
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Solicitação Limpeza & Copa</DialogTitle>
                    <DialogDescription>
                        Informe os detalhes para agendar a limpeza ou preparar a copa.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Título / Assunto</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Café para Reunião de Diretoria"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            type="date"
                            value={meetingDate}
                            onChange={(e) => setMeetingDate(e.target.value)}
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
                        <Label htmlFor="requests">Detalhes (Itens, Local, etc.)</Label>
                        <Textarea
                            id="requests"
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="Ex: Sala de Reunião 2, café para 5 pessoas e água."
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button
                        onClick={() => createMeeting.mutate()}
                        disabled={createMeeting.isPending || !title || !meetingDate || !startTime || !endTime}
                    >
                        {createMeeting.isPending ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
