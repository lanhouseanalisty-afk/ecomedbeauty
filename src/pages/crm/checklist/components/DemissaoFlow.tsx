import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    UserMinus,
    Briefcase,
    Monitor,
    CheckCircle2,
    Save,
    Send,
    Check,
    Clock,
    User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import emailjs from '@emailjs/browser';

// --- Schemas ---

const secaoRHSchema = z.object({
    nome_completo: z.string().min(1, "Selecione o colaborador"),
    data_desligamento: z.string().min(1, "Data obrigatória"),
    tipo_desligamento: z.string().min(1, "Selecione o tipo"),
    aviso_previo: z.string().optional(),
    exame_demissional_agendado: z.string().optional(),
    data_exame: z.string().optional(),
    observacoes_rh: z.string().optional(),
});

const secaoGestorSchema = z.object({
    equipamentos_devolvidos: z.array(z.string()).optional().default([]),
    pendencias_trabalho: z.string().optional(),
    acessos_revogados_gestor: z.string().optional(),
    observacoes_gestor: z.string().optional(),
});

const secaoTISchema = z.object({
    conta_ad_bloqueada: z.string().optional(),
    email_bloqueado: z.string().optional(),
    vpn_revogada: z.string().optional(),
    usuario_sap_inativado: z.string().optional(),
    salesforce_inativado: z.string().optional(),
    backup_realizado: z.string().optional(),
    equipamentos_recolhidos_ti: z.array(z.string()).optional().default([]),
    observacoes_ti: z.string().optional(),
});

const fullSchema = secaoRHSchema.merge(secaoGestorSchema).merge(secaoTISchema);
type FormData = z.infer<typeof fullSchema>;

// --- Sections ---

const sections = [
    { id: 1, title: "Solicitação RH", icon: UserMinus, role: "RH" },
    { id: 2, title: "Validação Gestor", icon: Briefcase, role: "Gestor" },
    { id: 3, title: "Encerramento TI", icon: Monitor, role: "TI" },
];

const EQUIPAMENTOS_LIST = ["Notebook", "Celular", "Tablet", "Monitor", "Periféricos", "Crachá", "Chave do Escritório"];

function validateCurrentSection(sectionId: number, data: FormData): boolean {
    if (sectionId === 1) {
        // Zod handles basics, maybe check logic valid dates
        return true;
    }
    if (sectionId === 2) {
        if (!data.acessos_revogados_gestor) {
            alert("Gestor: Confirme se os acessos departamentais foram revogados.");
            return false;
        }
        return true;
    }
    if (sectionId === 3) {
        const required = ['conta_ad_bloqueada', 'email_bloqueado'];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const missing = required.filter(f => !data[f as keyof FormData] || (data as any)[f] === "");
        if (missing.length > 0) {
            alert("TI: É obrigatório bloquear Conta AD e Email.");
            return false;
        }
        return true;
    }
    return true;
}

function getSectionStatus(sectionId: number, currentSection: number) {
    if (sectionId < currentSection) return 'completed';
    if (sectionId === currentSection) return 'current';
    return 'pending';
}

interface DemissaoFlowProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (data: any) => void;
    isReadOnly?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
}

export function DemissaoFlow({ data, onUpdate, isReadOnly = false, user }: DemissaoFlowProps) {
    const [currentSection, setCurrentSection] = useState(data?.currentSection || 1);
    const [isSending, setIsSending] = useState(false);
    const [employees, setEmployees] = useState<{ id: string, full_name: string }[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            const { data } = await supabase.from('employees').select('id, full_name').eq('status', 'active');
            if (data) setEmployees(data);
        };
        fetchEmployees();
    }, []);

    const userRole = user?.role;
    const isAdm = userRole === 'Adm';

    const sectionRoles: Record<number, string[]> = {
        1: ['RH'],
        2: ['Gestor'],
        3: ['TI']
    };

    const allowedRoles = sectionRoles[currentSection] || [];
    const canEdit = !isReadOnly && (isAdm || allowedRoles.includes(userRole));
    const isSectionReadOnly = !canEdit;

    const progress = (currentSection / sections.length) * 100;

    const form = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(fullSchema) as any,
        defaultValues: {
            nome_completo: "",
            data_desligamento: "",
            tipo_desligamento: "Sem Justa Causa",
            aviso_previo: "Trabalhado",
            exame_demissional_agendado: "Nao",
            data_exame: "",
            observacoes_rh: "",
            equipamentos_devolvidos: [],
            pendencias_trabalho: "",
            acessos_revogados_gestor: "Nao",
            observacoes_gestor: "",
            conta_ad_bloqueada: "Nao",
            email_bloqueado: "Nao",
            vpn_revogada: "Nao",
            usuario_sap_inativado: "Nao",
            salesforce_inativado: "Nao",
            backup_realizado: "Nao",
            equipamentos_recolhidos_ti: [],
            observacoes_ti: "",
            ...data
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    });

    const handleSubmit = async (values: FormData) => {
        if (!canEdit) {
            alert("Sem permissão para salvar");
            return;
        }

        if (!validateCurrentSection(currentSection, values)) return;

        setIsSending(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 800));

        let nextSection = currentSection;
        let msg = "";

        if (currentSection < sections.length) {
            nextSection = currentSection + 1;
            msg = `Seção ${sections[currentSection - 1].role} salva com sucesso!`;

            if (currentSection === 1 && values.exame_demissional_agendado === 'Sim') {
                // Send email about exam
                const templateParams = {
                    to_email: "clinica@parceiro.com",
                    nome_colaborador: values.nome_completo,
                    data_exame: values.data_exame,
                    tipo_exame: "Demissional"
                };
                emailjs.send(
                    import.meta.env.VITE_EMAILJS_SERVICE_ID,
                    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                    templateParams,
                    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                ).then(() => console.log("Email demissional enviado"), err => console.error(err));
            }

        } else {
            msg = "Desligamento processado com sucesso!";
            setIsCompleted(true);

            // Release Assets
            if (values.nome_completo) {
                const { error } = await supabase
                    .from('tech_assets')
                    .update({ status: 'available', assigned_to_name: null })
                    .eq('assigned_to_name', values.nome_completo);

                if (error) console.error("Error releasing assets", error);
            }
            // Deactivate Employee
            if (values.nome_completo) {
                await supabase
                    .from('employees')
                    .update({ status: 'terminated' })
                    .eq('full_name', values.nome_completo);
            }
        }

        setCurrentSection(nextSection);
        onUpdate({ ...values, currentSection: nextSection });
        alert(msg);
        setIsSending(false);
    };

    return (
        <div className="space-y-6">
            {!canEdit && !isCompleted && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm">
                    <p className="font-bold">Modo de Visualização</p>
                    <p>Aguardando etapa anterior ou você não tem permissão ({sections.find(s => s.id === currentSection)?.role}).</p>
                </div>
            )}

            {isCompleted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in">
                    <div className="bg-red-100 p-6 rounded-full">
                        <UserMinus className="w-16 h-16 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold mt-4">Desligamento Concluído</h2>
                    <p className="text-gray-600 mt-2">Colaborador desligado e ativos liberados.</p>
                    <Button className="mt-6" variant="outline" onClick={() => window.location.href = '/'}>
                        Voltar ao Início
                    </Button>
                </div>
            ) : (
                <>
                    {/* Header Card */}
                    <Card className="border-red-200 bg-red-50/30">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl font-serif text-red-900 flex items-center gap-2">
                                        <UserMinus className="h-6 w-6 text-red-600" />
                                        Checklist de Demissão
                                    </CardTitle>
                                    <CardDescription>Fluxo de desligamento seguro e controlado.</CardDescription>
                                </div>
                                <Badge variant="destructive" className="text-sm">
                                    Seção {currentSection} / {sections.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm mb-2">
                                {sections.map(s => {
                                    const status = getSectionStatus(s.id, currentSection);
                                    return (
                                        <div key={s.id} className={`flex items-center gap-2 px-3 py-1 rounded ${status === 'current' ? 'bg-red-100 text-red-800 font-bold' : 'text-gray-500'}`}>
                                            <s.icon className="h-4 w-4" />
                                            <span>{s.role}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <Progress value={progress} className="h-1 bg-red-200" indicatorClassName="bg-red-600" />
                        </CardContent>
                    </Card>

                    <Form {...form}>
                        {/* Section 1: RH */}
                        {currentSection === 1 && (
                            <Card>
                                <CardHeader><CardTitle>1. Dados do Desligamento (RH)</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="nome_completo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Colaborador</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {employees.map(e => (
                                                            <SelectItem key={e.id} value={e.full_name}>{e.full_name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="data_desligamento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Último dia</FormLabel>
                                                    <FormControl><Input type="date" {...field} disabled={isSectionReadOnly} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tipo_desligamento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Motivo</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Sem Justa Causa">Sem Justa Causa</SelectItem>
                                                            <SelectItem value="Com Justa Causa">Com Justa Causa</SelectItem>
                                                            <SelectItem value="Pedido de Demissao">Pedido de Demissão</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="exame_demissional_agendado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Agendar Exame?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch("exame_demissional_agendado") === "Sim" && (
                                        <FormField
                                            control={form.control}
                                            name="data_exame"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Data do Exame</FormLabel>
                                                    <FormControl><Input type="date" {...field} disabled={isSectionReadOnly} /></FormControl>
                                                    <FormDescription>Um email será enviado para a clínica.</FormDescription>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Section 2: Gestor */}
                        {currentSection === 2 && (
                            <Card>
                                <CardHeader><CardTitle>2. Pendências e Devoluções (Gestor)</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="pendencias_trabalho"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pendências de Trabalho / Passagem de Bastão</FormLabel>
                                                <FormControl><Textarea {...field} disabled={isSectionReadOnly} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="acessos_revogados_gestor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Acessos a pastas restritas revogados?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Sim">Sim</SelectItem>
                                                        <SelectItem value="Nao">Não</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Section 3: TI */}
                        {currentSection === 3 && (
                            <Card>
                                <CardHeader><CardTitle>3. Bloqueios de TI</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="conta_ad_bloqueada"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bloquear AD</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Nao">Não</SelectItem></SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email_bloqueado"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bloquear Email</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Nao">Não</SelectItem></SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="backup_realizado"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Backup de Arquivos Realizado?</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={isSectionReadOnly}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Nao">Não</SelectItem></SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => setCurrentSection(Math.max(1, currentSection - 1))} disabled={currentSection === 1}>
                                Voltar
                            </Button>
                            <Button type="button" onClick={form.handleSubmit(handleSubmit)} disabled={isSending || isSectionReadOnly} className="bg-red-600 hover:bg-red-700 text-white">
                                {isSending ? "Salvando..." : (currentSection === 3 ? "Finalizar Desligamento" : "Próxima Etapa")}
                            </Button>
                        </div>

                    </Form>
                </>
            )}
        </div>
    );
}
