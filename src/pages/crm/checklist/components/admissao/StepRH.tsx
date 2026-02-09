import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Move constants to a better place later, but for now keeping them near (copy-paste from original)
const DEPARTAMENTOS = [
    { value: "Financeiro", label: "Financeiro" },
    { value: "Marketing", label: "Marketing" },
    { value: "Comercial", label: "Comercial" },
    { value: "Logística", label: "Logística" },
    { value: "Jurídico", label: "Jurídico" },
    { value: "TI", label: "Tech Digital" },
    { value: "RH", label: "Recursos Humanos" },
];

const REGIOES_COMERCIAL = [
    { value: "Norte/Nordeste", label: "Norte/Nordeste" },
    { value: "Sul", label: "Sul" },
    { value: "Sudeste", label: "Sudeste" },
    { value: "Centro", label: "Centro" },
    { value: "Inside Sales", label: "Inside Sales" },
];

interface StepRHProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    isReadOnly: boolean;
}

export function StepRH({ form, isReadOnly }: StepRHProps) {
    return (
        <Card>
            <CardHeader className="bg-rose-gold/10 dark:bg-rose-gold/20 rounded-t-lg border-b border-rose-gold/10">
                <CardTitle>Dados do Colaborador (RH)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="nome_completo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    1. Nome completo <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Insira o nome completo" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="nome_exibicao"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    2. Nome Exibição <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Como o colaborador será chamado" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>2.1 CPF</FormLabel>
                                <FormControl>
                                    <Input placeholder="000.000.000-00" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email_gestor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email do Gestor (para notificação)</FormLabel>
                                <FormControl>
                                    <Input placeholder="gestor@empresa.com.br" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="data_admissao"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Admissão</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="data_inicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Início</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="cargo_funcao"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    3. Cargo <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Analista de RH" {...field} disabled={isReadOnly} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="setor_departamento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>4. Setor <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2" disabled={isReadOnly}>
                                        {DEPARTAMENTOS.map(d => (
                                            <div key={d.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={d.value} id={d.value} disabled={isReadOnly} />
                                                <Label htmlFor={d.value}>{d.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch("setor_departamento") === "Comercial" && (
                    <FormField
                        control={form.control}
                        name="regiao_comercial"
                        render={({ field }) => (
                            <FormItem className="animate-in slide-in-from-left-2 fade-in duration-300">
                                <FormLabel>4.1 Região Comercial <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-2" disabled={isReadOnly}>
                                        {REGIOES_COMERCIAL.map(r => (
                                            <div key={r.value} className="flex items-center space-x-2">
                                                <RadioGroupItem value={r.value} id={`regiao-${r.value}`} disabled={isReadOnly} />
                                                <Label htmlFor={`regiao-${r.value}`}>{r.label}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </CardContent>
        </Card>
    );
}
