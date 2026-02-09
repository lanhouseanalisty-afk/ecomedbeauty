
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MesConfig } from "@/types/crm/forecast";
import { CurrencyInput } from "./CurrencyInput";

interface ForecastHeaderProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    mesConfig: MesConfig | null;
    onUpdateConfig: (config: Partial<MesConfig>) => void;
    totalGeral: number;
}

export function ForecastHeader({
    currentDate,
    onPrevMonth,
    onNextMonth,
    mesConfig,
    onUpdateConfig,
    totalGeral
}: ForecastHeaderProps) {
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
    };

    const atingimentoMeta = meta ? (totalGeral / meta) * 100 : 0;
    const atingimentoPrevisao = previsao ? (totalGeral / previsao) * 100 : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onPrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-2xl font-bold capitalize min-w-[200px] text-center">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </h2>
                    <Button variant="outline" size="icon" onClick={onNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSave} variant="secondary">
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Metas
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-1">
                            <Label>Meta do Mês (R$)</Label>
                            <CurrencyInput
                                value={meta}
                                onValueChange={setMeta}
                                placeholder="0,00"
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-1">
                            <Label>Previsão (R$)</Label>
                            <CurrencyInput
                                value={previsao}
                                onValueChange={setPrevisao}
                                placeholder="0,00"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className={atingimentoMeta >= 100 ? "bg-green-50" : atingimentoMeta < 80 ? "bg-red-50" : "bg-amber-50"}>
                    <CardContent className="pt-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">% Ating. Meta</span>
                            <span className="text-2xl font-bold">
                                {atingimentoMeta.toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Total: R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">% Ating. Previsão</span>
                            <span className="text-2xl font-bold">
                                {atingimentoPrevisao.toFixed(1)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Faltam: R$ {Math.max(0, (meta || 0) - totalGeral).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
