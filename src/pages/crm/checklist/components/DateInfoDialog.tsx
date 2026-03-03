
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DateInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    date: Date | null;
    initialNote: string;
    onSave: (note: string) => void;
}

export function DateInfoDialog({ open, onOpenChange, date, initialNote, onSave }: DateInfoDialogProps) {
    const [note, setNote] = useState(initialNote);

    useEffect(() => {
        if (open) {
            setNote(initialNote);
        }
    }, [open, initialNote]);

    const handleSave = () => {
        onSave(note);
        onOpenChange(false);
    };

    if (!date) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex flex-col gap-1">
                        <span>Informações do Dia</span>
                        <span className="text-sm font-normal text-muted-foreground capitalize">
                            {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                        </span>
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        placeholder="Digite observações, feriados ou avisos para este dia..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        Salvar Informação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
