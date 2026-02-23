import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Package, MapPin, ClipboardList, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarketingRequest } from "@/hooks/useMarketingRequest";
import { fetchAddressByCep } from "@/services/cepService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    event_name: z.string().min(3, "Nome do evento é obrigatório"),
    consultant_name: z.string().min(3, "Nome do requisitante é obrigatório"),
    regional_manager: z.string().min(1, "Selecione o responsável"),
    event_date: z.string().min(1, "Data é obrigatória"),
    kit_type: z.string().min(1, "Selecione o tipo"),
    has_thread_order: z.boolean(),
    bonus_order_number: z.string().optional(),
    cep: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(3, "Bairro é obrigatório"),
    city: z.string().min(3, "Cidade é obrigatória"),
    state: z.string().length(2, "UF deve ter 2 caracteres"),
    extra_materials: z.string().optional(),
    sector: z.string().optional(),
}).refine((data) => {
    if (data.has_thread_order && !data.bonus_order_number) {
        return false;
    }
    return true;
}, {
    message: "Número do pedido de bonificação é obrigatório quando acompanha pedido de fios",
    path: ["bonus_order_number"],
});

interface UnifiedSupplyRequestFormProps {
    sector: string;
    sectorLabel: string;
    onSuccess?: () => void;
}

export function UnifiedSupplyRequestForm({ sector, sectorLabel, onSuccess }: UnifiedSupplyRequestFormProps) {
    const { createRequest, loading } = useMarketingRequest();
    const [loadingCep, setLoadingCep] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            event_name: "",
            consultant_name: "",
            regional_manager: "",
            event_date: "",
            kit_type: "",
            has_thread_order: false,
            bonus_order_number: "",
            cep: "",
            street: "",
            neighborhood: "",
            city: "",
            state: "",
            number: "",
            extra_materials: "",
            sector: sector,
        },
    });

    const hasThreadOrder = form.watch("has_thread_order");

    const handleCepBlur = async () => {
        const cep = form.getValues("cep");
        if (cep && cep.replace(/\D/g, '').length >= 8) {
            setLoadingCep(true);
            const address = await fetchAddressByCep(cep);
            setLoadingCep(false);

            if (address) {
                form.setValue("street", address.logradouro, { shouldValidate: true });
                form.setValue("neighborhood", address.bairro, { shouldValidate: true });
                form.setValue("city", address.localidade, { shouldValidate: true });
                form.setValue("state", address.uf, { shouldValidate: true });
                toast.success("Endereço encontrado!");
            } else {
                toast.error("CEP não encontrado");
            }
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const result = await createRequest({ ...values, sector });

            if (result.success) {
                toast.success(`✅ Solicitação enviada com sucesso!\nID: ${result.requestId}`);
                form.reset();
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error('Error in onSubmit:', error);
            toast.error('❌ Erro ao enviar solicitação');
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl border-rose-gold/20">
            <CardHeader className="border-b bg-rose-gold/5 pb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-xl shadow-soft">
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-serif tracking-tight text-foreground">
                            Solicitação de Insumos & Materiais
                        </CardTitle>
                        <p className="text-muted-foreground mt-2 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Pedido para o setor: <span className="text-primary font-bold uppercase">{sectorLabel}</span>
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                        {/* Seção 1: Dados Basilares */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-lg border-l-4 border-primary pl-4 py-1">
                                <ClipboardList className="h-5 w-5 text-primary" />
                                <h3>Dados Gerais da Solicitação</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="event_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Finalidade / Nome do Evento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Workshop, Reunião, Uso Interno..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="consultant_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Solicitante</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Nome completo do colaborador"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="regional_manager"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gestor Responsável</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="Marcelo Ravagnani">Marcelo Ravagnani</option>
                                                    <option value="Jaqueline">Jaqueline</option>
                                                    <option value="Laice">Laice</option>
                                                    <option value="Milena">Milena</option>
                                                    <option value="Thiago">Thiago</option>
                                                    <option value="Diretoria">Diretoria</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="event_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data Necessária</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="kit_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo de Demanda</FormLabel>
                                            <select
                                                {...field}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option value="">Selecione...</option>
                                                <option value="comun">Insumos Comuns</option>
                                                <option value="workshop">Workshop / Treinamento</option>
                                                <option value="evento">Evento Externo</option>
                                                <option value="escritorio">Material de Escritório</option>
                                            </select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Seção 2: Local de Entrega */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-lg border-l-4 border-primary pl-4 py-1">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h3>Logística de Entrega</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="cep"
                                render={({ field }) => (
                                    <FormItem className="max-w-xs">
                                        <FormLabel>CEP</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    placeholder="00000-000"
                                                    {...field}
                                                    onBlur={(e) => {
                                                        field.onBlur();
                                                        handleCepBlur();
                                                    }}
                                                    maxLength={9}
                                                />
                                            </FormControl>
                                            {loadingCep && (
                                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-8">
                                            <FormLabel>Endereço Completo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-4">
                                            <FormLabel>Número</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="neighborhood"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bairro</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cidade</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>UF / Estado</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">UF</option>
                                                    {["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"].map((uf) => (
                                                        <option key={uf} value={uf}>{uf}</option>
                                                    ))}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Seção 3: Detalhes do Pedido */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 font-semibold text-lg border-l-4 border-primary pl-4 py-1">
                                <Package className="h-5 w-5 text-primary" />
                                <h3>Itens e Observações</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="extra_materials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lista de Materiais & Insumos</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Liste aqui todos os itens necessários, quantidades e tamanhos..."
                                                className="min-h-[150px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4">
                                <FormField
                                    control={form.control}
                                    name="has_thread_order"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Este pedido possui bonificação de fios vinculada ao SAP?</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => field.onChange(value === "true")}
                                                    defaultValue={field.value ? "true" : "false"}
                                                    className="flex gap-8"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="false" id="no" />
                                                        <label htmlFor="no" className="font-medium cursor-pointer">Não</label>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <RadioGroupItem value="true" id="yes" />
                                                        <label htmlFor="yes" className="font-medium cursor-pointer">Sim</label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {hasThreadOrder && (
                                    <FormField
                                        control={form.control}
                                        name="bonus_order_number"
                                        render={({ field }) => (
                                            <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <FormLabel className="text-primary font-semibold">Nº Pedido Bonificação/SAP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="Digite o número do pedido SAP"
                                                        className="border-primary/50 focus:border-primary"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-bold py-8 text-xl shadow-soft transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                    Gerando Protocolo...
                                </>
                            ) : (
                                "ENVIAR PARA APROVAÇÃO (MARKETING)"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
