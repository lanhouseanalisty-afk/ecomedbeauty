import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Consultor, LancamentoDiario } from "@/types/crm/forecast";
import { format, startOfMonth, endOfMonth, differenceInBusinessDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Trophy,
    TrendingUp,
    Target,
    DollarSign,
    ChevronUp,
    ChevronDown,
    Medal,
    Star,
    Crown,
    LayoutDashboard,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatBRL } from "./checklist/utils/forecastUtils";

const RankingDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [consultores, setConsultores] = useState<Consultor[]>([]);
    const [lancamentos, setLancamentos] = useState<LancamentoDiario[]>([]);
    const currentDate = new Date();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch consultores
                const { data: cData } = await supabase
                    .from('consultores_forecast')
                    .select('*')
                    .eq('ativo', true);

                if (cData) setConsultores(cData);

                // Fetch lancamentos for current month
                const start = format(startOfMonth(currentDate), "yyyy-MM-dd");
                const end = format(endOfMonth(currentDate), "yyyy-MM-dd");

                const { data: lData } = await supabase
                    .from('lancamentos_forecast')
                    .select('*')
                    .gte('data', start)
                    .lte('data', end);

                if (lData) setLancamentos(lData);
            } catch (err) {
                console.error("Error fetching ranking data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = useMemo(() => {
        if (!lancamentos.length) return { totalVendas: 0, faturamento: 0, metaMensal: 0, atingimento: 0 };

        const totalVendas = lancamentos.length;
        const faturamento = lancamentos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
        const metaMensal = lancamentos.reduce((acc, curr) => acc + (curr.valor_meta || 0), 0);
        const atingimento = metaMensal > 0 ? (faturamento / metaMensal) * 100 : 0;

        return { totalVendas, faturamento, metaMensal, atingimento };
    }, [lancamentos]);

    const ranking = useMemo(() => {
        return consultores.map(c => {
            const cLancamentos = lancamentos.filter(l => String(l.consultor_id) === String(c.id));
            const totalReal = cLancamentos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
            const totalMeta = cLancamentos.reduce((acc, curr) => acc + (curr.valor_meta || 0), 0);
            return {
                ...c,
                totalReal,
                totalMeta,
                performance: totalMeta > 0 ? (totalReal / totalMeta) * 100 : 0
            };
        }).sort((a, b) => b.totalReal - a.totalReal);
    }, [consultores, lancamentos]);

    const top3 = ranking.slice(0, 3);
    const others = ranking.slice(3);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0D13] p-8 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-64 bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 bg-white/5 rounded-xl text-white" />)}
                </div>
                <Skeleton className="h-[400px] w-full bg-white/5 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0D13] text-white p-4 md:p-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Ranking de Performance
                    </h1>
                    <p className="text-[#94A3B8] font-medium">Dashboard consolidado de faturamento e metas.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#11141D] p-1 rounded-lg border border-white/5">
                    <Badge variant="outline" className="bg-[#8347EB]/10 text-[#8347EB] border-[#8347EB]/20 py-1 px-3">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </Badge>
                </div>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard
                    title="Total de Vendas"
                    value={stats.totalVendas.toString()}
                    icon={TrendingUp}
                    glowColor="purple"
                    trend="+12%"
                />
                <MetricCard
                    title="Faturamento"
                    value={formatBRL(stats.faturamento)}
                    icon={DollarSign}
                    glowColor="blue"
                    trend="+8.4%"
                />
                <MetricCard
                    title="Meta do Mês"
                    value={formatBRL(stats.metaMensal)}
                    icon={Target}
                    glowColor="orange"
                />
                <MetricCard
                    title="Atingimento"
                    value={`${stats.atingimento.toFixed(1)}%`}
                    icon={Star}
                    glowColor="green"
                    progress={stats.atingimento}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Podium Section */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Crown className="text-amber-400 w-6 h-6" />
                        Top 3 Consultores
                    </h2>
                    <div className="flex flex-col gap-6">
                        {top3.map((consultor, idx) => (
                            <PodiumCard key={consultor.id} consultor={consultor} position={idx + 1} />
                        ))}
                    </div>
                </div>

                {/* Main Ranking Table */}
                <div className="lg:col-span-12 xl:col-span-8 bg-[#11141D] rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden group">
                    {/* Background glow effect */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8347EB]/5 blur-[120px] -z-10 group-hover:bg-[#8347EB]/10 transition-colors duration-700" />

                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <LayoutDashboard className="text-[#8347EB]" />
                            Classificação Detalhada
                        </h2>
                        <Badge variant="secondary" className="bg-white/5 text-[#94A3B8] border-none">
                            {ranking.length} consultores ativos
                        </Badge>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[#94A3B8] text-xs uppercase tracking-widest font-bold">
                                    <th className="pb-4 pl-4">Posição</th>
                                    <th className="pb-4">Consultor</th>
                                    <th className="pb-4 text-right">Realizado</th>
                                    <th className="pb-4 text-right">Meta</th>
                                    <th className="pb-4 text-right pr-4">% Ating.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ranking.map((res, idx) => (
                                    <RankingRow key={res.id} data={res} idx={idx} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ title, value, icon: Icon, glowColor, trend, progress }: any) => {
    const colorClasses: any = {
        purple: "bg-[#8347EB]/10 text-[#8347EB] border-[#8347EB]/20 shadow-[#8347EB]/5",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5",
        orange: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5",
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
    };

    return (
        <Card className={cn(
            "bg-[#11141D] border-white/5 rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-300 shadow-xl",
            glowColor && `hover:shadow-2xl shadow-transparent`
        )}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl border", colorClasses[glowColor])}>
                        <Icon size={20} />
                    </div>
                    {trend && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                            {trend}
                        </span >
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-black tabular-nums">{value}</h3>
                </div>
                {progress !== undefined && (
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const PodiumCard = ({ consultor, position }: any) => {
    const isFirst = position === 1;
    const isSecond = position === 2;
    const isThird = position === 3;

    return (
        <div className={cn(
            "relative p-5 rounded-2xl bg-[#11141D] border transition-all duration-500 group overflow-hidden",
            isFirst ? "border-amber-400/30 ring-1 ring-amber-400/10 shadow-[0_0_40px_-15px_rgba(251,191,36,0.2)]" : "border-white/5 hover:border-white/10"
        )}>
            {/* Spotlight effect for #1 */}
            {isFirst && <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/10 blur-[60px] rounded-full" />}

            <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                    <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner",
                        isFirst ? "bg-gradient-to-br from-amber-400 to-amber-600 text-[#0B0D13]" :
                            isSecond ? "bg-gradient-to-br from-slate-300 to-slate-500 text-[#0B0D13]" :
                                "bg-gradient-to-br from-amber-700 to-amber-900 text-white"
                    )}>
                        {position}
                    </div>
                    {isFirst && <Crown className="absolute -top-3 -right-3 w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)] rotate-12" />}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg truncate group-hover:text-white transition-colors">
                        {consultor.nome}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xl font-black text-white/90">
                            {formatBRL(consultor.totalReal)}
                        </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="flex-1 h-1 bg-white/5 rounded-full mr-4">
                            <div
                                className={cn("h-full rounded-full", isFirst ? "bg-amber-400" : "bg-white/40")}
                                style={{ width: `${Math.min(consultor.performance, 100)}%` }}
                            />
                        </div>
                        <span className={cn("text-xs font-bold", isFirst ? "text-amber-400" : "text-[#94A3B8]")}>
                            {consultor.performance.toFixed(0)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RankingRow = ({ data, idx }: any) => {
    return (
        <tr className="group/row hover:bg-white/[0.02] transition-colors rounded-xl overflow-hidden">
            <td className="py-4 pl-4 font-bold text-[#94A3B8] group-hover/row:text-white transition-colors">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/10 group-hover/row:border-[#8347EB]/50">
                        #{idx + 1}
                    </span>
                    {idx < 3 && <Medal size={14} className={cn(idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : "text-amber-700")} />}
                </div>
            </td>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8347EB] to-purple-400 flex items-center justify-center font-bold text-xs ring-2 ring-white/5 ring-offset-2 ring-offset-[#11141D]">
                        {data.nome.charAt(0)}
                    </div>
                    <span className="font-bold tracking-tight text-white/90 group-hover/row:text-white">{data.nome}</span>
                </div>
            </td>
            <td className="py-4 text-right">
                <span className="font-black text-white/90 tabular-nums">{formatBRL(data.totalReal)}</span>
            </td>
            <td className="py-4 text-right text-[#94A3B8] tabular-nums font-medium">
                {formatBRL(data.totalMeta)}
            </td>
            <td className="py-4 text-right pr-4">
                <div className="flex items-center justify-end gap-3">
                    <span className={cn(
                        "text-xs font-black tabular-nums",
                        data.performance >= 100 ? "text-emerald-400" : "text-white/70"
                    )}>
                        {data.performance.toFixed(1)}%
                    </span>
                    {data.performance >= 100 ? <ChevronUp className="text-emerald-400 w-4 h-4" /> : <ChevronDown className="text-rose-400 w-4 h-4 opacity-30" />}
                </div>
            </td>
        </tr>
    );
};

export default RankingDashboardPage;
