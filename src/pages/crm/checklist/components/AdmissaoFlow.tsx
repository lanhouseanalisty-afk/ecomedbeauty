import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import {
    User,
    Briefcase,
    Monitor,
    CheckCircle2,
    Save,
    Send,
    Check,
    Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import emailjs from '@emailjs/browser';

// Import New Steps
import { StepRH } from "./admissao/StepRH";
import { StepGestor } from "./admissao/StepGestor";
import { StepTI } from "./admissao/StepTI";
import { StepColaborador } from "./admissao/StepColaborador";

// Schema Section 1 - RH
const secaoRHSchema = z.object({
    nome_completo: z.string().optional().or(z.literal("")),
    nome_exibicao: z.string().optional().or(z.literal("")),
    cpf: z.string().optional(),
    data_admissao: z.string().optional().or(z.literal("")),
    data_inicio: z.string().optional().or(z.literal("")),
    tipo_contratacao: z.string().optional().or(z.literal("")),
    setor_departamento: z.string().optional().or(z.literal("")),
    filial_unidade: z.string().optional(),
    gestor_direto: z.string().optional(),
    email_gestor: z.string().optional(),
    cargo_funcao: z.string().optional().or(z.literal("")),
    regime_trabalho: z.enum(["Presencial", "Híbrido", "Remoto", ""]).optional(),
    regiao_comercial: z.string().optional(),
    observacoes_rh: z.string().optional(),
});

// Schema Section 2 - Gestor
const secaoGestorSchema = z.object({
    tipo_vaga: z.string().optional().nullable(),
    buddy_mentor: z.string().optional().nullable(),
    equipamentos_necessarios: z.array(z.string()).optional().default([]).nullable(),
    softwares_necessarios: z.array(z.string()).optional().default([]).nullable(),
    outros_softwares_descricao: z.string().optional().nullable(),
    acessos_necessarios: z.array(z.string()).optional().default([]).nullable(),
    sharepoint_pasta: z.string().optional().nullable(),
    outros_acessos: z.string().optional().nullable(),
    necessita_impressora: z.string().optional().nullable(),
    necessita_vpn: z.string().optional().nullable(),
    observacoes_gestor: z.string().optional().nullable(),
});

// Inventory Types Helper
const INVENTORY_TYPES = ["Notebook", "Tablet", "Celular"];

// Schema Section 3 - TI
const secaoTISchema = z.object({
    conta_ad_criada: z.string().optional().nullable(),
    email_corporativo_criado: z.string().optional().nullable(),
    licencas_microsoft365: z.array(z.string()).optional().nullable(),
    vpn_configurada: z.string().optional().nullable(),
    softwares_instalados: z.string().optional().nullable(),
    usuario_sap_criado: z.string().optional().nullable(),
    perfil_salesforce_criado: z.string().optional().nullable(),
    pastas_rede_liberadas: z.string().optional().nullable(),
    impressoras_configuradas: z.string().optional().nullable(),
    testes_gerais_realizados: z.string().optional().nullable(),
    observacoes_ti: z.string().optional().nullable(),
    detalhes_conta_ad: z.string().optional().nullable(),
    detalhes_email: z.string().optional().nullable(),
    detalhes_sap: z.string().optional().nullable(),
    detalhes_salesforce: z.string().optional().nullable(),
    detalhes_rede: z.string().optional().nullable(),
    detalhes_testes: z.string().optional().nullable(),
    equipamentos_definidos: z.record(z.string()).optional().default({}),
    status_perifericos: z.record(z.string()).optional().default({}),
});

// Schema Section 4 - Colaborador
const secaoColaboradorSchema = z.object({
    confirma_recebimento_equipamentos: z.string().optional().nullable(),
    confirma_funcionamento_acessos: z.string().optional().nullable(),
    recebeu_orientacao_sistemas: z.string().optional().nullable(),
    sabe_solicitar_suporte: z.string().optional().nullable(),
    observacoes_colaborador: z.string().optional().nullable(),
    termo_assinado: z.boolean().optional().default(false),
    data_assinatura: z.string().optional().nullable(),
});

const fullSchema = secaoRHSchema
    .merge(secaoGestorSchema)
    .merge(secaoTISchema)
    .merge(secaoColaboradorSchema);

type FormData = z.infer<typeof fullSchema>;

const sections = [
    { id: 1, title: "Dados do Colaborador", icon: User, role: "RH" },
    { id: 2, title: "Definições do Gestor", icon: Briefcase, role: "Gestor" },
    { id: 3, title: "Configuração TI", icon: Monitor, role: "TI" },
    { id: 4, title: "Documentos", icon: CheckCircle2, role: "Colaborador" },
];

function validateStep(sectionId: number, data: FormData): boolean {
    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            'conta_ad_criada': 'Conta AD',
            'email_corporativo_criado': 'Email Corporativo',
            'vpn_configurada': 'VPN',
            'usuario_sap_criado': 'Usuário SAP B1',
            'perfil_salesforce_criado': 'Perfil Salesforce',
            'pastas_rede_liberadas': 'Pastas de Rede',
            'impressoras_configuradas': 'Impressoras',
            'testes_gerais_realizados': 'Testes Gerais'
        };
        return labels[field] || field;
    };

    if (sectionId === 1) return true; // Zod handles basic required fields

    if (sectionId === 2) {
        const missing = [];
        if (!data.tipo_vaga) missing.push("Tipo da Vaga");
        if (!data.necessita_vpn) missing.push("Necessita VPN");
        if (!data.necessita_impressora) missing.push("Necessita Impressora");

        if (missing.length > 0) {
            alert(`Por favor, preencha os seguintes campos obrigatórios do Gestor:\n- ${missing.join("\n- ")}`);
            return false;
        }
        return true;
    }

    if (sectionId === 3) {
        const requiredFields: (keyof FormData)[] = [
            'conta_ad_criada',
            'email_corporativo_criado',
            'testes_gerais_realizados'
        ];

        const softwares = data.softwares_necessarios || [];
        if (data.necessita_vpn === 'Sim') requiredFields.push('vpn_configurada');
        if (data.necessita_impressora === 'Sim') requiredFields.push('impressoras_configuradas');
        if (softwares.includes("SAP B1")) requiredFields.push('usuario_sap_criado');
        if (softwares.includes("Salesforce")) requiredFields.push('perfil_salesforce_criado');
        if (data.sharepoint_pasta && data.sharepoint_pasta.trim() !== "") requiredFields.push('pastas_rede_liberadas');

        const missing = [];

        requiredFields.forEach(field => {
            const val = data[field];
            if (!val || val === "") {
                const label = getFieldLabel(field);
                missing.push(label);
            }
        });

        const reqEq = data.equipamentos_necessarios || [];
        const inventoryReq = reqEq.filter(eq => INVENTORY_TYPES.includes(eq));
        const defEq = data.equipamentos_definidos || {};

        inventoryReq.forEach(eq => {
            if (!defEq[eq]) missing.push(`Atribuição do item: ${eq}`);
        });

        const peripheralReq = reqEq.filter(eq => !INVENTORY_TYPES.includes(eq));
        const statusPerif = data.status_perifericos || {};
        peripheralReq.forEach(eq => {
            if (statusPerif[eq] !== "Sim") missing.push(`Entrega do item: ${eq}`);
        });

        if (data.conta_ad_criada === "Sim" && !data.detalhes_conta_ad) missing.push("Detalhes da Conta AD");
        if (data.email_corporativo_criado === "Sim" && !data.detalhes_email) missing.push("Detalhes do Email");
        if (requiredFields.includes('usuario_sap_criado') && data.usuario_sap_criado === "Sim" && !data.detalhes_sap) missing.push("Detalhes SAP");
        if (requiredFields.includes('perfil_salesforce_criado') && data.perfil_salesforce_criado === "Sim" && !data.detalhes_salesforce) missing.push("Detalhes Salesforce");
        if (requiredFields.includes('pastas_rede_liberadas') && data.pastas_rede_liberadas === "Sim" && !data.detalhes_rede) missing.push("Detalhes Rede");
        if (data.testes_gerais_realizados === "Sim" && !data.detalhes_testes) missing.push("Detalhes Testes");

        if (missing.length > 0) {
            alert(`TI: Por favor, complete os seguintes itens solicitados e seus detalhes:\n- ${missing.join("\n- ")}`);
            return false;
        }
        return true;
    }

    if (sectionId === 4) {
        const requiredFields: (keyof FormData)[] = [
            'confirma_recebimento_equipamentos',
            'confirma_funcionamento_acessos',
            'recebeu_orientacao_sistemas',
        ];

        const missing = requiredFields.filter(field => !data[field] || data[field] === "");

        if (missing.length > 0) {
            alert("Colaborador: Por favor, confirme todos os itens de recebimento/orientação antes de finalizar.");
            return false;
        }

        if (!data.termo_assinado) {
            alert("É necessário assinar o termo via DocuSign antes de finalizar o processo.");
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

interface AdmissaoFlowProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate: (data: any) => void;
    isReadOnly?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user?: any;
}

export function AdmissaoFlow({
    data,
    onUpdate,
    isReadOnly = false,
    user
}: AdmissaoFlowProps) {
    const [currentSection, setCurrentSection] = useState(data?.currentSection || 1);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [availableAssets, setAvailableAssets] = useState<any[]>([]);

    useEffect(() => {
        const fetchInventory = async () => {
            const { data } = await supabase
                .from('tech_assets')
                .select('id, asset_tag, model, device_type, status')
                .eq('status', 'available');

            if (data) setAvailableAssets(data);
        };
        fetchInventory();
    }, []);

    useEffect(() => {
        if (data?.currentSection && data.currentSection !== currentSection) {
            setCurrentSection(data.currentSection);
        }
    }, [data?.currentSection]);

    const [isCompleted, setIsCompleted] = useState(false);

    const userRole = user?.role;
    const isAdm = userRole === 'Adm';

    const sectionRoles: Record<number, string[]> = {
        1: ['RH'],
        2: ['Gestor'],
        3: ['TI'],
        4: ['Colaborador']
    };

    const allowedRoles = sectionRoles[currentSection] || [];
    const canEdit = !isReadOnly && (isAdm || allowedRoles.includes(userRole));
    const isSectionReadOnly = !canEdit;

    const handleSectionChange = (sectionId: number) => {
        setCurrentSection(sectionId);
    };

    const [isSigning, setIsSigning] = useState(false);

    const handleDocusignSign = async () => {
        setIsSigning(true);
        try {
            const { data, error } = await supabase.functions.invoke('docusign-termo-responsabilidade', {
                body: {
                    processId: data?.id,
                    signerName: form.getValues("nome_completo") || user?.name || "Colaborador",
                    signerEmail: user?.email || "colaborador@example.com",
                    equipmentList: form.getValues("equipamentos_necessarios")?.join(", "),
                    softwareList: form.getValues("softwares_necessarios")?.join(", "),
                    departmentName: form.getValues("setor_departamento")
                }
            });

            if (error) throw error;

            if (data?.error) {
                throw new Error(`Erro DocuSign: ${data.error} - ${data.details || ''}`);
            }

            if (data?.url) {
                window.open(data.url, '_blank');
                form.setValue("termo_assinado", true);
                alert("Redirecionando para DocuSign. Por favor assine o documento.");
            } else if (data?.envelopeId) {
                alert("Envelope enviado por e-mail! Verifique sua caixa de entrada.");
                form.setValue("termo_assinado", true);
            } else {
                throw new Error("Resposta inválida do DocuSign (Sem URL ou Envelope ID)");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("DocuSign Error:", error);
            alert(`Erro ao conectar com DocuSign: ${error.message || "Verifique se a função está deployada."}`);
        } finally {
            setIsSigning(false);
        }
    };

    const form = useForm<FormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(fullSchema) as any,
        defaultValues: {
            nome_completo: "",
            nome_exibicao: "",
            cpf: "",
            data_admissao: "",
            data_inicio: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tipo_contratacao: "" as any,
            setor_departamento: "",
            filial_unidade: "",
            gestor_direto: "",
            email_gestor: "",
            cargo_funcao: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            regime_trabalho: "" as any,
            regiao_comercial: "",
            observacoes_rh: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tipo_vaga: "" as any,
            buddy_mentor: "",
            equipamentos_necessarios: [],
            softwares_necessarios: [],
            acessos_necessarios: [],
            sharepoint_pasta: "",
            outros_acessos: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            necessita_impressora: undefined as any,
            observacoes_gestor: "",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            conta_ad_criada: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            email_corporativo_criado: undefined as any,
            licencas_microsoft365: [],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            vpn_configurada: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            softwares_instalados: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            usuario_sap_criado: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            perfil_salesforce_criado: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pastas_rede_liberadas: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            impressoras_configuradas: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            testes_gerais_realizados: undefined as any,
            observacoes_ti: "",
            detalhes_conta_ad: "",
            detalhes_email: "",
            detalhes_sap: "",
            detalhes_salesforce: "",
            detalhes_rede: "",
            detalhes_testes: "",
            equipamentos_definidos: {},
            status_perifericos: {},
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            confirma_recebimento_equipamentos: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            confirma_funcionamento_acessos: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recebeu_orientacao_sistemas: undefined as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sabe_solicitar_suporte: undefined as any,
            observacoes_colaborador: "",
            termo_assinado: false,
            ...data,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
    });

    const progress = (currentSection / sections.length) * 100;

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (canEdit) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onUpdate({ ...value, currentSection } as any);
            }
        });
        return () => subscription.unsubscribe();
    }, [form, currentSection, onUpdate, canEdit]);

    const handleSubmit = async (values: FormData) => {
        if (!canEdit) {
            alert("Você não tem permissão para salvar nesta etapa.");
            return;
        }

        setIsSendingEmail(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 600));

            if (!validateStep(currentSection, values)) return;

            let nextSection = currentSection;
            let successMessage = "";

            if (currentSection < sections.length) {
                nextSection = currentSection + 1;

                if (currentSection === 1) {
                    const templateParams = {
                        to_email: values.email_gestor,
                        nome_colaborador: values.nome_completo,
                        data_exame: values.data_inicio || "A definir",
                        hora_exame: "09:00",
                        local_exame: "RH/Sede",
                        tipo_exame: "Admissional",
                        link_checklist: window.location.href
                    };

                    emailjs.send(
                        import.meta.env.VITE_EMAILJS_SERVICE_ID,
                        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                        templateParams,
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                    ).then(() => {
                        console.log("Email Admissional enviado.");
                    }, (err) => {
                        console.error("Erro email admissional:", err);
                    });

                    successMessage = `Sucesso!\n\n1. Dados salvos no sistema.\n2. E-mail de notificação enviado para ${values.email_gestor || 'o gestor'}.\n\nO processo agora está na aba do Gestor.`;
                } else if (currentSection === 2) {
                    successMessage = "Configurações do Gestor salvas! O processo foi enviado para o TI configurar os acessos.";
                } else if (currentSection === 3) {
                    successMessage = "Configurações de TI concluídas! O checklist agora está pronto para a conferência final do Colaborador.";
                }
            } else {
                successMessage = "Processo concluído e salvo com sucesso!";
                setIsCompleted(true);

                // --- AUTOMATIC EMPLOYEE CREATION ---
                // Verifica se já existe para não duplicar
                const { data: existing } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('cpf', values.cpf)
                    .single();

                if (!existing) {
                    try {
                        // 1. Resolver Departamento
                        let deptId = null;
                        if (values.setor_departamento) {
                            const { data: dept } = await supabase
                                .from('departments')
                                .select('id')
                                .eq('name', values.setor_departamento)
                                .maybeSingle();

                            if (dept) deptId = dept.id;
                            else {
                                // Opcional: Criar departamento se não existir
                                const { data: newDept } = await supabase
                                    .from('departments')
                                    .insert({ name: values.setor_departamento, is_active: true })
                                    .select('id')
                                    .single();
                                if (newDept) deptId = newDept.id;
                            }
                        }

                        // 2. Resolver Cargo
                        let posId = null;
                        if (values.cargo_funcao) {
                            const { data: pos } = await supabase
                                .from('positions')
                                .select('id')
                                .eq('title', values.cargo_funcao)
                                .maybeSingle();

                            if (pos) posId = pos.id;
                            else {
                                // Criar cargo se não existir
                                const { data: newPos } = await supabase
                                    .from('positions')
                                    .insert({
                                        title: values.cargo_funcao,
                                        department_id: deptId, // Vincula ao departamento resolvido
                                        is_active: true
                                    })
                                    .select('id')
                                    .single();
                                if (newPos) posId = newPos.id;
                            }
                        }

                        // 3. Criar Funcionário
                        if (values.nome_completo) {
                            // Extrair email do campo detalhes se houver
                            const corporateEmail = values.detalhes_email && values.detalhes_email.includes('@')
                                ? values.detalhes_email
                                : null;

                            const { error: createErr } = await supabase.from('employees').insert({
                                full_name: values.nome_completo,
                                cpf: values.cpf,
                                email: corporateEmail || values.email_gestor, // Fallback
                                admission_date: values.data_admissao,
                                department_id: deptId,
                                position_id: posId,
                                status: 'active', // STATUS ATIVO
                                // Campos opcionais que não temos no form, deixar null ou default
                            });

                            if (createErr) {
                                console.error("Erro ao criar funcionário automático:", createErr);
                                toast.error("Erro ao sincronizar com lista de funcionários.");
                            } else {
                                toast.success("Funcionário adicionado à lista da comunidade!");
                            }
                        }
                    } catch (err) {
                        console.error("Erro na automação de funcionário:", err);
                    }
                }
            }

            setCurrentSection(nextSection);
            onUpdate({ ...values, currentSection: nextSection });

            setTimeout(() => {
                alert(successMessage);
            }, 100);

            if (currentSection === 3) {
                // Asset Assignment Logic
                const assignedAssets = form.getValues("equipamentos_definidos") || {};
                const employeeName = form.getValues("nome_completo");

                for (const [_, assetTag] of Object.entries(assignedAssets)) {
                    if (assetTag && typeof assetTag === 'string') {
                        const { error } = await supabase
                            .from('tech_assets')
                            .update({
                                status: 'in_use',
                                assigned_to_name: employeeName,
                                location: form.getValues("setor_departamento") as string
                            })
                            .eq('asset_tag', assetTag);

                        if (error) console.error("Error assigning asset:", error);
                    }
                }

                // --- AUTOMATIC EMPLOYEE CREATION ---
                // Only create if we are finalizing (moving to section 4 completion or similar trigger)
                // Actually, currentSection === 3 means we are moving to 4 (Colaborador).
                // The process is "Completed" when Colaborador finishes (Section 4).
                // But the code above sets isCompleted = true when currentSection is NOT < sections.length.
                // Reset/Check logic:
                // sections.length = 4.
                // If currentSection = 4 (Colaborador), nextSection would be 5 (which is else block).
                // So this "else" block (lines 457-460 in original) is where "isCompleted" becomes true.
                // We should add the creation logic THERE.
            }

        } catch (error) {
            console.error("Erro crítico no handleSubmit:", error);
            alert("Ocorreu um erro ao salvar os dados.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const getButtonText = () => {
        if (isSendingEmail) return "Processando...";
        switch (currentSection) {
            case 1: return "Enviar ao Gestor";
            case 2: return "Enviar para TI";
            case 3: return "Enviar para Colaborador";
            case 4: return "Finalizar Admissão";
            default: return "Salvar";
        }
    };

    return (
        <div className="space-y-6">
            {!canEdit && !isCompleted && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-sm" role="alert">
                    <p className="font-bold">Modo de Visualização</p>
                    <p>Você não tem permissão para editar esta etapa ({sections.find(s => s.id === currentSection)?.role}).</p>
                </div>
            )}

            {isCompleted ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="bg-green-100 p-6 rounded-full">
                        <CheckCircle2 className="w-16 h-16 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Processo Finalizado!</h2>
                        <p className="text-gray-600 max-w-md mx-auto mt-2">
                            O checklist de admissão foi concluído com sucesso. Todos os departamentos validaram as etapas e o termo foi assinado.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => window.location.href = '/'}>
                            Voltar ao Início
                        </Button>
                        <Button className="bg-rose-gold text-white" onClick={() => setIsCompleted(false)}>
                            Revisar Respostas
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <Card className="border-rose-gold/20 bg-gradient-to-r from-rose-gold/5 to-transparent shadow-soft">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-serif text-rose-gold-dark flex items-center gap-2">
                                        <User className="h-6 w-6 text-rose-gold" />
                                        MEDBEAUTY — Checklist de Admissão
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Formulário oficial de admissão.
                                        <br />
                                        <span className="text-xs font-medium mt-1 inline-block">
                                            Fluxo: RH → Gestor → TI → Colaborador
                                        </span>
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-sm px-3 py-1 border-rose-gold/30 text-rose-gold-dark bg-rose-gold/5">
                                    Seção {currentSection} de {sections.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    {sections.map((section) => {
                                        const status = getSectionStatus(section.id, currentSection);
                                        return (
                                            <div
                                                key={section.id}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer ${section.id === currentSection
                                                    ? "bg-rose-gold text-white shadow-md"
                                                    : status === 'completed'
                                                        ? "text-sage-dark bg-sage/10 hover:bg-sage/20"
                                                        : "text-muted-foreground hover:bg-rose-gold/10 hover:text-rose-gold-dark"
                                                    }`}
                                                onClick={() => handleSectionChange(section.id)}
                                            >
                                                <section.icon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{section.role}</span>
                                                {status === 'completed' && <Check className="w-3 h-3 ml-1" />}
                                                {status === 'current' && <Clock className="w-3 h-3 ml-1 animate-pulse" />}
                                            </div>
                                        );
                                    })}
                                </div>
                                <Progress value={progress} className="h-1 bg-rose-gold/20" indicatorClassName="bg-rose-gold" />
                            </div>
                        </CardContent>
                    </Card>

                    <Form {...form}>
                        {currentSection === 1 && (
                            <StepRH form={form} isReadOnly={isSectionReadOnly} />
                        )}

                        {currentSection === 2 && (
                            <StepGestor form={form} isReadOnly={isSectionReadOnly} />
                        )}

                        {currentSection === 3 && (
                            <StepTI form={form} isReadOnly={isSectionReadOnly} availableAssets={availableAssets} />
                        )}

                        {currentSection === 4 && (
                            <StepColaborador
                                form={form}
                                isReadOnly={isSectionReadOnly}
                                onSign={handleDocusignSign}
                                isSigning={isSigning}
                            />
                        )}

                        <div className="flex justify-between mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setCurrentSection(Math.max(1, currentSection - 1))}
                                disabled={currentSection === 1}
                            >
                                Voltar
                            </Button>
                            <Button
                                type="button"
                                onClick={form.handleSubmit(handleSubmit)}
                                className="bg-rose-gold text-white hover:bg-rose-gold-dark"
                                disabled={isSendingEmail || !canEdit}
                            >
                                {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                                {isSendingEmail ? (
                                    <>
                                        <Send className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {getButtonText()}
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </>
            )}
        </div>
    );
}
