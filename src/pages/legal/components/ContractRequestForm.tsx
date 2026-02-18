import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Check, FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function ContractRequestForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const sector = searchParams.get('sector');

    // Resolve backUrl based on sector
    const getBackUrl = () => {
        if (!sector) return "/crm/intranet/contratos";

        if (sector === 'comercial') return "/crm/comercial/contratos";

        // Handle commercial sub-departments
        if (sector.startsWith('com_')) {
            const sub = sector.replace('com_', '').replace('_', '-');
            // Exceptions if any, otherwise standard pattern: /crm/comercial/sub-name/contratos
            if (sub === 'inside-sales') return "/crm/comercial/inside-sales/contratos";
            if (sub === 'franchises') return "/crm/comercial/franquias/contratos";
            return `/crm/comercial/${sub}/contratos`;
        }

        // Standard sectors (rh, marketing, etc.)
        return `/crm/${sector}/contratos`;
    };

    const backUrl = getBackUrl();
    const isEditing = !!id;
    const queryClient = useQueryClient();
    const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedDeptId, setSelectedDeptId] = useState<string>("");

    // Fetch All Departments to assign to contract
    const { data: userDepartments } = useQuery({
        queryKey: ['all-departments-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('departments')
                .select('id, code, name')
                .order('name');
            if (error) {
                console.error("Error fetching departments:", error);
                return [];
            }
            return data || [];
        },
        enabled: !isEditing // Only fetch needed for new contracts defaults
    });

    // Set default department if user has only one or if sector is in URL
    useEffect(() => {
        if (!userDepartments || userDepartments.length === 0) return;

        // 1. Try to find department matching the sector query param
        if (sector) {
            const matchingDept = userDepartments.find(d => {
                const code = d.code?.toLowerCase();
                const search = sector.toLowerCase();

                // Exact match
                if (code === search) return true;

                // Common mappings for short codes (handling inconsistent DB codes)
                if (search === 'comercial' && code === 'com') return true;
                if (search === 'marketing' && code === 'mkt') return true;
                if (search === 'financeiro' && code === 'fin') return true;
                if ((search === 'administracao' || search === 'admin') && code === 'admin') return true;
                if (search === 'logistica' && code === 'log') return true;
                if (search === 'juridico' && code === 'jur') return true;
                if ((search === 'tech' || search === 'ti') && (code === 'tech' || code === 'ti' || code === 'technology')) return true;
                if (search === 'com_inside_sales' && (code === 'com_inside' || code === 'com_inside_sales')) return true;
                if (search === 'com_franchises' && (code === 'franquias' || code === 'com_franchises' || code === 'com_franchise')) return true;

                return false;
            });

            if (matchingDept) {
                setSelectedDeptId(matchingDept.id);
                return; // Found a specific match, stop here
            }
        }

        // 2. Fallback: Select first department only if nothing is selected yet
        if (!selectedDeptId && userDepartments.length >= 1) {
            setSelectedDeptId(userDepartments[0].id);
        }
    }, [userDepartments, sector, selectedDeptId]);

    // Fetch Contract Data if Editing
    const { data: contractData, isLoading: isLoadingContract } = useQuery({
        queryKey: ['contract-edit', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('legal_contracts')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: isEditing
    });

    // Populate form when data loads
    useEffect(() => {
        if (contractData) {
            reset({
                title: contractData.title,
                description: contractData.terms_summary,
                sap_request_id: contractData.payment_terms || contractData.sap_request_id,
                value: contractData.value,
                start_date: contractData.start_date,
                end_date: contractData.end_date,
                contractor_name: contractData.party_name,
                contractor_cnpj: contractData.party_document,
                contractor_address: contractData.party_address,
            });
        }
    }, [contractData, reset]);

    const saveContract = useMutation({
        mutationFn: async (data: any) => {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error("Não autenticado");

            let fileUrl = contractData?.document_url || null;

            if (selectedFile) {
                setIsUploading(true);
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(filePath);

                fileUrl = publicUrlData.publicUrl;
            }

            const payload: any = {
                title: data.title,
                terms_summary: data.description,
                payment_terms: data.payment_terms || data.sap_request_id || null, // Fallback for SAP ID
                value: data.value || null,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
                document_url: fileUrl,
                party_name: data.contractor_name,
                party_document: data.contractor_cnpj,
                party_address: data.contractor_address,
            };

            if (!isEditing) {
                // Insert fields
                if (!selectedDeptId) {
                    throw new Error("Por favor, selecione o departamento solicitante.");
                }
                const deptId = selectedDeptId;
                payload.responsible_id = user.id;
                if (deptId) {
                    payload.department_id = deptId;
                }
                payload.status = 'requested';
                payload.type = 'service';
                payload.contract_number = `REQ-${Math.floor(Math.random() * 10000)}`;

                const { error } = await supabase.from('legal_contracts').insert(payload);
                if (error) throw error;
            } else {
                // Update fields
                const { error } = await supabase
                    .from('legal_contracts')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            toast.success(isEditing ? "Solicitação atualizada!" : "Solicitação enviada!");
            queryClient.invalidateQueries({ queryKey: ['sector-contracts'] });
            queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            navigate(backUrl);
        },
        onError: (error) => {
            console.error("Erro ao salvar:", error);
            toast.error(`Erro ao salvar: ${error.message}`);
        },
        onSettled: () => setIsUploading(false)
    });

    const onSubmit = (data: any) => {
        saveContract.mutate(data);
    };

    if (isLoadingContract) return <div className="p-10 text-center">Carregando dados...</div>;

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in max-w-3xl">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold font-serif text-gray-900">
                        {isEditing ? "Editar Solicitação" : "Solicitar Novo Contrato"}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Upload className="h-4 w-4 text-blue-500" />
                        {isEditing ? "Atualize os dados da solicitação abaixo." : "Preencha os dados e anexe os documentos necessários abaixo."}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Solicitação</CardTitle>
                    <CardDescription>Informações básicas para confecção da minuta.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {!isEditing && userDepartments && userDepartments.length > 0 && (
                            <div className="grid gap-2">
                                <Label htmlFor="department">Departamento Solicitante *</Label>
                                <Select value={selectedDeptId} onValueChange={setSelectedDeptId} disabled={!!sector}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o departamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userDepartments.map((dept: any) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="title">Título do Contrato *</Label>
                            <Input id="title" placeholder="Ex: Contrato de Prestação de Serviços - Fornecedor X" {...register("title", { required: true })} />
                            {errors.title && <span className="text-xs text-red-500">Campo obrigatório</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Objeto / Descrição *</Label>
                            <Textarea id="description" placeholder="Descreva o objetivo do contrato, partes envolvidas e detalhes importantes." className="min-h-[100px]" {...register("description", { required: true })} />
                            {errors.description && <span className="text-xs text-red-500">Campo obrigatório</span>}
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
                                            {...register("contractor_cnpj")}
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
                                    <Input id="contractor_name" placeholder="Nome da Empresa" {...register("contractor_name")} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contractor_address">Endereço Completo</Label>
                                <Input id="contractor_address" placeholder="Rua, Número, Bairro, Cidade/UF" {...register("contractor_address")} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="sap_id">ID da Requisição SAP</Label>
                                <Input id="sap_id" placeholder="Ex: REQ-123456" {...register("sap_request_id")} />
                                <p className="text-[10px] text-muted-foreground">Vinculação com sistema financeiro</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="value">Valor Estimado</Label>
                                <Controller
                                    name="value"
                                    control={control}
                                    render={({ field }) => (
                                        <CurrencyInput
                                            id="value"
                                            placeholder="R$ 0,00"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_terms">Condições de Pagamento</Label>
                            <Input id="payment_terms" placeholder="Ex: 30 dias após emissão da NF" {...register("payment_terms")} />
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Data de Início (Prevista)</Label>
                                <Input id="start_date" type="date" {...register("start_date")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Data de Término</Label>
                                <Input id="end_date" type="date" {...register("end_date")} />
                            </div>
                        </div>

                        <Card className="border-dashed border-2 bg-slate-50/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-slate-600" />
                                    {isEditing ? "Substituir Minuta ou Documento (Opcional)" : "Anexar Minuta ou Documento (Opcional)"}
                                </CardTitle>
                                <CardDescription>
                                    {contractData?.document_url && (
                                        <span className="block mb-2 text-green-600 font-medium">
                                            Documento atual: <a href={contractData.document_url} target="_blank" rel="noopener noreferrer" className="underline">Visualizar</a>
                                        </span>
                                    )}
                                    Se deseja atualizar, selecione um novo arquivo.
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
                            <Button type="button" variant="outline" onClick={() => navigate(backUrl)}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting || saveContract.isPending || isUploading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 shadow-lg transition-all active:scale-95">
                                <Save className="h-4 w-4" />
                                {isUploading ? "Enviando..." : (isEditing ? "Salvar Alterações" : "Enviar Solicitação")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
