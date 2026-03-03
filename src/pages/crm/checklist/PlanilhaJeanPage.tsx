import { useState, useMemo, useCallback } from 'react';
import { addMonths, subMonths, getYear, getMonth, startOfMonth, format } from "date-fns";
import { useForecast } from "@/hooks/useForecast";
import { ForecastHeader } from "./components/ForecastHeader";
import { ForecastTable } from "./components/ForecastTable";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Calendar } from "lucide-react";
import { calculateProjection, groupDaysIntoWeeks } from "./utils/forecastUtils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function PlanilhaJeanPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const ano = getYear(currentDate);
    const mes = getMonth(currentDate) + 1;

    const {
        mesConfig,
        consultores,
        lancamentos,
        dailyNotes,
        identifiedConsultorName,
        updateConfig,
        updateLancamento,
        updateDateNote,
        isLoading,
        canViewAll
    } = useForecast(ano, mes);

    // Grouping logic for V2.0
    const weeks = useMemo(() => groupDaysIntoWeeks(currentDate), [currentDate]);

    // Calculate High-Fidelity Totals
    const totalGeral = useMemo(() => {
        return lancamentos.reduce((acc, curr) => acc + safeParseNumber(curr.valor), 0);
    }, [lancamentos]);

    const projection = useMemo(() => {
        return calculateProjection(currentDate, lancamentos, totalGeral);
    }, [currentDate, lancamentos, totalGeral]);

    const handleUpdateValue = useCallback((consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => {
        updateLancamento.mutate({
            consultor_id: consultorId,
            data: date,
            ...updates
        });
    }, [updateLancamento]);

    const handleMonthChange = (direction: 'next' | 'prev') => {
        setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    };

    // Generate month tabs (3 months back, current, 3 months forward)
    const monthTabs = useMemo(() => {
        const tabs = [];
        const baseDate = startOfMonth(new Date());
        for (let i = -3; i <= 3; i++) {
            tabs.push(addMonths(baseDate, i));
        }
        return tabs;
    }, []);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif">
                        Previsão & Faturamento {identifiedConsultorName && `- ${identifiedConsultorName}`}
                    </h2>
                    <p className="text-muted-foreground">
                        Dashboard Estratégico - V2.0 (Alta Fidelidade)
                    </p>
                </div>

                <Tabs
                    value={currentDate.toISOString()}
                    onValueChange={(val) => setCurrentDate(new Date(val))}
                    className="w-full md:w-auto overflow-x-auto"
                >
                    <TabsList className="grid h-10 w-full grid-cols-7 lg:w-[600px] bg-slate-100 p-1">
                        {monthTabs.map((dt) => (
                            <TabsTrigger
                                key={dt.toISOString()}
                                value={dt.toISOString()}
                                className="text-[10px] md:text-xs px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                {new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(dt).toUpperCase()}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <ForecastHeader
                        currentDate={currentDate}
                        onPrevMonth={() => handleMonthChange('prev')}
                        onNextMonth={() => handleMonthChange('next')}
                        mesConfig={mesConfig || null}
                        onUpdateConfig={(cfg) => updateConfig.mutate(cfg)}
                        totalGeral={totalGeral}
                        projection={projection}
                        consultores={consultores}
                        lancamentos={lancamentos}
                        onUpdateValue={handleUpdateValue}
                        canEditAll={canViewAll}
                        userName={identifiedConsultorName}
                    />

                    <div className="grid gap-6">
                        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden rounded-2xl border border-slate-100">
                            <CardContent className="p-0">
                                <ForecastTable
                                    currentDate={currentDate}
                                    consultores={consultores}
                                    lancamentos={lancamentos}
                                    weeks={weeks}
                                    onUpdateValue={handleUpdateValue}
                                    canEditAll={canViewAll}
                                    dailyNotes={dailyNotes}
                                    onUpdateDateNote={(date, note) => updateDateNote.mutate({ data: date, nota: note })}
                                    userName={identifiedConsultorName}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
