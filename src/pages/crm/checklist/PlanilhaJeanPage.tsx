
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { addMonths, subMonths, getYear, getMonth } from "date-fns";
import { useForecast } from "@/hooks/useForecast";
import { ForecastHeader } from "./components/ForecastHeader";
import { ForecastTable } from "./components/ForecastTable";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function PlanilhaJeanPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    // Key: "consultorId-date". Value: Object with possible overrides
    const [optimisticValues, setOptimisticValues] = useState<Record<string, { valor?: number; valor_meta?: number }>>({});

    const ano = getYear(currentDate);
    const mes = getMonth(currentDate) + 1;

    // Reset optimistic values when month changes
    useEffect(() => {
        setOptimisticValues({});
    }, [ano, mes]);

    const {
        mesConfig,
        consultores,
        lancamentos,
        updateConfig,
        updateLancamento,
        isLoading
    } = useForecast(ano, mes);

    // Calculate Total Geral merging Server Data + Optimistic Data
    const totalGeral = useMemo(() => {
        const serverMap = new Map<string, number>();
        lancamentos.forEach(l => {
            const key = `${l.consultor_id}-${l.data}`;
            serverMap.set(key, l.valor || 0);
        });

        Object.entries(optimisticValues).forEach(([key, val]) => {
            if (val.valor !== undefined) {
                serverMap.set(key, val.valor);
            }
        });

        let sum = 0;
        for (const val of serverMap.values()) {
            sum += val;
        }
        return sum;
    }, [lancamentos, optimisticValues]);

    const handleUpdateValue = useCallback((consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => {
        updateLancamento.mutate({
            consultor_id: consultorId,
            data: date,
            ...updates
        });
    }, [updateLancamento]);

    const handleOptimisticChange = useCallback((consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => {
        const key = `${consultorId}-${date}`;
        setOptimisticValues(prev => ({
            ...prev,
            [key]: { ...prev[key], ...updates }
        }));
    }, []);

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Previsão & Faturamento</h2>
                <p className="text-muted-foreground">
                    Gestão financeira e metas semanais. (Meta / Realizado)
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <ForecastHeader
                        currentDate={currentDate}
                        onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
                        onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
                        mesConfig={mesConfig || null}
                        onUpdateConfig={(cfg) => updateConfig.mutate(cfg)}
                        totalGeral={totalGeral}
                    />

                    <Card>
                        <CardContent className="p-0">
                            <ForecastTable
                                currentDate={currentDate}
                                consultores={consultores}
                                lancamentos={lancamentos}
                                onUpdateValue={handleUpdateValue}
                                onOptimisticChange={handleOptimisticChange}
                            />
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
