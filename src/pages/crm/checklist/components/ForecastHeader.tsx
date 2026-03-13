import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    ChevronRight,
    Save,
    Download,
    Upload,
    TrendingUp,
    Target,
    BarChart3,
    CalendarDays,
    User as UserIcon
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MesConfig, Consultor, LancamentoDiario } from "@/types/crm/forecast";
import { CurrencyInput } from "./CurrencyInput";
import { formatBRL } from "../utils/forecastUtils";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ForecastHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    mesConfig: MesConfig | null;
    onUpdateConfig: (config: Partial<MesConfig>) => void;
    totalGeral: number;
    projection: number;
    consultores: Consultor[];
    lancamentos: LancamentoDiario[];
    onUpdateValue: (consultorId: string, date: string, updates: { valor?: number; valor_meta?: number }) => void;
    canEditAll?: boolean;
    userName?: string;
}

export function ForecastHeader({
    currentDate,
    onPrevMonth,
    onNextMonth,
    mesConfig,
    onUpdateConfig,
    totalGeral,
    projection,
    consultores,
    lancamentos,
    onUpdateValue,
    canEditAll,
    userName
}: ForecastHeaderProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [meta, setMeta] = React.useState<number>(mesConfig?.meta || 0);
    const [previsao, setPrevisao] = React.useState<number>(mesConfig?.previsao || 0);

    React.useEffect(() => {
        setMeta(mesConfig?.meta || 0);
        setPrevisao(mesConfig?.previsao || 0);
    }, [mesConfig]);

    const handleSave = () => {
        onUpdateConfig({
            meta: meta,
            previsao: previsao,
        });
        toast.success("Parâmetros do mês salvos!");
    };

    const handleExport = () => {
        try {
            const daysInMonth = eachDayOfInterval({
                start: startOfMonth(currentDate),
                end: endOfMonth(currentDate)
            });

            const data = consultores.map(c => {
                const row: any = { "Consultor": c.nome };
                daysInMonth.forEach(day => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    const lanc = lancamentos.find(l => l.consultor_id === c.id && l.data === dateStr);
                    row[format(day, "dd/MM")] = lanc?.valor || 0;
                });
                return row;
            });

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Previsão");
            XLSX.writeFile(wb, `Ecomed_Forecast_${format(currentDate, "MMM_yyyy", { locale: ptBR })}.xlsx`);
            toast.success("Excel gerado!");
        } catch (error) {
            toast.error("Erro ao gerar Excel.");
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws) as any[];

                const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(currentDate),
                    end: endOfMonth(currentDate)
                });

                data.forEach(row => {
                    const consultor = consultores.find(c => c.nome === row["Consultor"]);
                    if (!consultor) return;

                    daysInMonth.forEach(day => {
                        const colName = format(day, "dd/MM");
                        const valor = row[colName];
                        if (valor !== undefined) {
                            onUpdateValue(consultor.id, format(day, "yyyy-MM-dd"), { valor: Number(valor) });
                        }
                    });
                });

                toast.success("Dados importados!");
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (error) {
                toast.error("Erro no processamento do arquivo.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const atingimentoMeta = meta ? (totalGeral / meta) * 100 : 0;
    const diffMeta = Math.max(0, meta - totalGeral);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold capitalize">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </h3>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">Ciclo operacional vigente</p>
                            {userName && (
                                <>
                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">LOGADO COMO:</span>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                                            {userName}
                                        </span>
                                        <UserIcon className="h-2.5 w-2.5 text-slate-400" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl border shadow-sm items-center">
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".xlsx, .xls" className="hidden" />
                    {canEditAll && (
                        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="text-green-600 hover:text-green-700 hover:bg-green-50 gap-2">
                            <Upload className="h-4 w-4" />
                            Importar
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = '/Modelo_Previsao_Original.xlsx';
                            link.download = 'Modelo_Previsao_Original.xlsx';
                            link.click();
                        }}
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Download do modelo original
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExport} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                    <div className="w-[1px] bg-slate-200 h-6 mx-1" />
                    <Button
                        onClick={handleSave}
                        disabled={!canEditAll}
                        className="bg-primary hover:bg-primary/90 text-white shadow-md gap-2 px-4 shadow-primary/20 disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        Atualizar Metas
                    </Button>
                </div>
            </div >

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target className="h-12 w-12" />
                    </div>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <Label className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center md:text-left">Meta Global do Mês</Label>
                            <CurrencyInput
                                className="text-xl md:text-2xl font-bold border-none p-0 focus-visible:ring-0 h-auto bg-transparent disabled:opacity-100 text-center md:text-left"
                                value={meta}
                                onValueChange={setMeta}
                                placeholder="Definir Meta"
                                disabled={!canEditAll}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <BarChart3 className="h-12 w-12" />
                    </div>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <Label className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-center md:text-left">Realizado Acumulado</Label>
                            <div className="text-xl md:text-2xl font-bold text-center md:text-left">{formatBRL(totalGeral)}</div>
                            <div className="flex items-center justify-center md:justify-start gap-1 text-[9px] md:text-[10px] text-muted-foreground">
                                <span className="font-bold text-blue-600">{atingimentoMeta.toFixed(1)}%</span> da meta atingida
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "border-none shadow-lg overflow-hidden relative group text-white",
                    atingimentoMeta >= 100 ? "bg-emerald-600" : "bg-slate-900"
                )}>
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <TrendingUp className="h-12 w-12" />
                    </div>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <Label className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/70 font-bold text-center md:text-left">Projeção Final</Label>
                            <div className="text-xl md:text-2xl font-bold text-center md:text-left">{formatBRL(projection)}</div>
                            <div className="text-[9px] md:text-[10px] text-white/60 text-center md:text-left">Estimativa baseada no ritmo atual</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg overflow-hidden relative group bg-amber-50/50 border border-amber-100">
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <Label className="text-[9px] md:text-[10px] uppercase tracking-wider text-amber-700 font-bold text-center md:text-left">Gap para Meta</Label>
                            <div className="text-xl md:text-2xl font-bold text-amber-700 text-center md:text-left">{formatBRL(diffMeta)}</div>
                            <div className="text-[9px] md:text-[10px] text-amber-600/70 text-center md:text-left">Restante para concluir o objetivo</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
