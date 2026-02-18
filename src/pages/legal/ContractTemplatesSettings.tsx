import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, Search, FileText, Upload, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ContractTemplate {
    id: string;
    name: string;
    description: string;
    content: string;
    category: string;
    active: boolean;
    created_at: string;
}

export default function ContractTemplatesSettings() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        content: "",
        category: "Geral"
    });

    const { data: templates, isLoading } = useQuery({
        queryKey: ['contract-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contract_templates')
                .select('*')
                .order('name');
            if (error) throw error;
            return data as ContractTemplate[];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newTemplate: typeof formData) => {
            const { error } = await supabase.from('contract_templates').insert([newTemplate]);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Modelo criado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; updates: typeof formData }) => {
            const { error } = await supabase
                .from('contract_templates')
                .update(data.updates)
                .eq('id', data.id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Modelo atualizado!");
            queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
            setIsDialogOpen(false);
            resetForm();
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('contract_templates').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Modelo excluído!");
            queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    const resetForm = () => {
        setFormData({ name: "", description: "", content: "", category: "Geral" });
        setEditingTemplate(null);
    };

    const handleEdit = (template: ContractTemplate) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            description: template.description || "",
            content: template.content,
            category: template.category || "Geral"
        });
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.content) {
            toast.error("Nome e Conteúdo são obrigatórios");
            return;
        }

        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsBulkUploading(true);
        let successCount = 0;
        let errorCount = 0;
        const toastId = toast.loading(`Iniciando importação de ${files.length} arquivos...`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            toast.loading(`Processando ${i + 1}/${files.length}: ${file.name}`, { id: toastId });

            try {
                let text = "";
                if (file.name.endsWith(".docx")) {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    text = result.value;
                } else if (file.name.endsWith(".pdf")) {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let fullText = "";
                    for (let j = 1; j <= pdf.numPages; j++) {
                        const page = await pdf.getPage(j);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(" ");
                        fullText += pageText + "\n\n";
                    }
                    text = fullText;
                } else {
                    throw new Error("Formato inválido");
                }

                // Smart Parse Logic
                let newContent = text;
                // 1. Convert underscores (_____) with preceding label
                newContent = newContent.replace(/([a-zA-ZÀ-ÿ0-9\s]+):\s*_{3,}/g, (match, label) => {
                    const cleanLabel = label.trim().toUpperCase().replace(/\s+/g, "_");
                    return `${label}: {{${cleanLabel}}}`;
                });
                // 2. Convert remaining underscores
                let count = 0;
                newContent = newContent.replace(/_{3,}/g, () => `{{CAMPO_${++count}}}`);
                // 3. Convert brackets [TEXT]
                newContent = newContent.replace(/\[([A-ZÀ-ÿ0-9_\s]+)\]/g, (match, inner) => {
                    const clean = inner.trim().toUpperCase().replace(/\s+/g, "_");
                    return `{{${clean}}}`;
                });

                const title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

                const { error } = await supabase.from('contract_templates').insert([{
                    name: title,
                    description: "Importado automaticamente",
                    content: newContent,
                    category: "Importados",
                    active: true
                }]);

                if (error) throw error;
                successCount++;

            } catch (error) {
                console.error(`Erro ao importar ${file.name}:`, error);
                errorCount++;
            }
        }

        setIsBulkUploading(false);
        toast.success(`Importação concluída! ${successCount} sucesso(s), ${errorCount} erro(s).`, { id: toastId });
        queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
        event.target.value = "";
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessingFile(true);
        const toastId = toast.loading("Processando arquivo...");

        try {
            let text = "";
            if (file.name.endsWith(".docx")) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else if (file.name.endsWith(".pdf")) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = "";

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(" ");
                    fullText += pageText + "\n\n";
                }
                text = fullText;
            } else {
                throw new Error("Formato não suportado. Use DOCX ou PDF.");
            }

            setFormData(prev => ({ ...prev, content: text }));
            toast.success("Texto importado com sucesso!", { id: toastId });
        } catch (error: any) {
            console.error(error);
            toast.error(`Erro ao ler arquivo: ${error.message}`, { id: toastId });
        } finally {
            setIsProcessingFile(false);
            // Reset file input
            event.target.value = "";
        }
    };

    // Extract variables for preview
    const detectedVariables = formData.content.match(/{{[^}]+}}/g) || [];
    const uniqueVariables = [...new Set(detectedVariables)];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold font-serif text-slate-900">Modelos de Contrato</h1>
                    <p className="text-muted-foreground">Gerencie os templates disponíveis para a criação de minutas.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="file"
                        id="bulk-upload"
                        className="hidden"
                        multiple
                        accept=".docx,.pdf"
                        onChange={handleBulkUpload}
                        disabled={isBulkUploading}
                    />
                    <Button variant="outline" onClick={() => document.getElementById('bulk-upload')?.click()} disabled={isBulkUploading} className="gap-2">
                        {isBulkUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        Importar em Massa
                    </Button>
                    <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
                        <Plus className="h-4 w-4" /> Novo Modelo
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Templates Disponíveis</CardTitle>
                    <CardDescription>Estes modelos aparecerão no assistente de criação.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Carregando...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates?.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-500" />
                                                {template.name}
                                            </div>
                                            {template.description && <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{template.category}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant={template.active ? "default" : "secondary"} className={template.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                                                {template.active ? "Ativo" : "Inativo"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => {
                                                if (confirm("Tem certeza que deseja excluir este modelo?")) {
                                                    deleteMutation.mutate(template.id);
                                                }
                                            }}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {templates?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nenhum modelo cadastrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? "Editar Modelo" : "Novo Modelo de Contrato"}</DialogTitle>
                        <DialogDescription>
                            Use <code>{"{{VARIAVEL}}"}</code> para criar campos dinâmicos no contrato.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nome do Modelo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ex: Contrato de Prestação de Serviços"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Categoria</Label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="Ex: Serviços, RH, Comercial"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Descrição Curta</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição que aparece para o usuário ao selecionar o modelo."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 h-[500px]">
                            <div className="flex flex-col gap-2 h-full">
                                <div className="flex justify-between items-center">
                                    <Label>Conteúdo do Contrato (Editor)</Label>
                                    <div className="flex gap-2 relative">
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="hidden"
                                            accept=".docx,.pdf"
                                            onChange={handleFileUpload}
                                            disabled={isProcessingFile}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-2"
                                            onClick={() => {
                                                const content = formData.content;
                                                let newContent = content;
                                                let count = 0;

                                                // 1. Convert underscores (_____) with preceding label (e.g. "Nome: ______")
                                                newContent = newContent.replace(/([a-zA-ZÀ-ÿ0-9\s]+):\s*_{3,}/g, (match, label) => {
                                                    // Clean label: remove extra spaces, uppercase, replace spaces with _
                                                    const cleanLabel = label.trim().toUpperCase().replace(/\s+/g, "_");
                                                    return `${label}: {{${cleanLabel}}}`; // Keep the label text, replace underline
                                                });

                                                // 2. Convert remaining underscores (_____) to {{CAMPO_X}}
                                                newContent = newContent.replace(/_{3,}/g, (match) => {
                                                    count++;
                                                    return `{{CAMPO_${count}}}`;
                                                });

                                                // 3. Convert [TEXTO] to {{TEXTO}}
                                                newContent = newContent.replace(/\[([A-ZÀ-ÿ0-9_\s]+)\]/g, (match, inner) => {
                                                    const clean = inner.trim().toUpperCase().replace(/\s+/g, "_");
                                                    return `{{${clean}}}`;
                                                });

                                                if (newContent !== content) {
                                                    setFormData(prev => ({ ...prev, content: newContent }));
                                                    toast.success("Campos detectados! Verifique os nomes gerados.");
                                                } else {
                                                    toast.info("Nenhum padrão detectado (use 'Label: ____' ou '[NOME]').");
                                                }
                                            }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                                            Detectar Campos
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-2"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                            disabled={isProcessingFile}
                                        >
                                            {isProcessingFile ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="h-3.5 w-3.5" />
                                            )}
                                            {isProcessingFile ? "Lendo..." : "Importar Arquivo"}
                                        </Button>
                                    </div>
                                </div>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    className="flex-1 font-mono text-sm resize-none"
                                    placeholder="Cole aqui o texto do contrato. Use {{NOME}}, {{CPF}}, {{VALOR}} para criar campos."
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Suporta upload de DOCX e PDF (Apenas texto simples).
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 h-full">
                                <Label>Preview das Variáveis Detectadas</Label>
                                <div className="flex-1 bg-slate-50 border rounded-md p-4 overflow-y-auto">
                                    {uniqueVariables.length > 0 ? (
                                        <div className="space-y-3">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                O sistema detectou os seguintes campos que serão solicitados ao usuário:
                                            </p>
                                            {uniqueVariables.map((variable, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border shadow-sm">
                                                    <Badge variant="outline" className="font-mono">{variable}</Badge>
                                                    <span className="text-sm text-slate-600">Campo de texto</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                                            <p>Nenhuma variável detectada.</p>
                                            <p>Digite <code>{"{{EXEMPLO}}"}</code> no editor para ver o resultado.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                            {createMutation.isPending || updateMutation.isPending ? "Salvando..." : "Salvar Modelo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
