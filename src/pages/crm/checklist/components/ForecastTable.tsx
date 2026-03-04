import React, { useState, useEffect } from "react";
import { format, isWeekend, getDay, startOfMonth, endOfMonth, isAfter, startOfDay, differenceInBusinessDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Consultor, LancamentoDiario } from "@/types/crm/forecast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";
import { ForecastWeek, formatBRL } from "../utils/forecastUtils";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, AlertCircle, Info, User as UserIcon } from "lucide-react";
import { DateInfoDialog } from "./DateInfoDialog";
import { ForecastDailyNote } from "@/types/crm/forecast";
import { useAuth } from "@/contexts/AuthContext";

const safeParseNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const parsed = parseFloat(String(val).replace(/\./g, '').replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
};

const safeIsSameDay = (dataVal: any, targetStr: string) => {
    if (!dataVal) return false;
    const valStr = typeof dataVal === 'string' ? dataVal : format(new Date(dataVal), "yyyy-MM-dd");
    return valStr.startsWith(targetStr);
};

interface ForecastTableProps {
    currentDate: Date;
    consultores: Consultor[];
    lancamentos: LancamentoDiario[];
    weeks: any[];
    onUpdateValue: (consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => void;
    canEditAll?: boolean;
    dailyNotes?: ForecastDailyNote[];
    onUpdateDateNote?: (date: string, note: string) => void;
    userName?: string;
}

const DoubleCurrencyCell = ({
    initialReal,
    initialMeta,
    onSave,
    disabledReal,
    disabledMeta
}: {
    initialReal: number | "";
    initialMeta: number | "";
    onSave: (real: number | undefined, meta: number | undefined) => void;
    disabledReal?: boolean;
    disabledMeta?: boolean;
}) => {
    const [real, setReal] = useState<number | null>(initialReal === "" ? null : initialReal);
    const [meta, setMeta] = useState<number | null>(initialMeta === "" ? null : initialMeta);

    useEffect(() => {
        setReal(initialReal === "" ? null : initialReal);
        setMeta(initialMeta === "" ? null : initialMeta);
    }, [initialReal, initialMeta]);

    const handleBlur = () => {
        const newReal = real ?? 0;
        const newMeta = meta ?? 0;
        const oldReal = initialReal === "" ? 0 : initialReal;
        const oldMeta = initialMeta === "" ? 0 : initialMeta;

        if (newReal !== oldReal || newMeta !== oldMeta) {
            onSave(newReal, newMeta);
        }
    };

    return (
        <div className={cn("flex flex-col gap-0.5 p-0.5 min-w-[70px]", (disabledReal && disabledMeta) && "opacity-50 grayscale")} onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) handleBlur();
        }}>
            <CurrencyInput
                className="h-5 w-full text-right px-1 text-[9px] text-muted-foreground bg-slate-50/50 border-none hover:bg-slate-100 transition-colors"
                value={meta ?? ""}
                onValueChange={setMeta}
                placeholder="Meta"
                disabled={disabledMeta}
            />
            <CurrencyInput
                className="h-6 w-full text-right px-1 font-bold text-[11px] border-none bg-transparent hover:bg-blue-50/50 transition-colors focus-visible:ring-1 focus-visible:ring-blue-200"
                value={real ?? ""}
                onValueChange={setReal}
                placeholder="Real"
                disabled={disabledReal}
            />
        </div>
    );
};

export const ForecastTable = React.memo(function ForecastTable({
    currentDate,
    consultores,
    lancamentos,
    weeks,
    onUpdateValue,
    canEditAll,
    dailyNotes = [],
    onUpdateDateNote,
    userName
}: ForecastTableProps) {
    const { user } = useAuth();
    const today = new Date();
    const [selectedDateForNote, setSelectedDateForNote] = useState<Date | null>(null);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const todayStartOfDay = startOfDay(new Date());
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const totalBusinessDays = differenceInBusinessDays(monthEnd, monthStart) + 1;

    const getValues = (consultorId: string, day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const found = lancamentos.find(l =>
            String(l.consultor_id) === String(consultorId) &&
            safeIsSameDay(l.data, dateStr)
        );
        return {
            real: found?.valor ?? "",
            meta: found?.valor_meta ?? ""
        };
    };

    const calculateTotals = (consultorId: string) => {
        const cLancamentos = lancamentos.filter(l => String(l.consultor_id) === String(consultorId));
        const totalReal = cLancamentos.reduce((acc, curr) => acc + safeParseNumber(curr.valor), 0);
        const totalMeta = cLancamentos.reduce((acc, curr) => acc + safeParseNumber(curr.valor_meta), 0);

        // Calculate projection per consultant
        const daysPassed = differenceInBusinessDays(todayStartOfDay > monthEnd ? monthEnd : (todayStartOfDay < monthStart ? monthStart : todayStartOfDay), monthStart);
        const dailyAvg = daysPassed > 0 ? totalReal / daysPassed : totalReal;
        const projection = dailyAvg * totalBusinessDays;

        return { totalReal, totalMeta, projection };
    };

    const calculateWeekTotal = (consultorId: string, weekDays: Date[]) => {
        const dayStrings = weekDays.map(d => format(d, "yyyy-MM-dd"));
        return lancamentos
            .filter(l =>
                String(l.consultor_id) === String(consultorId) &&
                dayStrings.some(ds => safeIsSameDay(l.data, ds))
            )
            .reduce((acc, curr) => acc + safeParseNumber(curr.valor), 0);
    };

    const getNoteForDate = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        return dailyNotes.find(n => safeIsSameDay(n.data, dateStr))?.nota || "";
    };

    const handleDateHeaderClick = (date: Date) => {
        if (!onUpdateDateNote) return;
        setSelectedDateForNote(date);
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = (note: string) => {
        if (selectedDateForNote && onUpdateDateNote) {
            onUpdateDateNote(format(selectedDateForNote, "yyyy-MM-dd"), note);
        }
    };

    const sortedConsultores = [...consultores].sort((a, b) => {
        const totalA = calculateTotals(a.id).totalReal;
        const totalB = calculateTotals(b.id).totalReal;
        return totalB - totalA;
    });

    return (
        <>
            <div className="rounded-2xl border-none overflow-hidden bg-white shadow-inner">
                <div className="overflow-x-auto">
                    <Table className="min-w-[1400px] border-collapse">
                        <TableHeader className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-30">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="w-[180px] sticky left-0 bg-slate-50 z-40 border-r border-slate-100 font-bold text-slate-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    Consultor
                                </TableHead>
                                {weeks.map((week, idx) => (
                                    <React.Fragment key={idx}>
                                        <TableHead colSpan={week.days.length} className="text-center border-r border-slate-100 bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider py-2">
                                            Semana {idx + 1}
                                        </TableHead>
                                        <TableHead className="w-[80px] text-right bg-primary/10 text-primary font-black text-[9px] border-r border-slate-200">
                                            Σ SEM {idx + 1}
                                        </TableHead>
                                    </React.Fragment>
                                ))}
                                <TableHead className="w-[100px] text-right font-black bg-slate-900 text-white border-r border-slate-800">REALIZADO</TableHead>
                                <TableHead className="w-[100px] text-right font-black bg-blue-600 text-white">PROJEÇÃO</TableHead>
                            </TableRow>
                            <TableRow className="hover:bg-transparent border-slate-100 bg-white/50">
                                <TableHead className="sticky left-0 bg-white z-40 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] h-10"></TableHead>
                                {weeks.map((week, wIdx) => (
                                    <React.Fragment key={wIdx}>
                                        {week.days.map(day => {
                                            const note = getNoteForDate(day);
                                            return (
                                                <TableHead
                                                    key={day.toISOString()}
                                                    onClick={() => handleDateHeaderClick(day)}
                                                    className={cn(
                                                        "text-center p-2 min-w-[70px] border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group",
                                                        isToday(day) && "bg-slate-50"
                                                    )}
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-[10px] font-bold text-slate-500">{format(day, "dd/MM")}</span>
                                                        <span className="text-[9px] text-slate-400 font-medium uppercase">{format(day, "EEEE", { locale: ptBR })}</span>
                                                        {note && (
                                                            <Info className="h-3 w-3 text-primary animate-pulse" />
                                                        )}
                                                    </div>
                                                </TableHead>
                                            );
                                        })}
                                        <TableHead className="bg-primary/5 border-r border-slate-200 shadow-inner"></TableHead>
                                    </React.Fragment>
                                ))}
                                <TableHead className="bg-slate-900/90"></TableHead>
                                <TableHead className="bg-blue-600/90"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedConsultores.map((consultor, idx) => {
                                const totals = calculateTotals(consultor.id);
                                const isTop = idx === 0;

                                return (
                                    <TableRow key={consultor.id} className={cn(
                                        "group hover:bg-slate-50/80 transition-colors border-slate-100",
                                        isTop && "bg-amber-50/5"
                                    )}>
                                        <TableCell className="font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] py-3">
                                            <div className="flex items-center gap-3">

                                                {(() => {
                                                    // Forçar sempre a exibição do userName (usuário logado na página) se houver apenas 1 consultor visível, 
                                                    // ou se o e-mail bater. Conforme requisito: "mostrar o nome de quem está logado na paina"
                                                    const isCurrentUser = (consultor.email && user?.email && consultor.email.toLowerCase() === user.email.toLowerCase()) || consultores.length === 1;
                                                    const displayName = isCurrentUser ? (userName || consultor.nome) : consultor.nome;

                                                    const performance = (() => {
                                                        if (totals.totalMeta === 0) return totals.totalReal > 0 ? { emoji: "😊", label: "Superou" } : { emoji: "😐", label: "No Caminho" };
                                                        const pct = (totals.totalReal / totals.totalMeta) * 100;
                                                        if (pct < 80) return { emoji: "😟", label: "Abaixo" };
                                                        if (pct < 100) return { emoji: "😐", label: "No Caminho" };
                                                        return { emoji: "😊", label: "Superou" };
                                                    })();

                                                    return (
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <span className="text-4xl leading-none select-none shrink-0" title={performance.label}>
                                                                {performance.emoji}
                                                            </span>
                                                            <div className="flex flex-col min-w-0">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-sm text-slate-800 font-bold tracking-tight truncate max-w-[120px]">
                                                                        {displayName}
                                                                    </span>
                                                                    {isCurrentUser && (
                                                                        <Badge className="h-3.5 text-[7px] bg-emerald-500 text-white border-none px-1 py-0 leading-none">VOCÊ</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </TableCell>
                                        {
                                            weeks.map((week, wIdx) => (
                                                <React.Fragment key={wIdx}>
                                                    {week.days.map(day => {
                                                        const values = getValues(consultor.id, day);
                                                        const dateStr = format(day, "yyyy-MM-dd");
                                                        const isFuture = isAfter(startOfDay(day), todayStartOfDay);
                                                        return (
                                                            <TableCell key={day.toISOString()} className={cn(
                                                                "p-0 border-r border-slate-50 transition-colors",
                                                                isFuture && "bg-slate-50/30"
                                                            )}>
                                                                <DoubleCurrencyCell
                                                                    initialReal={values.real as any}
                                                                    initialMeta={values.meta as any}
                                                                    onSave={(r, m) => onUpdateValue(consultor.id, dateStr, { valor: r, valor_meta: m })}
                                                                    disabledReal={!canEditAll && isFuture}
                                                                    disabledMeta={!canEditAll}
                                                                />
                                                            </TableCell>
                                                        );
                                                    })}
                                                    <TableCell className="text-right bg-primary/5 border-r border-slate-200 font-bold text-[10px] text-primary/80 align-middle">
                                                        {formatBRL(calculateWeekTotal(consultor.id, week.days))}
                                                    </TableCell>
                                                </React.Fragment>
                                            ))
                                        }
                                        <TableCell className="text-right bg-slate-900/5 border-r border-slate-100 font-bold text-slate-900 text-xs">
                                            {formatBRL(totals.totalReal)}
                                        </TableCell>
                                        <TableCell className="text-right bg-blue-50 border-r border-slate-100 font-black text-blue-700 text-xs shadow-inner">
                                            {formatBRL(totals.projection)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {/* Totais Gerais por Dia */}
                            <TableRow className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200 sticky bottom-0 z-20">
                                <TableCell className="sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-[10px] uppercase">DIÂMETRO TOTAL</TableCell>
                                {weeks.map((week, wIdx) => (
                                    <React.Fragment key={wIdx}>
                                        {week.days.map(day => {
                                            const dateStr = format(day, "yyyy-MM-dd");
                                            const dayTotal = lancamentos
                                                .filter(l => safeIsSameDay(l.data, dateStr))
                                                .reduce((acc, curr) => acc + safeParseNumber(curr.valor), 0);
                                            return (
                                                <TableCell key={day.toISOString()} className="text-right text-[10px] border-r border-slate-200 py-4 tabular-nums">
                                                    {dayTotal > 0 ? formatBRL(dayTotal) : '-'}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className="text-right bg-primary text-white text-[10px] border-r border-primary tabular-nums">
                                            {formatBRL(consultores.reduce((acc, c) => acc + calculateWeekTotal(c.id, week.days), 0))}
                                        </TableCell>
                                    </React.Fragment>
                                ))}
                                <TableCell className="text-right bg-slate-900 text-white text-xs tabular-nums">
                                    {formatBRL(consultores.reduce((acc, c) => acc + calculateTotals(c.id).totalReal, 0))}
                                </TableCell>
                                <TableCell className="text-right bg-blue-600 text-white text-xs tabular-nums shadow-xl">
                                    {formatBRL(consultores.reduce((acc, c) => acc + calculateTotals(c.id).projection, 0))}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <DateInfoDialog
                    open={isNoteDialogOpen}
                    onOpenChange={setIsNoteDialogOpen}
                    date={selectedDateForNote}
                    initialNote={selectedDateForNote ? getNoteForDate(selectedDateForNote) : ""}
                    onSave={handleSaveNote}
                />
            </div >
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-slate-400 mt-0.5" />
                <p className="text-[10px] text-slate-500 max-w-2xl leading-relaxed uppercase tracking-wide">
                    Os dados são processados em tempo real. A projeção assume a manutenção do histórico diário até o fim do ciclo mensal (considerando dias úteis remanescentes).
                </p>
            </div>
        </>
    );
});
