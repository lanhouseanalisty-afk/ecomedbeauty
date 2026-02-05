import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Package } from "lucide-react";
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

const formSchema = z.object({
    event_name: z.string().min(3, "Nome do evento é obrigatório"),
    consultant_name: z.string().min(3, "Nome do consultor é obrigatório"),
    regional_manager: z.string().min(1, "Selecione o gerente regional"),
    event_date: z.string().min(1, "Data do evento é obrigatória"),
    kit_type: z.string().min(1, "Selecione o tipo de KIT"),
    has_thread_order: z.boolean(),
    bonus_order_number: z.string().optional(),
    cep: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    neighborhood: z.string().min(3, "Bairro é obrigatório"),
    city: z.string().min(3, "Cidade é obrigatória"),
    state: z.string().length(2, "UF deve ter 2 caracteres"),
    extra_materials: z.string().optional(),
}).refine((data) => {
    if (data.has_thread_order && !data.bonus_order_number) {
        return false;
    }
    return true;
}, {
    message: "Número do pedido de bonificação é obrigatório quando acompanha pedido de fios",
    path: ["bonus_order_number"],
});

export function MarketingRequestForm() {
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
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            extra_materials: "",
        },
    });

    const hasThreadOrder = form.watch("has_thread_order");

    const handleCepBlur = async () => {
        const cep = form.getValues("cep");
        if (cep && cep.length >= 8) {
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
            // @ts-ignore
            const result = await createRequest(values);

            if (result.success) {
                alert(`✅ Solicitação enviada com sucesso!\n\nID: ${result.requestId}\n\n(A Logística já pode visualizar seu pedido)`);
                window.location.reload();
            }
        } catch (error) {
            console.error('Error in onSubmit:', error);
            alert('❌ Erro ao enviar solicitação');
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto bg-slate-900 border-slate-800">
            <CardHeader className="border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl text-white">
                            Solicitação de Insumos e Materiais de Marketing para Eventos
                        </CardTitle>
                        <p className="text-sm text-slate-400 mt-1">
                            Preencha os dados do evento para solicitação da Gerência Regional
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 notranslate" translate="no">
                        {/* Dados do Evento & Solicitante */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                                Dados do Evento & Solicitante
                            </h3>

                            <FormField
                                control={form.control}
                                name="event_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Nome do Evento / Workshop</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: Workshop Harmonização Facial - SP"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
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
                                        <FormLabel className="text-slate-300">Consultor/GR Solicitante</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Seu nome completo"
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="regional_manager"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Gerente Regional Responsável/YT</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <option value="">Selecione...</option>
                                                    <option value="Jaqueline">Jaqueline</option>
                                                    <option value="Laice">Laice</option>
                                                    <option value="Milena">Milena</option>
                                                    <option value="Thiago">Thiago</option>
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
                                            <FormLabel className="text-slate-300">Data do Treinamento/Evento</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="kit_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Tipo de KIT</FormLabel>
                                        <select
                                            {...field}
                                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="workshop">Workshop</option>
                                            <option value="evento">Evento</option>
                                            <option value="treinamento">Treinamento</option>
                                        </select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Regras de Negócio */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                                Regras de Negócio
                            </h3>

                            <FormField
                                control={form.control}
                                name="has_thread_order"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel className="text-slate-300">Acompanha pedido de fios?</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(value) => field.onChange(value === "true")}
                                                defaultValue={field.value ? "true" : "false"}
                                                className="flex gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="false" id="no" className="border-slate-600 text-purple-600" />
                                                    <label htmlFor="no" className="text-slate-300 cursor-pointer">Não</label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="true" id="yes" className="border-slate-600 text-purple-600" />
                                                    <label htmlFor="yes" className="text-slate-300 cursor-pointer">Sim</label>
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
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Nº Pedido Bonificação</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="Digite o número do pedido"
                                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Local de Entrega */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                                Local de Entrega
                            </h3>

                            <FormField
                                control={form.control}
                                name="cep"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">CEP (Preenchimento Automático)</FormLabel>
                                        <div className="relative">
                                            <FormControl>
                                                <Input
                                                    placeholder="00000-000"
                                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                                                    {...field}
                                                    onBlur={(e) => {
                                                        field.onBlur();
                                                        handleCepBlur();
                                                    }}
                                                    maxLength={9}
                                                />
                                            </FormControl>
                                            {loadingCep && (
                                                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-purple-600" />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="street"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-slate-300">Rua/Av</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Número</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="neighborhood"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-300">Bairro</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-slate-300">Cidade</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="bg-slate-800 border-slate-700 text-white"
                                                    {...field}
                                                />
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
                                            <FormLabel className="text-slate-300">UF</FormLabel>
                                            <FormControl>
                                                <select
                                                    {...field}
                                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

                        {/* Extras */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                                Extras
                            </h3>

                            <FormField
                                control={form.control}
                                name="extra_materials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Materiais/Insumos Extras</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Liste itens adicionais de necessário..."
                                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 text-lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                "Gerar Solicitação (ID Único)"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
