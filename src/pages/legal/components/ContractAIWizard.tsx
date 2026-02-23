import { useState, useEffect, useMemo } from "react";
import { Sparkles, Check, ArrowRight, ArrowLeft, Loader2, RefreshCw, Maximize2, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ContractAIWizardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (text: string) => void;
    initialData?: any;
}

interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    category: string;
}

export function ContractAIWizard({ open, onOpenChange, onGenerate, initialData }: ContractAIWizardProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [content, setContent] = useState("");
    const [isFreeEditMode, setIsFreeEditMode] = useState(false);

    // Dynamic Form State
    const [formFields, setFormFields] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    // Fetch Templates
    const { data: templates, isLoading: isLoadingTemplates } = useQuery({
        queryKey: ['contract-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contract_templates')
                .select('*')
                .eq('active', true)
                .order('name');
            if (error) throw error;
            return data as ContractTemplate[];
        }
    });

    // Handle Template Selection
    useEffect(() => {
        if (templates && templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [templates]);

    // Initialize content and reset states when template changes
    useEffect(() => {
        if (!selectedTemplateId || !templates) return;
        const template = templates.find(t => t.id === selectedTemplateId);
        if (template) {
            setContent(template.content);
            // Reset form states to allow re-parsing of new variables
            setFormFields([]);
            setFormValues({});
            setIsFreeEditMode(false);
        }
    }, [selectedTemplateId, templates]);

    // Parse Variables when content changes (and not in edit mode)
    useEffect(() => {
        if (isFreeEditMode) return;

        // Extract variables {{VAR_NAME}} or [VAR_NAME]
        const matches = content.match(/({{.*?}}|\[.*?\])/g) || [];
        // Remove braces and deduplicate
        const uniqueVars = [...new Set(matches.map(m => m.replace(/{{|}}|\[|\]/g, '')))];

        setFormFields(uniqueVars);

        // Initialize values (preserve existing if possible)
        const newValues: Record<string, string> = { ...formValues };

        uniqueVars.forEach(v => {
            if (!newValues[v]) {
                const lowerV = v.toLowerCase();
                // Auto-fill from initialData
                if (initialData) {
                    // CONTRATANTE (Skinstore)
                    if (lowerV.includes('contratante')) {
                        if (lowerV.includes('nome') || v === 'CONTRATANTE') newValues[v] = "SKINSTORE S.A.";
                        else if (lowerV.includes('cnpj') || lowerV.includes('doc') || lowerV.includes('cpf')) newValues[v] = "12.979.552/0001-72";
                        else if (lowerV.includes('endereco') || lowerV.includes('end')) newValues[v] = "Rua Gomes de Carvalho, 1356, Vila Olímpia, São Paulo/SP";
                        else if (lowerV.includes('represent')) newValues[v] = "Representante Legal";
                    }
                    // CONTRATADO (Vendor)
                    else if ((lowerV.includes('nome') && lowerV.includes('contratado')) || v === 'CONTRATADO' || v === 'CONTRATADO N' || v === '[CONTRATADO N]') {
                        newValues[v] = initialData.party_name || "";
                    } else if (lowerV.includes('contratado') && (lowerV.includes('cnpj') || lowerV.includes('cpf') || lowerV.includes('doc') || v.includes(' i '))) { // ' i ' matches 'CONTRATADO I'
                        newValues[v] = initialData.party_document || "";
                    } else if (lowerV.includes('contratado') && (lowerV.includes('endereco') || lowerV.includes('end') || v.includes(' ende'))) {
                        newValues[v] = initialData.party_address || "";
                    } else if (lowerV.includes('contratado') && lowerV.includes('represent')) {
                        newValues[v] = "Representante Legal";
                    } else if (v === 'Contratado_cnpj' || v === '[Contratado_cnpj]') {
                        newValues[v] = initialData.party_document || "";
                    }
                    // Generic Dates/Values
                    else if (lowerV.includes('data') && lowerV.includes('inicio')) {
                        newValues[v] = initialData.start_date ? new Date(initialData.start_date).toLocaleDateString('pt-BR') : "";
                    } else if (lowerV.includes('valor')) {
                        newValues[v] = initialData.value ? initialData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "";
                    }
                }

                if (!newValues[v]) newValues[v] = "";
            }
        });
        setFormValues(newValues);

    }, [content, isFreeEditMode, initialData]);

    const getSelectedTemplate = () => templates?.find(t => t.id === selectedTemplateId);

    // CNPJ Helper
    const fetchCNPJ = async (cnpj: string, fieldName: string) => {
        const cleanCNPJ = cnpj.replace(/\D/g, '');
        if (cleanCNPJ.length !== 14) return;

        const toastId = toast.loading("Buscando dados do CNPJ...");
        try {
            const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
            if (!response.ok) throw new Error('CNPJ não encontrado');

            const data = await response.json();
            const address = `${data.descricao_tipo_de_logradouro} ${data.logradouro}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ''} - ${data.bairro}, ${data.municipio}/${data.uf}`;

            const entityPrefix = fieldName.split('_')[0];
            const updates: Record<string, string> = {};

            const nameField = formFields.find(f => f.includes(entityPrefix) && (f.includes("NOME") || f.includes("RAZAO") || f.includes("SOCIAL")));
            if (nameField) updates[nameField] = data.razao_social;

            const addressField = formFields.find(f => f.includes(entityPrefix) && (f.includes("ENDERECO") || f.includes("LOGRADOURO")));
            if (addressField) updates[addressField] = address;

            if (Object.keys(updates).length > 0) {
                setFormValues(prev => ({ ...prev, ...updates }));
                toast.success("Dados preenchidos automaticamente!", { id: toastId });
            } else {
                toast.dismiss(toastId);
            }

        } catch (error) {
            toast.error("Erro ao buscar CNPJ.", { id: toastId });
            console.error(error);
        }
    };

    // Real-time Preview Generation
    const previewContent = useMemo(() => {
        if (!content) return "";

        // Regex to match {{VARIABLE}} OR [VARIABLE]
        const parts = content.split(/({{.*?}}|\[.*?\])/g);

        return parts.map((part, index) => {
            const isDoubleCurly = part.startsWith('{{') && part.endsWith('}}');
            const isSquareBracket = part.startsWith('[') && part.endsWith(']');

            if (isDoubleCurly || isSquareBracket) {
                const varName = part.replace(/{{|}}|\[|\]/g, '');
                const value = formValues[varName] || "";
                const isCNPJ = varName.includes("CNPJ") || varName.includes("DOC") || varName.includes("CPF");

                return (
                    <span key={index} className="inline-block mx-0.5 relative">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setFormValues(prev => ({ ...prev, [varName]: e.target.value }))}
                            onBlur={isCNPJ ? (e) => fetchCNPJ(e.target.value, varName) : undefined}
                            placeholder={varName.replace(/_/g, ' ')}
                            className={cn(
                                "min-w-[80px] px-1 py-0.5 rounded border-b-2 outline-none transition-all text-center font-bold bg-transparent placeholder:normal-case placeholder:font-normal placeholder:opacity-50",
                                value
                                    ? "border-green-500 text-green-700 bg-green-50/50"
                                    : "border-yellow-400 text-slate-500 bg-yellow-50/50 placeholder:text-yellow-600/50"
                            )}
                            style={{ width: `${Math.max(value.length, varName.length, 10) + 2}ch` }}
                        />
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    }, [content, formValues]);

    const handleConfirm = () => {
        const template = getSelectedTemplate();
        if (!template) return;

        let content = template.content;
        Object.entries(formValues).forEach(([key, value]) => {
            const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Regex to match {{key}} or [key]
            const regex = new RegExp(`({{|\\[)${escapedKey}(}}|\\])`, 'g');

            let shouldPreserve = false;

            // Check if this variable matches a System Value (Dynamic Link)
            // If the user hasn't changed the value from the system default, we preserve the tag {{TAG}}.
            // This allows the contract text to update automatically if the system data changes later.
            if (initialData && value) {
                const lowerV = key.toLowerCase();
                let systemValue = "";

                // CONTRATANTE (Hardcoded checks)
                if (lowerV.includes('contratante')) {
                    // We generally hardcode contratante, but maybe we want to keep tags? 
                    // Let's replace contratante mostly as it doesn't change often per contract request.
                    // But strictly speaking, if we want dynamic, we should preserve. 
                    // But we don't have "Client Data" in initialData usually? 
                    // We hardcoded it in useEffect. So let's NOT preserve it unless we have a source.
                }
                // CONTRATADO
                else if ((lowerV.includes('nome') && lowerV.includes('contratado')) || key === 'CONTRATADO' || key === 'CONTRATADO N' || key === '[CONTRATADO N]') {
                    systemValue = initialData.party_name || "";
                } else if (lowerV.includes('contratado') && (lowerV.includes('cnpj') || lowerV.includes('cpf') || lowerV.includes('doc') || key.includes(' i '))) {
                    systemValue = initialData.party_document || "";
                } else if (lowerV.includes('contratado') && (lowerV.includes('endereco') || lowerV.includes('end') || key.includes(' ende'))) {
                    systemValue = initialData.party_address || "";
                } else if (lowerV.includes('contratado') && lowerV.includes('represent')) {
                    systemValue = "Representante Legal";
                } else if (key === 'Contratado_cnpj' || key === '[Contratado_cnpj]') {
                    systemValue = initialData.party_document || "";
                }
                // Generic Dates/Values
                else if (lowerV.includes('data') && lowerV.includes('inicio')) {
                    systemValue = initialData.start_date ? new Date(initialData.start_date).toLocaleDateString('pt-BR') : "";
                } else if (lowerV.includes('valor')) {
                    systemValue = initialData.value ? initialData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "";
                }

                // If the form value matches the system value, PRESERVE the tag.
                if (systemValue && value === systemValue) {
                    shouldPreserve = true;
                }
            }

            if (!shouldPreserve) {
                content = content.replace(regex, value || "");
            }
        });

        onGenerate(content);
        toast.success("Contrato gerado!");
        onOpenChange(false);
    };

    const handleExitEditMode = () => {
        // Auto-convert brackets [TEXT] to {{TEXT}}
        const newContent = content.replace(/\[([^\]]+)\]/g, '{{$1}}');
        if (newContent !== content) {
            setContent(newContent);
            toast.success("Campos entre colchetes convertidos para variáveis!");
        }
        setIsFreeEditMode(false);
    };

    // Calculate progress
    const totalFields = formFields.length;
    const filledFields = formFields.filter(f => !!formValues[f]).length;
    const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 overflow-hidden bg-slate-50">
                <DialogHeader className="p-4 bg-white border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">Novo Contrato</DialogTitle>
                                <DialogDescription>
                                    {isFreeEditMode
                                        ? "Edite o texto do contrato livremente. Use {{VAR}} ou [VAR] para criar novos campos."
                                        : "Preencha os campos destacados diretamente no documento."}
                                </DialogDescription>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                <Button
                                    variant={isFreeEditMode ? "ghost" : "white"}
                                    size="sm"
                                    onClick={handleExitEditMode}
                                    className={cn("text-xs", !isFreeEditMode && "shadow-sm")}
                                >
                                    Preencher
                                </Button>
                                <Button
                                    variant={isFreeEditMode ? "white" : "ghost"}
                                    size="sm"
                                    onClick={() => setIsFreeEditMode(true)}
                                    className={cn("text-xs", isFreeEditMode && "shadow-sm")}
                                >
                                    Editar Texto
                                </Button>
                            </div>

                            <div className="w-[300px]">
                                {isLoadingTemplates ? (
                                    <div className="text-sm text-muted-foreground">Carregando modelos...</div>
                                ) : (
                                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Selecione um Modelo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {templates?.map(t => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content - Full Width Document */}
                <div className="flex-1 overflow-hidden relative flex justify-center">
                    <ScrollArea className="h-full w-full max-w-5xl">
                        <div className="p-8 md:p-12 pb-32"> {/* Extra padding bottom for footer */}
                            <div className="bg-white shadow-sm border min-h-[1000px] p-12 md:p-16">
                                {/* Contract Logo */}
                                <div className="flex justify-center mb-8">
                                    <img
                                        src="/skinstore-logo.png"
                                        alt="SKINSTORE S.A."
                                        className="h-32 object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement!.innerHTML = '<h2 class="text-2xl font-serif text-slate-900 tracking-wide uppercase">SKINSTORE S.A.</h2>';
                                        }}
                                    />
                                </div>

                                {isFreeEditMode ? (
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-[800px] font-serif text-lg leading-relaxed border-none focus-visible:ring-0 resize-none p-0"
                                        placeholder="Digite o contrato aqui..."
                                    />
                                ) : (
                                    <div className="font-serif text-slate-800 leading-relaxed whitespace-pre-wrap text-lg">
                                        {selectedTemplateId ? previewContent : (
                                            <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 gap-4">
                                                <FileText className="h-20 w-20 opacity-20" />
                                                <p className="text-lg">Selecione um modelo acima para começar</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer Bar */}
                <div className="p-4 bg-white border-t flex items-center justify-between shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground font-medium">Progresso:</span>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <span className={cn("font-bold", filledFields === totalFields ? "text-green-600" : "text-slate-600")}>
                                {filledFields} de {totalFields} campos
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={!selectedTemplateId}
                            className={cn(
                                "gap-2 transition-all",
                                filledFields === totalFields ? "bg-green-600 hover:bg-green-700" : ""
                            )}
                        >
                            <Check className="h-4 w-4" />
                            {filledFields === totalFields ? "Finalizar e Gerar" : "Gerar Contrato"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
