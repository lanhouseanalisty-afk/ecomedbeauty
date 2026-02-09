import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    UserMinus,
    Briefcase,
    Monitor,
    FileSpreadsheet,
    CheckCircle2,
    CalendarDays,
    AlertTriangle
} from "lucide-react";

// Motivos de desligamento
const MOTIVOS_DESLIGAMENTO = [
    { value: "pedido_demissao", label: "Pedido de Demissão" },
    { value: "sem_justa_causa", label: "Dispensa sem Justa Causa" },
    { value: "com_justa_causa", label: "Dispensa com Justa Causa" },
    { value: "termino_contrato", label: "Término de Contrato" },
    { value: "acordo", label: "Acordo (Comum Acordo)" },
    { value: "falecimento", label: "Falecimento" },
];

// Tipos de aviso prévio
const TIPOS_AVISO = [
    { value: "trabalhado", label: "Trabalhado" },
    { value: "indenizado", label: "Indenizado" },
    { value: "cumprido_parcialmente", label: "Cumprido Parcialmente" },
    { value: "nao_aplica", label: "Não se aplica" },
];

/**
 * SCHEMA SEÇÃO 1 - RH (Início do Processo)
 */
const secaoRHSchema = z.object({
    funcionario_id: z.string().min(1, "Selecione o funcionário"),
    nome_completo: z.string().min(1, "Nome é obrigatório"),
    cargo: z.string().min(1, "Cargo é obrigatório"),
    departamento: z.string().min(1, "Departamento é obrigatório"),
    data_comunicado: z.string().min(1, "Data do comunicado é obrigatória"),
    ultimo_dia: z.string().min(1, "Último dia trabalhado é obrigatório"),
    motivo_desligamento: z.string().min(1, "Motivo é obrigatório"),
    tipo_aviso: z.string().min(1, "Tipo de aviso é obrigatório"),
    observacoes_rh: z.string().optional(),
    lista_equipamentos: z.string().optional(), // Lista de equipamentos que estavam com o funcionário
});

/**
 * SCHEMA SEÇÃO 2 - GESTOR (Entregas e Avaliação)
 */
const secaoGestorSchema = z.object({
    equipamentos_devolvidos: z.enum(["Sim", "Nao", "Parcial"]).optional(),
    lista_pendencias: z.string().optional(), // Itens não devolvidos
    backup_realizado: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    projeto_transferido: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    chave_acesso_entregue: z.enum(["Sim", "Nao", "NaoAplica"]).optional(),
    observacoes_gestor: z.string().optional(),
});

/**
 * SCHEMA SEÇÃO 3 - TI (Bloqueios e Revogações)
 */
const secaoTISchema = z.object({
    conta_ad_bloqueada: z.boolean().default(false),
    email_bloqueado: z.boolean().default(false),
    acesso_vpn_revogado: z.boolean().default(false),
    licencas_removidas: z.boolean().default(false),
    equipamentos_recolhidos: z.boolean().default(false), // TI confirma recebimento físico
    observacoes_ti: z.string().optional(),
});

/**
 * SCHEMA SEÇÃO 4 - DP/FINANCEIRO (Finalização)
 */
const secaoDPSchema = z.object({
    exame_demissional: z.enum(["Agendado", "Realizado", "Pendente"]).optional(),
    data_exame: z.string().optional(),
    calculo_rescisao: z.enum(["Pendente", "Calculado", "Conferido"]).optional(),
    pagamento_agendado: z.string().optional(),
    baixa_ctps: z.boolean().default(false),
    envio_esocial: z.boolean().default(false),
    observacoes_final: z.string().optional(),
});


const fullSchema = secaoRHSchema
    .merge(secaoGestorSchema)
    .merge(secaoTISchema)
    .merge(secaoDPSchema);

type FormData = z.infer<typeof fullSchema>;

interface DemissaoFormProps {
    onSubmit: (data: FormData) => void;
    initialData?: Partial<FormData>;
    currentSection?: number;
    isReadOnly?: boolean;
    userRole?: 'rh' | 'gestor' | 'ti' | 'dp';
    employees?: any[]; // Lista de funcionários para select
}

const sections = [
    { id: 1, title: "Dados do Desligamento", icon: UserMinus, role: "RH" },
    { id: 2, title: "Gestão & Equipamentos", icon: Briefcase, role: "Gestor" },
    { id: 3, title: "Bloqueios TI", icon: Monitor, role: "TI" },
    { id: 4, title: "Homologação & Pagto", icon: FileSpreadsheet, role: "DP" },
];

import { useTechAssets } from "@/hooks/useTech";

// Helper para buscar equipamentos da admissão (MANTIDO separadamente para uso visual se necessario, mas vamos usar o hook principal para updates)
async function getAdmissionEquipments(cpf: string) {
    try {
        const { data } = await supabase
            .from('admission_processes')
            .select('needs_laptop, needs_monitor, needs_headset, needs_keyboard, needs_mouse, needs_printer')
            .eq('cpf', cpf)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!data) return null;

        const items = [];
        if (data.needs_laptop) items.push("Notebook");
        if (data.needs_monitor) items.push("Desktop");
        if (data.needs_headset) items.push("Tablet");
        if (data.needs_keyboard) items.push("Celular");

        return items.length > 0 ? items.join(", ") : null;
    } catch (e) {
        console.error("Erro ao buscar equipamentos da admissão:", e);
        return null;
    }
}

// Helper para buscar ativos de TI atuais (WRAPPER para ser usado no useEffect, mas usaremos do hook tambem)
async function getTechAssets(employeeId: string) {
    try {
        // Primeiro precisamos do user_id do funcionário
        const { data: emp } = await supabase
            .from('employees')
            .select('user_id')
            .eq('id', employeeId)
            .single();

        if (!emp?.user_id) return [];

        // Buscar ativos
        const { data } = await supabase
            .from('tech_assets')
            .select('*')
            .eq('assigned_to', emp.user_id)
            .eq('status', 'in_use');

        return data || [];
    } catch (e) {
        console.error("Erro ao buscar ativos de TI:", e);
        return [];
    }
}

export default function DemissaoForm({
    onSubmit,
    initialData,
    currentSection: initialSection = 1,
    isReadOnly = false,
    userRole = 'rh',
    employees = []
}: DemissaoFormProps) {
    const [currentSection, setCurrentSection] = useState(initialSection);


    const form = useForm<FormData>({
        resolver: zodResolver(fullSchema),
        defaultValues: {
            funcionario_id: "",
            nome_completo: "",
            cargo: "",
            departamento: "",
            data_comunicado: new Date().toISOString().split('T')[0],
            ultimo_dia: "",
            motivo_desligamento: "",
            tipo_aviso: "",
            observacoes_rh: "",
            equipamentos_devolvidos: undefined,
            lista_pendencias: "",
            backup_realizado: undefined,
            projeto_transferido: undefined,
            chave_acesso_entregue: undefined,
            observacoes_gestor: "",
            conta_ad_bloqueada: false,
            email_bloqueado: false,
            acesso_vpn_revogado: false,
            licencas_removidas: false,
            equipamentos_recolhidos: false,
            observacoes_ti: "",
            exame_demissional: "Pendente",
            data_exame: "",
            calculo_rescisao: "Pendente",
            pagamento_agendado: "",
            baixa_ctps: false,
            envio_esocial: false,
            observacoes_final: "",
            ...initialData,
        },
    });

    const [techAssets, setTechAssets] = useState<any[]>([]);
    const selectedEmployeeId = form.watch("funcionario_id");

    useEffect(() => {
        if ((currentSection === 2 || currentSection === 3) && selectedEmployeeId) {
            getTechAssets(selectedEmployeeId).then(assets => setTechAssets(assets));
        }
    }, [currentSection, selectedEmployeeId]);

    const progress = (currentSection / sections.length) * 100;

    // Ao selecionar funcionário, preencher dados automaticamente
    const handleEmployeeSelect = async (employeeId: string) => {
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
            console.log("Selected Employee Data:", employee); // Debug para verificar estrutura

            form.setValue("funcionario_id", employee.id);
            form.setValue("nome_completo", employee.full_name);

            // Tratamento robusto para cargo e departamento (Supabase pode retornar objeto ou array dependendo da relação)
            const cargo = Array.isArray(employee.position)
                ? employee.position[0]?.title
                : (employee.position?.title || "");

            const depto = Array.isArray(employee.department)
                ? employee.department[0]?.name
                : (employee.department?.name || "");

            form.setValue("cargo", cargo || "Cargo não definido");
            form.setValue("departamento", depto || "Departamento não definido");

            // Tentar preencher equipamentos via admissão deste CPF E inventário atual
            const cpf = (employee as any).cpf;
            let equipamentosTexto = "";

            if (cpf) {
                const equipamentosAdmissao = await getAdmissionEquipments(cpf);
                if (equipamentosAdmissao) {
                    equipamentosTexto += `[ADMISSÃO]: ${equipamentosAdmissao}`;
                }
            }

            // Buscar ativos de TI atuais
            const ativos = await getTechAssets(employee.id);
            if (ativos && ativos.length > 0) {
                const ativosStr = ativos.map((a: any) => `${a.device_type} ${a.brand} ${a.model} (${a.asset_tag})`).join(", ");
                if (equipamentosTexto) equipamentosTexto += "\n\n";
                equipamentosTexto += `[INVENTÁRIO ATUAL]: ${ativosStr}`;
            }

            if (equipamentosTexto) {
                form.setValue("lista_equipamentos", equipamentosTexto);
                toast.info("Equipamentos importados de Admissão e Inventário.");
            }
        }
    };

    const { updateAsset } = useTechAssets();

    const handleInternalSubmit = async (data: FormData) => {
        // AUTOMAÇÃO DE INVENTÁRIO (TI)
        // Se for a etapa de TI (3) e os equipamentos foram marcados como recolhidos
        if (currentSection === 3 && data.equipamentos_recolhidos) {
            if (techAssets && techAssets.length > 0) {
                toast.loading("Atualizando inventário...");
                try {
                    await Promise.all(techAssets.map(asset =>
                        updateAsset.mutateAsync({
                            id: asset.id,
                            status: 'available',
                            assigned_to: undefined, // Remove a foreign key do usuário (undefined ou null dependendo do hook, mas undefined remove do payload se partial, aqui queremos zerar)
                            // O hook usa Partial<TechAsset>. Precisamos ver se ele aceita null para chaves estrangeiras.
                            // Se o update for Partial, mandar null explicitamente para limpar.
                            // Vamos assumir que o backend trata isso ou mandar string vazia pra 'assigned_to_name'
                            assigned_to_name: "Estoque / Devolução",
                            location: "TI - Estoque Central"
                        } as any) // Cast as any to bypass strict type check if nullable issues arise
                    ));

                    // Também precisamos limpar o 'assigned_to' (UUID) no banco.
                    // O hook updateAsset pode não estar preparado para limpar FKs se a tipagem não deixar passar null.
                    // Vamos garantir fazendo um update direto via supabase para os assets para garantir limpeza do FK.
                    const { error } = await supabase
                        .from('tech_assets')
                        .update({ assigned_to: null, status: 'available', assigned_to_name: 'Estoque / Devolução', location: 'TI - Estoque Central' })
                        .in('id', techAssets.map(a => a.id));

                    if (error) throw error;

                    toast.dismiss();
                    toast.success("Inventário atualizado: Ativos liberados para estoque!");
                } catch (error) {
                    console.error("Erro ao liberar ativos:", error);
                    toast.dismiss();
                    toast.error("Erro ao atualizar inventário, mas seguindo com o desligamento.");
                }
            }
        }

        onSubmit(data);
    };

    return (
        <div className="space-y-6">
            {/* Header ... */}
            <Card className="border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10">
                {/* ... existing header code ... */}
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl text-red-700 dark:text-red-400 flex items-center gap-2">
                                <UserMinus className="h-5 w-5" />
                                Checklist de Desligamento
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Processo oficial de desligamento de colaboradores.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1 border-red-200 text-red-700">
                            Etapa {currentSection} de {sections.length}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            {sections.map((section) => (
                                <div
                                    key={section.id}
                                    className={`flex items-center gap-1 ${section.id === currentSection
                                        ? "text-red-600 font-medium"
                                        : section.id < currentSection
                                            ? "text-green-600"
                                            : "text-muted-foreground"
                                        }`}
                                >
                                    <section.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{section.role}</span>
                                </div>
                            ))}
                        </div>
                        <Progress value={progress} className="h-2 bg-red-100 dark:bg-red-950" indicatorClassName="bg-red-600" />
                    </div>
                </CardContent>
            </Card>

            {/* Navegação de tabs ... */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {sections.map((section) => (
                    <Button
                        key={section.id}
                        variant={currentSection === section.id ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => {
                            setCurrentSection(section.id);
                        }}
                        className={`flex items-center gap-2 whitespace-nowrap ${currentSection !== section.id ? "hover:text-red-600 hover:border-red-200" : ""}`}
                    >
                        <section.icon className="h-4 w-4" />
                        {section.title}
                        {section.id < currentSection && (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                        )}
                    </Button>
                ))}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-6">

                    {/* SEÇÃO 1 - RH */}
                    {currentSection === 1 && (
                        <Card>
                            <CardHeader className="bg-red-50 dark:bg-red-950/20 rounded-t-lg">
                                <CardTitle>Dados do Desligamento (RH)</CardTitle>
                                <CardDescription>Informações iniciais e contratuais</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">

                                {/* Seleção de Funcionário */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="funcionario_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Colaborador <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={(val) => handleEmployeeSelect(val)} value={field.value} disabled={isReadOnly || !!initialData?.funcionario_id}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o colaborador" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {employees.map(emp => (
                                                            <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="departamento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Departamento</FormLabel>
                                                <FormControl>
                                                    <Input {...field} disabled readOnly className="bg-muted" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="cargo"
                                    render={({ field }) => (
                                        <FormItem className="max-w-md">
                                            <FormLabel>Cargo</FormLabel>
                                            <FormControl>
                                                <Input {...field} disabled readOnly className="bg-muted" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="data_comunicado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data do Comunicado</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ultimo_dia"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Último Dia Trabalhado</FormLabel>
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
                                        name="motivo_desligamento"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Motivo do Desligamento</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o motivo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {MOTIVOS_DESLIGAMENTO.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tipo_aviso"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Aviso Prévio</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {TIPOS_AVISO.map(option => (
                                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observacoes_rh"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações Gerais</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detalhes adicionais..." {...field} disabled={isReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lista_equipamentos"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Equipamentos com o Colaborador</FormLabel>
                                            <FormDescription>Liste os itens que devem ser devolvidos (Ex: Notebook, Celular, Monitor)</FormDescription>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Ex: Notebook Dell Service Tag XYZ, iPhone 12, Monitor Samsung..."
                                                    className="min-h-[80px]"
                                                    {...field}
                                                    disabled={isReadOnly}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/* SEÇÃO 2 - GESTOR */}
                    {currentSection === 2 && (
                        <Card>
                            <CardHeader className="bg-amber-50 dark:bg-amber-950/20 rounded-t-lg">
                                <CardTitle>Gestão & Equipamentos (Gestor)</CardTitle>
                                <CardDescription>Validação de entregas e transferências</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">

                                {/* Visualização dos itens informados pelo RH */}
                                {initialData?.lista_equipamentos && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
                                        <h4 className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300 mb-2">
                                            <Monitor className="h-4 w-4" />
                                            Itens para Devolução (Registrado no Desligamento)
                                        </h4>
                                        <p className="text-sm whitespace-pre-wrap">{initialData.lista_equipamentos}</p>
                                    </div>
                                )}

                                {/* Visualização Dinâmica do Inventário Real */}
                                {techAssets.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-6">
                                        <h4 className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300 mb-2">
                                            <Briefcase className="h-4 w-4" />
                                            Inventário Tech Atual (Check Online)
                                        </h4>
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {techAssets.map((asset: any) => (
                                                <li key={asset.id} className="text-amber-900 dark:text-amber-100">
                                                    <strong>{asset.device_type}:</strong> {asset.brand} {asset.model} <span className="text-xs text-muted-foreground">({asset.asset_tag})</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-muted-foreground mt-2 font-italic border-t border-amber-200 pt-1">
                                            * Estes itens constam atualmente no sistema de Inventário da TI.
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="equipamentos_devolvidos"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Equipamentos Devolvidos?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim, todos</SelectItem>
                                                        <SelectItem value="Nao">Não devolveu nada</SelectItem>
                                                        <SelectItem value="Parcial">Devolução Parcial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("equipamentos_devolvidos") !== "Sim" && (
                                        <FormField
                                            control={form.control}
                                            name="lista_pendencias"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lista de Pendências</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="O que faltou entregar?" {...field} disabled={isReadOnly} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="backup_realizado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Backup Realizado?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="projeto_transferido"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Projetos Transferidos?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="chave_acesso_entregue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Chaves/Cartões Entregues?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                        <SelectItem value="NaoAplica">N/A</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observacoes_gestor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avaliação Final / Observações</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Comentários sobre o desempenho ou motivo real..." {...field} disabled={isReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>
                    )}

                    {/* SEÇÃO 3 - TI */}
                    {currentSection === 3 && (
                        <Card>
                            <CardHeader className="bg-blue-50 dark:bg-blue-950/20 rounded-t-lg">
                                <CardTitle>Checklist de TI (Bloqueios)</CardTitle>
                                <CardDescription>Revogação de acessos e segurança</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="conta_ad_bloqueada"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Bloquear AD</FormLabel>
                                                    <FormDescription>Desativar conta no Active Directory</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email_bloqueado"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Bloquear E-mail</FormLabel>
                                                    <FormDescription>Suspender acesso ao Office 365</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="acesso_vpn_revogado"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Revogar VPN</FormLabel>
                                                    <FormDescription>Cancelar certificado e acesso remoto</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="equipamentos_recolhidos"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-base">Equipamentos OK</FormLabel>
                                                    <FormDescription>Equipamentos recebidos e formatados</FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observacoes_ti"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações Técnicas</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Nº Chamado, detalhes dos ativos..." {...field} disabled={isReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                            </CardContent>
                        </Card>
                    )}

                    {/* SEÇÃO 4 - DP */}
                    {currentSection === 4 && (
                        <Card>
                            <CardHeader className="bg-green-50 dark:bg-green-950/20 rounded-t-lg">
                                <CardTitle>Departamento Pessoal (Finalização)</CardTitle>
                                <CardDescription>Procedimentos finais e pagamento</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="exame_demissional"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Exame Demissional</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                                        <SelectItem value="Agendado">Agendado</SelectItem>
                                                        <SelectItem value="Realizado">Realizado (ASO OK)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="data_exame"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data do Exame</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="calculo_rescisao"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cálculo da Rescisão</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Pendente">Pendente</SelectItem>
                                                        <SelectItem value="Calculado">Calculado</SelectItem>
                                                        <SelectItem value="Conferido">Conferido e Aprovado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="pagamento_agendado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Data Pagamento</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} disabled={isReadOnly} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex gap-6 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="baixa_ctps"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Baixa na Carteira (CTPS)</FormLabel>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="envio_esocial"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Evento S-2299 (eSocial)</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="observacoes_final"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observações Finais</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Informações de arquivamento..." {...field} disabled={isReadOnly} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-between pt-4">
                        {currentSection > 1 ? (
                            <Button type="button" variant="outline" onClick={() => setCurrentSection(currentSection - 1)}>
                                Voltar
                            </Button>
                        ) : <div />}

                        {currentSection < sections.length && currentSection !== 4 ? (
                            <Button
                                type="button"
                                onClick={() => {
                                    // If we are in "wizard mode" (creating new), we might want Next
                                    // But if we are in "task mode" (viewing single step), we probably want Submit
                                    // For now, let's assume if it is NOT readOnly, we are working on this step.
                                    // Actually, standard behavior for wizard is "Next". 
                                    // But here we want to Submit the CURRENT step if we are in that step's role.

                                    // If user is editing a specific step (e.g. Gestor), "Próximo" might be confusing implies local navigation.
                                    // Let's rely on the parent component to control "onSubmit". 
                                    // The parent handles the "Update Logic".
                                    // So we just need to trigger submit.
                                    form.handleSubmit(onSubmit)();
                                }}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isReadOnly}
                            >
                                {currentSection === 1 && "Iniciar e Enviar para Gestor"}
                                {currentSection === 2 && "Confirmar e Enviar para TI"}
                                {currentSection === 3 && "Confirmar Bloqueios e Enviar para DP"}
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={isReadOnly}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {currentSection === 4 ? "Concluir Desligamento" : "Salvar Alterações"}
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
