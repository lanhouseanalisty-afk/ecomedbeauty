
import React, { useState, useEffect } from "react";
import { format, isSameDay, isWeekend, getDay, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Consultor, LancamentoDiario } from "@/types/crm/forecast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "./CurrencyInput";

interface ForecastTableProps {
    currentDate: Date;
    consultores: Consultor[];
    lancamentos: LancamentoDiario[];
    onUpdateValue: (consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => void;
    onOptimisticChange?: (consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => void;
}

const DoubleCurrencyCell = ({
    initialReal,
    initialMeta,
    onSave,
    onChange,
    disabled
}: {
    initialReal: number | "";
    initialMeta: number | "";
    onSave: (real: number | undefined, meta: number | undefined) => void;
    onChange?: (real: number | undefined, meta: number | undefined) => void;
    disabled?: boolean;
}) => {
    const [real, setReal] = useState<number | null>(initialReal === "" ? null : initialReal);
    const [meta, setMeta] = useState<number | null>(initialMeta === "" ? null : initialMeta);

    useEffect(() => {
        if (initialReal !== "") setReal(initialReal);
    }, [initialReal]);

    useEffect(() => {
        if (initialMeta !== "") setMeta(initialMeta);
    }, [initialMeta]);

    const handleBlur = () => {
        if (disabled) return;
        // Trigger save with current internal values
        // We convert null to undefined for the callback if appropriate, or keep consistent
        // The mutation expects numbers. 0 is a number. null/undefined ...
        // If val is null, it means no input.
        const r = real ?? undefined;
        const m = meta ?? undefined;

        // Only save if dirty? Hard to track distinct dirty state for both. 
        // We will just save both on blur of either.
        onSave(r ?? 0, m ?? 0); // defaulting to 0 for DB? Or should we allow null?
        // DB columns are standard number.
    };

    const handleRealChange = (val: number) => {
        setReal(val);
        onChange?.(val, meta ?? undefined);
    };

    const handleMetaChange = (val: number) => {
        setMeta(val);
        onChange?.(real ?? undefined, val);
    };

    return (
        <div className={cn("flex flex-col gap-1 p-0.5", disabled && "opacity-50 pointer-events-none")} onBlur={(e) => {
            // Check if focus moved outside this cell container
            if (!e.currentTarget.contains(e.relatedTarget)) {
                handleBlur();
            }
        }}>
            {/* Meta Input (Need) */}
            <CurrencyInput
                className="h-6 w-full text-right px-1 text-[10px] text-muted-foreground bg-slate-50 border-slate-200"
                value={meta ?? ""}
                onValueChange={handleMetaChange}
                placeholder="Meta"
                disabled={disabled}
            />
            {/* Real Input (Achieved) */}
            <CurrencyInput
                className="h-7 w-full text-right px-1 font-semibold border-blue-100"
                value={real ?? ""}
                onValueChange={handleRealChange}
                placeholder="Real"
                disabled={disabled}
            />
        </div>
    );
};

export const ForecastTable = React.memo(function ForecastTable({
    currentDate,
    consultores,
    lancamentos,
    onUpdateValue,
    onOptimisticChange
}: ForecastTableProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const today = startOfDay(new Date());

    const weeks = React.useMemo(() => eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 }), [currentDate]);

    const getValues = (consultorId: string, day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const found = lancamentos.find(l => l.consultor_id === consultorId && l.data === dateStr);
        return {
            real: found?.valor ?? "",
            meta: found?.valor_meta ?? ""
        };
    };

    const calculateTotal = (consultorId: string, field: 'valor' | 'valor_meta') => {
        return lancamentos
            .filter(l => l.consultor_id === consultorId)
            .reduce((acc, curr) => acc + (curr[field] || 0), 0);
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[1200px]">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px] sticky left-0 bg-background z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">Consultor</TableHead>
                        {weeks.map((weekStart, idx) => {
                            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                            const actualEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
                            const daysInWeek = eachDayOfInterval({ start: weekStart, end: actualEnd })
                                .filter(d => getDay(d) !== 0);

                            return (
                                <TableHead key={idx} colSpan={daysInWeek.length} className="text-center border-l bg-muted/50">
                                    Semana {idx + 1}
                                </TableHead>
                            );
                        })}
                        <TableHead className="w-[120px] text-right font-bold bg-muted/50">TOTAIS</TableHead>
                    </TableRow>
                    <TableRow>
                        <TableHead className="sticky left-0 bg-background z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]"></TableHead>
                        {weeks.flatMap((weekStart) => {
                            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                            const actualEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
                            return eachDayOfInterval({ start: weekStart, end: actualEnd })
                                .filter(d => getDay(d) !== 0)
                                .map(day => (
                                    <TableHead key={day.toISOString()} className={cn("text-center min-w-[80px] text-xs px-1", isWeekend(day) && "bg-orange-50")}>
                                        {format(day, "dd/MM")}
                                        <br />
                                        {format(day, "EEE", { locale: ptBR })}
                                    </TableHead>
                                ));
                        })}
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {consultores.map((consultor) => (
                        <TableRow key={consultor.id}>
                            <TableCell className="font-medium sticky left-0 bg-background z-10 border-r shadow-[1px_0_0_0_rgba(0,0,0,0.1)] valign-top pt-4">
                                {consultor.nome}
                            </TableCell>
                            {weeks.flatMap((weekStart) => {
                                const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                                const actualEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
                                return eachDayOfInterval({ start: weekStart, end: actualEnd })
                                    .filter(d => getDay(d) !== 0)
                                    .map(day => {
                                        const values = getValues(consultor.id, day);
                                        const dateStr = format(day, "yyyy-MM-dd");
                                        const isFuture = isAfter(startOfDay(day), today);
                                        return (
                                            <TableCell key={day.toISOString()} className={cn("p-1 border-r border-dotted align-top", isFuture && "bg-muted/10")}>
                                                <DoubleCurrencyCell
                                                    initialReal={values.real}
                                                    initialMeta={values.meta}
                                                    onSave={(r, m) => onUpdateValue(consultor.id, dateStr, { valor: r, valor_meta: m })}
                                                    onChange={(r, m) => onOptimisticChange?.(consultor.id, dateStr, { valor: r, valor_meta: m })}
                                                    disabled={isFuture}
                                                />
                                            </TableCell>
                                        );
                                    });
                            })}
                            <TableCell className="text-right bg-muted/20 align-top">
                                <div className="flex flex-col gap-1 items-end pt-1">
                                    <span className="text-xs text-muted-foreground">Meta: {calculateTotal(consultor.id, 'valor_meta').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="font-bold">Real: {calculateTotal(consultor.id, 'valor').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}

                    <TableRow className="bg-muted font-bold">
                        <TableCell className="sticky left-0 bg-muted z-10 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">TOTAL GERAL</TableCell>
                        {weeks.flatMap((weekStart) => {
                            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                            const actualEnd = weekEnd > monthEnd ? monthEnd : weekEnd;
                            return eachDayOfInterval({ start: weekStart, end: actualEnd })
                                .filter(d => getDay(d) !== 0)
                                .map(day => {
                                    const dateStr = format(day, "yyyy-MM-dd");
                                    const dayTotalReal = lancamentos
                                        .filter(l => l.data === dateStr)
                                        .reduce((acc, curr) => acc + (curr.valor || 0), 0);

                                    // Optional: Logic for total meta per day?
                                    // For now show only Real total to be cleaner
                                    return (
                                        <TableCell key={day.toISOString()} className="text-right text-xs px-1 align-top pt-3">
                                            {dayTotalReal > 0 ? dayTotalReal.toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : '-'}
                                        </TableCell>
                                    );
                                });
                        })}
                        <TableCell className="text-right text-lg align-top pt-3">
                            {consultores.reduce((acc, c) => acc + calculateTotal(c.id, 'valor'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
});
