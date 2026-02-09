import type { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EQUIPAMENTOS_OPTIONS = [
    { value: "Notebook", label: "Notebook" },
    { value: "Desktop", label: "Desktop" },
    { value: "Tablet", label: "Tablet" },
    { value: "Celular", label: "Celular" },
    { value: "Carro Corporativo", label: "Carro Corporativo (Frota)" },
    { value: "HeadSet", label: "HeadSet" },
    { value: "Mouse", label: "Mouse" },
];

const SOFTWARES_OPTIONS = ["Office 365", "SAP B1", "Salesforce", "PowerBI", "Adobe Creative Cloud"];


interface StepGestorProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    isReadOnly: boolean;
}

export function StepGestor({ form, isReadOnly }: StepGestorProps) {
    return (
        <Card>
            <CardHeader className="bg-rose-gold/10 dark:bg-rose-gold/20 rounded-t-lg border-b border-rose-gold/10">
                <CardTitle>Definições do Gestor</CardTitle>
                <CardDescription>Defina os recursos e acessos necessários para o colaborador.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="tipo_vaga"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo da Vaga</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger disabled={isReadOnly}>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Substituição">Substituição</SelectItem>
                                        <SelectItem value="Aumento de Quadro">Aumento de Quadro</SelectItem>
                                        <SelectItem value="Novo Cargo">Novo Cargo</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="buddy_mentor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Buddy/Mentor Responsável</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nome do mentor" {...field} readOnly={isReadOnly} />
                                </FormControl>
                                <FormDescription>Colaborador que acompanhará a adaptação</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <FormLabel className="text-base font-semibold">Equipamentos e Softwares</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 border rounded-lg bg-gray-50/50 dark:bg-zinc-900/50">
                        <FormField
                            control={form.control}
                            name="equipamentos_necessarios"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="font-semibold text-rose-gold-dark">Equipamentos Físicos</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {EQUIPAMENTOS_OPTIONS.map((item) => (
                                            <FormField
                                                key={item.value}
                                                control={form.control}
                                                name="equipamentos_necessarios"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.value}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item.value)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), item.value])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: string) => value !== item.value
                                                                                )
                                                                            );
                                                                    }}
                                                                    disabled={isReadOnly}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="softwares_necessarios"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="font-semibold text-rose-gold-dark">Softwares e Licenças</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {SOFTWARES_OPTIONS.map((item) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name="softwares_necessarios"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), item])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value: string) => value !== item
                                                                                )
                                                                            );
                                                                    }}
                                                                    disabled={isReadOnly}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">
                                                                {item}
                                                            </FormLabel>
                                                        </FormItem>
                                                    );
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <FormField
                                            control={form.control}
                                            name="outros_softwares_descricao"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Outros Softwares (Especifique)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ex: Adobe Photoshop, AutoCAD..." readOnly={isReadOnly} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <FormLabel className="text-base font-semibold">Acessos e Rede</FormLabel>
                    <div className="p-4 border rounded-lg bg-gray-50/50 dark:bg-zinc-900/50 grid grid-cols-1 md:grid-cols-2 gap-6">

                        <FormField
                            control={form.control}
                            name="sharepoint_pasta"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pastas do Sharepoint/Rede</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Financeiro, Marketing, Vendas..." {...field} readOnly={isReadOnly} />
                                    </FormControl>
                                    <FormDescription>Liste as pastas que o colaborador precisa acessar.</FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="necessita_vpn"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Necessita VPN?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                            disabled={isReadOnly}
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Sim" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Sim (Trabalho Remoto/Híbrido)
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Não" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Não
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="necessita_impressora"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Acesso a Impressora?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                            disabled={isReadOnly}
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Sim" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Sim - Configurar impressoras do setor
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="Não" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Não
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="observacoes_gestor"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Observações Adicionais</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Alguma outra instrução para o RH ou TI?"
                                    className="resize-none"
                                    {...field}
                                    readOnly={isReadOnly}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
