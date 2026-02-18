import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, FileCheck, Sparkles, Upload, FileText, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Controller } from "react-hook-form";
import { ContractAIWizard } from "./components/ContractAIWizard";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function LegalContractCreatePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors }, watch, setValue, control } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // AI Dialog State
    const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("servicos");
    const [contractType, setContractType] = useState<'new' | 'legacy'>('new');

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const createContract = useMutation({
        mutationFn: async (data: any) => {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("Não autenticado");

            let fileUrl = null;

            // Upload File if selected
            if (selectedFile) {
                // ... (keep existing upload logic)
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('legal_contracts')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    console.error("Upload Error:", uploadError);
                    throw new Error("Erro ao fazer upload do arquivo.");
                }

                const { data: publicUrlData } = supabase.storage
                    .from('legal_contracts')
                    .getPublicUrl(filePath);

                fileUrl = publicUrlData.publicUrl;
            } else if (contractType === 'legacy') {
                throw new Error("Para contratos legados/arquivados, o upload do arquivo é obrigatório.");
            }

            const { error } = await supabase.from('legal_contracts').insert({
                title: data.title,
                description: data.description,
                sap_request_id: data.sap_request_id,
                value: data.value || null,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
                requester_id: user.id,
                responsible_legal_id: user.id,
                status: contractType === 'legacy' ? 'active' : (data.initial_status || 'requested'),
                current_version_url: fileUrl,
                file_url: fileUrl,
                renewal_alert_days: data.renewal_alert_days ? parseInt(data.renewal_alert_days) : 60,
                contractor_name: data.contractor_name,
                contractor_cnpj: data.contractor_cnpj,
                contractor_address: data.contractor_address
            } as any);

            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(contractType === 'legacy' ? "Contrato arquivado com sucesso!" : "Contrato criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
            navigate("/crm/juridico");
        },
        onError: (error) => toast.error(`Erro ao criar contrato: ${error.message}`)
    });

    const onSubmit = (data: any) => {
        setIsSubmitting(true);
        createContract.mutate(data);
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in max-w-3xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/crm/juridico")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif text-gray-900">
                        {contractType === 'new' ? "Novo Contrato (Fluxo)" : "Arquivar Contrato"}
                    </h1>
                    <p className="text-muted-foreground">
                        {contractType === 'new' ? "Inicie um novo ciclo de vida contratual." : "Armazene contratos já assinados e vigentes."}
                    </p>
                </div>
            </div>

            <Tabs value={contractType} onValueChange={(v) => setContractType(v as 'new' | 'legacy')} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new">Novo Processo (Fluxo Completo)</TabsTrigger>
                    <TabsTrigger value="legacy">Já Assinado (Apenas Arquivo)</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Contrato</CardTitle>
                    <CardDescription>
                        {contractType === 'new'
                            ? "O contrato será criado como Rascunho para análise."
                            : "O contrato será salvo imediatamente como 'Vigente/Ativo'."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título do Contrato *</Label>
                            <Input id="title" placeholder="Ex: Contrato de Prestação de Serviços - Fornecedor X" {...register("title", { required: true })} />
                            {errors.title && <span className="text-xs text-red-500">Campo obrigatório</span>}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Objeto do Contrato (Serviços ou Produtos) *</Label>

                                {contractType === 'new' && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        onClick={() => setIsAIDialogOpen(true)}
                                    >
                                        <Sparkles className="h-3 w-3" />
                                        Gerar com IA
                                    </Button>
                                )}
                            </div>

                            {/* Contract Editor Container */}
                            <div className="relative border rounded-lg bg-white shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                                {/* Contract Header / Logo */}
                                <div className="bg-white border-b p-6 flex justify-center items-center">
                                    <img
                                        src="/medbeauty/LOGO_-1.png.webp"
                                        alt="MedBeauty Logo"
                                        className="h-12 object-contain brightness-0"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = '<h2 class="text-2xl font-serif text-slate-900 tracking-wide uppercase">MedBeauty</h2>';
                                        }}
                                    />
                                </div>

                                <Textarea
                                    id="description"
                                    placeholder="Descreva o objetivo do contrato..."
                                    className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed p-8 border-0 focus-visible:ring-0 resize-y rounded-none"
                                    {...register("description", { required: "Objeto é obrigatório" })}
                                />
                            </div>
                            {errors.description && <span className="text-xs text-red-500">{errors.description.message as string}</span>}
                        </div>




                        <div className="grid gap-4 p-4 border rounded-lg bg-slate-50">
                            <h3 className="font-semibold text-slate-900">
                                Dados da Contratada / Fornecedor
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="contractor_cnpj">CNPJ</Label>
                                    <div className="relative">
                                        <Input
                                            id="contractor_cnpj"
                                            placeholder="00.000.000/0000-00"
                                            maxLength={18}
                                            {...register("contractor_cnpj", { required: "CNPJ é obrigatório" })}
                                            onBlur={async (e) => {
                                                const cnpj = e.target.value.replace(/\D/g, '');
                                                if (cnpj.length === 14) {
                                                    try {
                                                        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
                                                        if (response.ok) {
                                                            const data = await response.json();
                                                            setValue("contractor_name", data.razao_social);
                                                            setValue("contractor_address", `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio}/${data.uf}`);
                                                            toast.success("Dados da empresa carregados!");
                                                        }
                                                    } catch (error) {
                                                        console.error(error);
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="contractor_name">Razão Social / Nome</Label>
                                    <Input id="contractor_name" placeholder="Nome da Empresa" {...register("contractor_name", { required: "Razão Social é obrigatória" })} />
                                    {errors.contractor_name && <span className="text-xs text-red-500 mt-1">{errors.contractor_name.message as string}</span>}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contractor_address">Endereço Completo</Label>
                                <Input id="contractor_address" placeholder="Rua, Número, Bairro, Cidade/UF" {...register("contractor_address", { required: "Endereço é obrigatório" })} />
                                {errors.contractor_address && <span className="text-xs text-red-500 mt-1">{errors.contractor_address.message as string}</span>}
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sap_id">ID da Requisição SAP</Label>
                                <Input id="sap_id" placeholder="Ex: REQ-123456" {...register("sap_request_id")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor Total (Estimado)</Label>
                                <Controller
                                    name="value"
                                    control={control}
                                    rules={{ required: "Valor é obrigatório" }}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-1">
                                            <CurrencyInput
                                                id="value"
                                                placeholder="R$ 0,00"
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                            {errors.value && <span className="text-xs text-red-500">{errors.value.message as string}</span>}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Data de Início *</Label>
                                <Input id="start_date" type="date" {...register("start_date", { required: "Data de início é obrigatória" })} />
                                {errors.start_date && <span className="text-xs text-red-500">{errors.start_date.message as string}</span>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Data de Término *</Label>
                                <Input id="end_date" type="date" {...register("end_date", { required: "Data de término é obrigatória" })} />
                                {errors.end_date && <span className="text-xs text-red-500">{errors.end_date.message as string}</span>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="renewal_days">Aviso Vencimento (Dias)</Label>
                                <Input id="renewal_days" type="number" defaultValue={60} {...register("renewal_alert_days")} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status Inicial</Label>
                            <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register("initial_status")}>
                                <option value="draft">Rascunho</option>
                                <option value="legal_review">Em Análise</option>
                                <option value="active">Vigente</option>
                            </select>
                        </div>

                        <Card className="border-dashed border-2 bg-slate-50/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-slate-600" />
                                    Documento do Contrato
                                </CardTitle>
                                <CardDescription>
                                    {contractType === 'legacy'
                                        ? "Obrigatório: Anexe o contrato assinado."
                                        : "Opcional: Anexe a minuta se já existir."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-4 bg-white border rounded-lg border-slate-200">
                                    <div className="flex-1">
                                        <Input
                                            id="file_upload"
                                            type="file"
                                            accept=".pdf,.docx,.doc"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="cursor-pointer border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
                                        />
                                    </div>
                                    {selectedFile ? (
                                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-medium">
                                            <Check className="h-3 w-3" />
                                            Selecionado
                                        </div>
                                    ) : (
                                        <FileUp className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/crm/juridico")}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting || createContract.isPending} className="gap-2 bg-slate-900 hover:bg-slate-800">
                                <FileCheck className="h-4 w-4" />
                                Criar Contrato
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <ContractAIWizard
                open={isAIDialogOpen}
                onOpenChange={setIsAIDialogOpen}
                onGenerate={(text) => {
                    setValue("description", text);
                    setIsAIDialogOpen(false);

                    // Focus logic moved here for better reliability
                    setTimeout(() => {
                        const textarea = document.getElementById('description');
                        if (textarea) {
                            textarea.focus();
                            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 300);
                }}
            />
        </div>
    );
}
