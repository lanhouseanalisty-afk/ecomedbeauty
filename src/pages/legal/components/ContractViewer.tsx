import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { diffWords } from 'diff';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    Loader2, Save, Send, FileText, CheckCircle2, History, MessageSquare, AlertTriangle, ArrowLeft, Upload, PenTool, Edit, Sparkles, CheckCircle,
    Calendar, Clock, Download, MoreVertical, Plus, Share2, User, AlertCircle, FileUp, Eye, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ContractAIWizard } from "./ContractAIWizard"; // Keep this import

const DiffContent = ({ oldText, newText }: { oldText: string, newText: string }) => {
    const diff = diffWords(oldText || '', newText || '');

    return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed p-4 bg-white rounded-md border">
            {diff.map((part, index) => {
                if (part.added) {
                    return (
                        <span key={index} className="bg-blue-100 text-blue-700 font-medium px-0.5 rounded border border-blue-200">
                            {part.value}
                        </span>
                    );
                }
                if (part.removed) {
                    // Optional: Show removed text with strikethrough
                    // return <span key={index} className="text-red-400 line-through text-xs px-0.5 decoration-red-300">{part.value}</span>;
                    return null; // Per user request, mostly highlight additions (edits). But knowing what was removed is useful. 
                    // User said "edits... in blue". Usually implies "Changed To".
                    // I will hide removed for cleanliness unless requested.
                }
                return <span key={index} className="text-gray-700">{part.value}</span>;
            })}
        </div>
    );
};

export default function ContractViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState("");
    const [returnComment, setReturnComment] = useState("");
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [uploadingVersion, setUploadingVersion] = useState(false);
    const [activeTab, setActiveTab] = useState(
        searchParams.get('tab') === 'minuta' ? "minuta" : "overview"
    );
    const [userIsDrafting, setUserIsDrafting] = useState(false);
    const [draftText, setDraftText] = useState("");
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [lastSavedText, setLastSavedText] = useState("");
    const [isSigningDialogOpen, setIsSigningDialogOpen] = useState(false);
    const [signers, setSigners] = useState<{ email: string }[]>([]);
    const [newSignerEmail, setNewSignerEmail] = useState("");

    const { user, roles: authRoles } = useAuth();

    // Robust isLegal check matching LegalDashboard.tsx
    const { data: isLegal } = useQuery({
        queryKey: ['is-legal-member-viewer', user?.id],
        queryFn: async () => {
            if (!user?.id) return false;

            // 1. Check roles
            if (authRoles.some(role => ['admin', 'legal_manager'].includes(role))) return true;

            // 2. Check department
            const { data: memberDepts } = await supabase
                .from('department_members')
                .select('departments!inner(code)')
                .eq('user_id', user.id);

            return memberDepts?.some(d =>
                d.departments?.code?.toLowerCase() === 'juridico' ||
                d.departments?.code?.toUpperCase() === 'JUR'
            );
        }
    });

    const isLegalView = (
        location.pathname.includes('/juridico') ||
        location.pathname.includes('/legal/') ||
        location.pathname.includes('/crm/contrato')
    ) && isLegal;

    // Helper to render the Overview Dashboard (IA, Info, etc.)
    // Defined later after hook declarations

    // New Version Upload Mutation
    const handleNewVersionUpload = useMutation({
        mutationFn: async (file: File) => {
            setUploadingVersion(true);
            try {
                const user = (await supabase.auth.getUser()).data.user;
                if (!user) throw new Error("Não autenticado");

                // 1. Upload File
                const fileExt = file.name.split('.').pop();
                const fileName = `${id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);

                // Update Document URL on Contract
                const { error: updateError } = await supabase.from('legal_contracts')
                    .update({
                        document_url: publicUrlData.publicUrl,
                        status: 'legal_review' // Auto move to legal review on upload
                    })
                    .eq('id', id);

                if (updateError) throw updateError;

            } catch (error: any) {
                console.error(error);
                throw new Error(error.message || "Erro no upload.");
            } finally {
                setUploadingVersion(false);
            }
        },
        onSuccess: () => {
            toast.success("Nova versão enviada com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    // Fetch Contract Details
    const { data: contract, isLoading, isError, error } = useQuery({
        queryKey: ['contract', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('legal_contracts')
                .select('*, requester_id:responsible_id, department:department_id(name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as any;
        }
    });

    // Auto-switch to minuta tab for review
    useEffect(() => {
        if (contract?.status === 'draft') {
            setActiveTab("minuta");
        }
    }, [contract?.id, contract?.status]);

    // Fetch Requester Profile
    const { data: requesterProfile } = useQuery({
        queryKey: ['profile', contract?.responsible_id],
        queryFn: async () => {
            if (!contract?.responsible_id) return null;
            const { data, error } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', contract.responsible_id)
                .single();
            if (error) return null;
            return data;
        },
        enabled: !!contract?.responsible_id
    });

    // Fetch Requester Departments
    const { data: requesterDepartments } = useQuery({
        queryKey: ['requester-departments', contract?.responsible_id],
        queryFn: async () => {
            if (!contract?.responsible_id) return null;
            const { data, error } = await supabase
                .from('department_members')
                .select(`
                    department_id,
                    departments (name)
                `)
                .eq('user_id', contract.requester_id);
            if (error) return null;
            return data;
        },
        enabled: !!contract?.requester_id
    });

    // Fetch Current User Departments
    const { data: userDepartments } = useQuery({
        queryKey: ['user-departments', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const { data, error } = await supabase
                .from('department_members')
                .select('department_id')
                .eq('user_id', user.id);
            if (error) return null;
            return data;
        },
        enabled: !!user?.id
    });

    // Fetch Comments
    const { data: contractComments } = useQuery({
        queryKey: ['contract-comments', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contract_comments')
                .select(`
                    *,
                    user:user_id ( full_name, avatar_url )
                `)
                .eq('contract_id', id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });

    // Fetch Revisions
    const { data: revisions } = useQuery({
        queryKey: ['contract-revisions', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('contract_revisions')
                .select('*')
                .eq('contract_id', id)
                .order('version_number', { ascending: false });
            if (error) return []; // Fail silently or return empty if table missing
            return data;
        },
        enabled: !!id
    });

    const isInSameSector = userDepartments?.some(ud =>
        requesterDepartments?.some(rd => ud.department_id === rd.department_id)
    );

    const isRequester = contract?.responsible_id === user?.id;
    // defines who has the ball: 
    // - requested/legal_review: Legal has it
    // - draft: Sector has it (including requester)
    const canEdit = (isLegal && ['requested', 'legal_review', 'draft'].includes(contract?.status || '')) ||
        (isInSameSector && contract?.status === 'draft');

    const canDelete = isLegal && ['requested', 'draft', 'legal_review'].includes(contract?.status || '');

    const isReviewMode = (isRequester || isInSameSector) && contract?.status === 'draft';

    // Send Comment Mutation
    const sendComment = useMutation({
        mutationFn: async (content?: string) => {
            const textToSend = typeof content === 'string' ? content : commentText;
            if (!textToSend.trim()) return;

            const user = (await supabase.auth.getUser()).data.user;
            const { error } = await supabase.from('contract_comments').insert({
                contract_id: id,
                user_id: user?.id,
                content: textToSend
            });

            if (error) throw error;
        },
        onSuccess: () => {
            setCommentText("");
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            queryClient.invalidateQueries({ queryKey: ['contract-comments', id] });
            toast.success("Comentário enviado!");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao enviar comentário.");
        }
    });

    const handleConfirmReturn = async () => {
        if (!returnComment.trim()) {
            toast.error("Por favor, informe o motivo da devolução.");
            return;
        }

        try {
            // Create Revision Snapshot (Current State) BEFORE sending back
            if (contract?.description) {
                const nextVersion = (revisions?.length || 0) + 1;
                const { error: revError } = await supabase.from('contract_revisions').insert({
                    contract_id: id,
                    version_number: nextVersion,
                    content: contract.description,
                    uploaded_by: user?.id,
                    comments: `Devolvido ao solicitante: ${returnComment}`
                });

                if (revError) {
                    console.error("Error creating revision:", revError);
                    // Warning but proceed
                    toast.warning("Não foi possível salvar a versão para histórico (verifique migração), mas o retorno será processado.");
                } else {
                    queryClient.invalidateQueries({ queryKey: ['contract-revisions', id] });
                }
            }

            await sendComment.mutateAsync(returnComment);
            await updateStatus.mutateAsync('draft');
            setIsReturnDialogOpen(false);
            setReturnComment("");
        } catch (error) {
            console.error("Error returning:", error);
            toast.error("Erro ao devolver contrato.");
        }
    };

    /*
    // Auto-replace variables in Draft Text -> DISABLED to preserve dynamic variable links
    useEffect(() => {
        if (!contract || !draftText) return;

        let newText = draftText;
        let hasChanges = false;

        const replacements: Record<string, string | undefined> = {
            '{{CONTRATADO_NOME}}': contract.party_name || contract.contractor_name,
            '{{CONTRATADO_DOC}}': contract.party_document || contract.contractor_cnpj,
            '{{CONTRATADO_ENDERECO}}': contract.party_address || contract.contractor_address || "Endereço não informado",
            '{{DATA_INICIO}}': contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : "___/___/____",
            '{{VALOR}}': contract.value ? contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "R$ 0,00",
            '{{CONTRATANTE_NOME}}': "SKINSTORE S.A.", // Hardcoded or from config
            '{{CONTRATANTE_DOC}}': "12.979.552/0001-72", // Hardcoded or from config
            '{{CONTRATANTE_ENDERECO}}': "Rua Gomes de Carvalho, 1356, Vila Olímpia, São Paulo/SP",
            '{{CIDADE}}': "São Paulo",
            // Add other variables as needed
        };

        // Also try to replace Requester Name if we have the profile
        if (requesterProfile?.full_name) {
             replacements['{{SOLICITANTE_NOME}}'] = requesterProfile.full_name;
        }

        Object.entries(replacements).forEach(([key, value]) => {
            if (value && newText.includes(key)) {
                // Global replace
                const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); // Escape special chars for regex
                newText = newText.replace(regex, value);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            setDraftText(newText);
            // Optionally save immediately or just let the user save
            // saveDraft.mutate(newText); // Better to let user review first or autosave
        }

    }, [contract, requesterProfile, draftText]); 
    */
    // Note: putting draftText in dependency might cause loop if we don't check for changes rigorously.
    // The check `if (hasChanges)` prevents infinite loop ONLY IF the replacements remove the keys.
    // If keys remain (e.g. {{MISSING}}), it won't loop. 
    // But if we replace {{KEY}} with "Value", next run "Value" doesn't have {{KEY}}, so it stops. Correct.

    // Delete Contract Mutation
    const deleteContract = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from('legal_contracts').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Contrato excluído com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contracts-list'] });
            navigate("/crm/juridico");
        },
        onError: (error: any) => toast.error(`Erro ao excluir: ${error.message}`)
    });

    // Real DocuSign Integration
    const sendToDocuSign = useMutation({
        mutationFn: async (signerEmails: string[]) => {
            // Invokes the real DocuSign edge function
            const { data, error } = await supabase.functions.invoke('docusign-contracts', {
                body: {
                    signerName: signerEmails[0]?.split('@')[0] || "Signatário", // Basic fallback for name
                    signerEmail: signerEmails[0],
                    contractTitle: contract?.title,
                    contractContent: draftText || contract?.description
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);

            if (data?.url) {
                // Update local status before redirecting
                const { error: updateError } = await supabase
                    .from('legal_contracts')
                    .update({
                        status: 'signing',
                        docusign_id: data.envelopeId,
                        signer_emails: signerEmails
                    })
                    .eq('id', id);

                if (updateError) throw updateError;

                return data.url;
            } else {
                throw new Error("Resposta inválida do DocuSign (URL ausente)");
            }
        },
        onSuccess: (url) => {
            toast.success("Redirecionando para assinatura via DocuSign...");
            setIsSigningDialogOpen(false);
            // Redirect to DocuSign signing page
            setTimeout(() => {
                window.location.href = url;
            }, 1000);
        },
        onError: (error: any) => {
            console.error("DocuSign error:", error);
            toast.error(`Erro ao enviar para DocuSign: ${error.message}`);
        }
    });

    // Mock Finalize Integration
    const finalizeContract = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('legal_contracts')
                .update({ status: 'active' })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success("Contrato finalizado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    // Workflow Transitions
    const updateStatus = useMutation({
        mutationFn: async (newStatus: string) => {
            const payload: any = { status: newStatus };

            // Se o jurídico está assumindo ou enviando pra assinatura, marca ele como responsável
            if (isLegal && ['legal_review', 'signing', 'active'].includes(newStatus)) {
                payload.responsible_legal_id = user?.id;
            }

            const { error: updateError } = await supabase.from('legal_contracts').update(payload).eq('id', id);
            if (updateError) throw updateError;

            // Create notification using unified intelligent route
            const notificationLink = `/crm/contrato/${id}`;

            if (newStatus === 'draft' && contract?.responsible_id) {
                // Notifying requester
                await supabase.from('notifications').insert({
                    user_id: contract.requester_id,
                    title: "Minuta enviada para sua revisão",
                    description: `O Jurídico enviou a minuta de "${contract.title}" para seus ajustes.`,
                    type: 'request',
                    link: notificationLink
                });
            } else if (newStatus === 'legal_review' && contract?.responsible_legal_id) {
                // Notifying legal responsible
                await supabase.from('notifications').insert({
                    user_id: contract.responsible_legal_id,
                    title: "Ajustes realizados pelo Solicitante",
                    description: `O solicitante devolveu o contrato "${contract.title}" para sua revisão final.`,
                    type: 'request',
                    link: notificationLink
                });
            }
        },
        onSuccess: () => {
            toast.success("Status atualizado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    // Initialize draft text
    useEffect(() => {
        if (contract?.description && draftText === "") {
            setDraftText(contract.description);
            setLastSavedText(contract.description);
        }
    }, [contract?.description]);

    // Auto-save Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (draftText !== lastSavedText && draftText !== "") {
                saveDraft.mutate(draftText);
            }
        }, 2000);

        return () => clearTimeout(delayDebounceFn);
    }, [draftText, lastSavedText]);

    // Save Draft Mutation
    const saveDraft = useMutation({
        mutationFn: async (text: string) => {
            setIsSavingDraft(true);
            const { error } = await supabase
                .from('legal_contracts')
                .update({ description: text })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            setLastSavedText(variables);
            setIsSavingDraft(false);
            // Updating cache locally
            queryClient.setQueryData(['contract', id], (old: any) => ({
                ...old,
                description: variables // Frontend might be aliasing this, so we keep updating the UI state
            }));
        },
        onError: (error) => {
            setIsSavingDraft(false);
            toast.error(`Erro ao salvar: ${error.message}`);
        }
    });

    // Helper to replace variables
    const processContractText = (text: string) => {
        if (!text || !contract) return text;
        let newText = text;
        const replacements: Record<string, string | undefined> = {
            '{{CONTRATADO_NOME}}': contract.party_name || contract.contractor_name,
            '{{CONTRATADO_DOC}}': contract.party_document || contract.contractor_cnpj,
            '{{CONTRATADO_ENDERECO}}': contract.party_address || contract.contractor_address || "Endereço não informado",
            '{{DATA_INICIO}}': contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : "___/___/____",
            '{{VALOR}}': contract.value ? contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "R$ 0,00",
            '{{CONTRATANTE_NOME}}': "SKINSTORE S.A.",
            '{{CONTRATANTE_DOC}}': "12.979.552/0001-72",
            '{{CONTRATANTE_ENDERECO}}': "Rua Gomes de Carvalho, 1356, Vila Olímpia, São Paulo/SP",
            '{{CIDADE}}': "São Paulo",
            '{{SOLICITANTE_NOME}}': requesterProfile?.full_name,
            // Bracket support
            '[CONTRATADO_NOME]': contract.party_name || contract.contractor_name,
            '[CONTRATADO_DOC]': contract.party_document || contract.contractor_cnpj,
            '[DATA_INICIO]': contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : "___/___/____",
            '[VALOR]': contract.value ? contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "R$ 0,00",
            // Variations with spaces (common in some templates)
            '[CONTRATADO NOME]': contract.party_name || contract.contractor_name,
            '[CONTRATADO DOC]': contract.party_document || contract.contractor_cnpj,
            '[CONTRATADO ENDERECO]': contract.party_address || contract.contractor_address || "Endereço não informado",
            '[DATA INICIO]': contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : "___/___/____",
            // Specific variations from templates (with spaces and truncated)
            '[ CONTRATADO N ]': contract.party_name || contract.contractor_name,
            '[ CONTRATADO I ]': contract.party_document || contract.contractor_cnpj,
            '[ CONTRATADO ENDE ]': contract.party_address || contract.contractor_address || "Endereço não informado",
            '[ CONTRATADO REPRESENT ]': "Representante Legal",
            // User requested specific field
            'Contratado_cnpj': contract.party_document || contract.contractor_cnpj,
            '[Contratado_cnpj]': contract.party_document || contract.contractor_cnpj,
            '{{Contratado_cnpj}}': contract.party_document || contract.contractor_cnpj,
            // Lowercase variations just in case
            '{{contratado_nome}}': contract.party_name || contract.contractor_name,
            // Global CNPJ Fallback (Replace old placeholder with new main CNPJ)
            '49.333.327/0001-90': "12.979.552/0001-72",
        };

        Object.entries(replacements).forEach(([key, value]) => {
            if (value) {
                // Escape key for regex
                const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Case insensitive replacement
                const regex = new RegExp(escapedKey, 'gi');
                if (regex.test(newText)) {
                    newText = newText.replace(regex, value);
                }
            }
        });
        return newText;
    };

    // Initialize Draft Text (Keep variables dynamic, do not process)
    useEffect(() => {
        if (contract && !draftText) {
            const initialText = contract.description || contract.terms_summary || "";
            if (initialText) {
                // Do NOT process here. Keep {{VARIABLES}} in the text so they are dynamic.
                // const processed = processContractText(initialText);
                setDraftText(initialText);
                setLastSavedText(initialText);
            }
        }
    }, [contract, requesterProfile]); // Run when contract or profile loads

    // Helper to render the Overview Dashboard (IA, Info, etc.)
    const renderOverviewDashboard = () => {
        if (!contract) return null;

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Status Atual</CardTitle>
                            <div className={`p-1.5 rounded-full ${['active', 'signing'].includes(contract.status) ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                <CheckCircle className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                {contract.status === 'requested' && 'Solicitado'}
                                {contract.status === 'drafting' && 'Em Minuta'}
                                {contract.status === 'pending_approval' && 'Aprovação'}
                                {contract.status === 'legal_review' && 'Análise Jurídica'}
                                {contract.status === 'signing' && 'Em Assinatura'}
                                {contract.status === 'active' && 'Vigente'}
                                {contract.status === 'expired' && 'Expirado'}
                                {contract.status === 'terminated' && 'Rescindido'}
                                {contract.status === 'draft' && 'Rascunho'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {contract.status === 'legal_review' ? 'Aguardando parecer.' : 'Processo em andamento.'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Download Card */}
                    <Card className={contract.current_version_url || contract.document_url ? "bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100" : "bg-gradient-to-br from-white to-slate-50 border-slate-200"}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Arquivo Oficial</CardTitle>
                            <div className={`p-1.5 rounded-full ${contract.current_version_url || contract.document_url ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                <FileText className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {contract.current_version_url || contract.document_url ? (
                                <div>
                                    <div className="text-2xl font-bold text-slate-900 mb-2">Disponível</div>
                                    <Button variant="outline" size="sm" className="w-full gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors" onClick={() => window.open(contract.current_version_url || contract.document_url, '_blank')}>
                                        <Download className="h-3.5 w-3.5" />
                                        Baixar PDF
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-lg font-medium text-slate-500">Pendente</div>
                                    <p className="text-xs text-muted-foreground mt-1">Ainda não há versão final.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* AI Analysis Section */}
                {contract.description && contract.description.length > 50 && (
                    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white shadow-sm overflow-hidden mt-4">
                        <CardHeader className="pb-3 border-b border-indigo-100/50">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Sparkles className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        MedBeauty Legal AI™
                                        <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] tracking-wider font-semibold px-2 py-0.5 border-indigo-200">BETA</Badge>
                                    </CardTitle>
                                    <CardDescription className="text-indigo-600/80 font-medium">
                                        Análise de Conformidade e Risco Contratual
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-emerald-600">92/100</div>
                                    <div className="text-xs font-medium text-emerald-700">Índice de Segurança</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="rounded-lg bg-white border border-indigo-100 p-4 shadow-sm">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-slate-500" />
                                    Resumo Executivo
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {contract.ai_analysis || "O contrato apresenta baixo risco legal. As cláusulas de vigência e rescisão estão claras, porém recomenda-se atenção à multa rescisória que está abaixo da média de mercado (10%). As partes estão devidamente qualificadas."}
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold ml-1">Financeiro</h4>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 block">Valor e Pagamento</span>
                                            <span className="text-xs text-gray-500">Definição clara de valores (R$ {typeof contract.value === 'number' ? contract.value.toLocaleString('pt-BR') : '0,00'}) e prazos.</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold ml-1">Jurídico</h4>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                        <div>
                                            <span className="text-sm font-medium text-gray-900 block">Vigência</span>
                                            <span className="text-xs text-gray-500">Datas de início e fim ({contract.renewal_alert_days || 30} dias de aviso) bem definidas.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center">Carregando detalhes...</div>;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h2 className="text-xl font-bold">Erro ao carregar contrato</h2>
                <p className="text-muted-foreground">{(error as any)?.message || "Ocorreu um erro inesperado."}</p>
                <Button onClick={() => navigate("/crm/juridico")}>Voltar para o Dashboard</Button>
            </div>
        );
    }

    if (!contract) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <FileText className="h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-bold">Contrato não encontrado</h2>
                <p className="text-muted-foreground">O contrato solicitado pode ter sido removido ou você não tem permissão para vê-lo.</p>
                <Button onClick={() => navigate("/crm/juridico")}>Voltar para o Dashboard</Button>
            </div>
        );
    }

    if (isReviewMode) {
        return (
            <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Focus Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Necessita seu Ajuste
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold font-serif text-slate-900 leading-tight">
                                {contract.title}
                            </h1>
                            <p className="text-slate-500">
                                O Jurídico devolveu este contrato para seus ajustes finais na minuta.
                            </p>
                        </div>
                    </div>

                    {/* Main Focus Area - Minuta */}
                    <Card className="border-indigo-100 shadow-xl shadow-indigo-500/5 overflow-hidden">
                        <CardHeader className="bg-white border-b border-slate-100 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="h-5 w-5 text-indigo-500" />
                                Minuta do Contrato
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                Última alteração: {new Date(contract.updated_at).toLocaleString()}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="bg-white p-6 md:p-10 min-h-[600px]">
                                {canEdit ? (
                                    <div className="space-y-6">
                                        {/* Contract Editor Container */}
                                        <div className="relative border rounded-xl bg-slate-50 shadow-inner overflow-hidden min-h-[600px] flex flex-col focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                            <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-200 text-xs font-medium text-slate-500">
                                                <PenTool className="h-4 w-4 text-indigo-400" />
                                                Editor de Minuta
                                            </div>
                                            <Textarea
                                                value={draftText || contract.description || ""}
                                                onChange={(e) => {
                                                    setDraftText(e.target.value);
                                                    setUserIsDrafting(true);
                                                }}
                                                className="flex-1 p-6 font-serif text-lg leading-relaxed border-none focus-visible:ring-0 resize-none bg-transparent"
                                                placeholder="Escreva o conteúdo do contrato aqui..."
                                            />
                                        </div>

                                        {/* Live Diff Preview for Drafters */}
                                        {(revisions && revisions.length > 0 && revisions[0].content) && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between px-1">
                                                    <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                        Prévia de Alterações (Destaques em Azul)
                                                    </h4>
                                                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100">DIFERENÇAS VS VERSÃO ANTERIOR</Badge>
                                                </div>
                                                <div className="border border-blue-100 rounded-xl overflow-hidden shadow-sm">
                                                    <DiffContent
                                                        oldText={revisions[0].content}
                                                        newText={draftText || contract.description || ""}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Simple Info Alert */}
                                        <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-800">
                                            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-sm">Instruções de Revisão</h4>
                                                <p className="text-sm opacity-90">Revise as alterações e utilize o botão abaixo para enviar de volta ao jurídico. Você pode editar o texto livremente agora.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose max-w-none font-serif text-lg leading-relaxed">
                                        {/* Show Diff if in Legal Review OR Draft and we have a previous version to compare */}
                                        {((contract.status === 'legal_review' || contract.status === 'draft') && revisions && revisions.length > 0 && revisions[0].content) ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 shadow-sm">
                                                    <History className="h-5 w-5" />
                                                    <span>Visualizando alterações sugeridas pelo Jurídico (em azul).</span>
                                                </div>
                                                <DiffContent
                                                    oldText={revisions[0].content}
                                                    newText={contract.description || ''}
                                                />
                                            </div>
                                        ) : (
                                            processContractText(contract?.description || contract?.terms_summary || "Sem conteúdo textual.")
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Final Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
                        {canEdit && userIsDrafting && (
                            <Button
                                onClick={() => saveDraft.mutate(draftText)}
                                disabled={saveDraft.isPending}
                                className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 gap-2 h-14 px-8 text-lg font-semibold shadow-lg shadow-indigo-500/5 transition-all"
                            >
                                {saveDraft.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                Salvar Alterações
                            </Button>
                        )}

                        <Button
                            onClick={() => updateStatus.mutate('legal_review')}
                            disabled={updateStatus.isPending}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white gap-3 h-14 px-12 text-lg font-bold shadow-xl shadow-purple-500/20 transform hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                        >
                            <Send className="h-6 w-6" />
                            Devolver ao Jurídico para Finalização
                        </Button>
                    </div>

                    {/* Footer Nav */}
                    <div className="flex justify-center pt-4">
                        <Button variant="link" onClick={() => {
                            const pathParts = location.pathname.split('/');
                            const contratoIndex = pathParts.indexOf('contrato');
                            if (contratoIndex > 1) {
                                const sectorPath = pathParts.slice(0, contratoIndex).join('/');
                                if (sectorPath === '/crm') {
                                    navigate('/crm/juridico/contratos');
                                } else {
                                    navigate(sectorPath + '/contratos');
                                }
                            } else {
                                navigate('/crm/intranet/contratos');
                            }
                        }} className="text-slate-400 hover:text-slate-600 text-sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar ao Gerenciamento de Contratos
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Se for Jurídico, nunca mostramos a tela de bloqueio "Aguardando Análise"
    if (!isLegalView && !isReviewMode && !isLegal) {
        return (
            <div className="container mx-auto p-6 space-y-6 animate-in fade-in">
                <Button variant="ghost" size="sm" onClick={() => {
                    const pathParts = location.pathname.split('/');
                    const contratoIndex = pathParts.indexOf('contrato');
                    if (contratoIndex > 1) {
                        const sectorPath = pathParts.slice(0, contratoIndex).join('/');
                        if (sectorPath === '/crm') {
                            navigate('/crm/juridico/contratos');
                        } else {
                            navigate(sectorPath + '/contratos');
                        }
                    } else {
                        navigate('/crm/juridico/contratos');
                    }
                }} className="text-slate-500 mb-4 transition-colors hover:text-indigo-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para minhas solicitações
                </Button>

                <div className="max-w-3xl mx-auto py-12 text-center space-y-8">
                    <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-inner relative">
                        <Clock className="h-12 w-12 animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{contract.title}</h1>
                        <div className="flex justify-center gap-4 items-center">
                            <Badge variant="secondary" className="px-6 py-2 text-md font-bold bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 uppercase tracking-wider">
                                {contract.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-slate-400 font-medium">SAP ID: {contract.sap_request_id || "N/A"}</span>
                        </div>
                    </div>

                    <Card className="border-indigo-100 shadow-2xl shadow-indigo-500/10 bg-white overflow-hidden">
                        <div className="h-2 bg-indigo-600 w-full" />
                        <CardContent className="pt-12 pb-12 space-y-6">
                            <div className="flex justify-center flex-col items-center gap-4">
                                <FileText className="h-20 w-20 text-indigo-600/20" />
                                <p className="text-2xl text-slate-800 font-bold">
                                    Aguardando Análise Jurídica
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-4 max-w-lg mx-auto">
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    Este contrato está sendo processado pelo time jurídico. Nenhuma ação é necessária de sua parte agora.
                                </p>
                                <div className="h-px bg-slate-200 w-full" />
                                <p className="text-indigo-600 font-semibold flex items-center justify-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Você será notificado assim que a minuta estiver disponível para sua revisão.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="pt-6">
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => {
                                const pathParts = location.pathname.split('/');
                                const contratoIndex = pathParts.indexOf('contrato');
                                if (contratoIndex > 1) {
                                    const sectorPath = pathParts.slice(0, contratoIndex).join('/');
                                    if (sectorPath === '/crm') {
                                        navigate('/crm/intranet/contratos');
                                    } else {
                                        navigate(sectorPath + '/contratos');
                                    }
                                } else {
                                    navigate('/crm/intranet/contratos');
                                }
                            }}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-8 py-6 text-lg font-medium transition-all"
                        >
                            Voltar ao Dashboard
                        </Button>
                    </div>

                    {/* Restored Overview Content for Requesters - Balanced Status Gate */}
                    <div className="mt-12 text-left space-y-6 pt-12 border-t">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                            <h2 className="text-xl font-bold text-slate-800">Detalhes & Inteligência do Contrato</h2>
                        </div>
                        {renderOverviewDashboard()}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in">
            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
                <div className="flex items-start md:items-center gap-4 w-full xl:w-auto">
                    <Button variant="ghost" size="icon" onClick={() => {
                        const pathParts = location.pathname.split('/');
                        const contratoIndex = pathParts.indexOf('contrato');
                        if (contratoIndex > 1) {
                            const sectorPath = pathParts.slice(0, contratoIndex).join('/');
                            if (sectorPath === '/crm') {
                                navigate('/crm/intranet/contratos');
                            } else {
                                navigate(sectorPath + '/contratos');
                            }
                        } else {
                            navigate('/crm/intranet/contratos');
                        }
                    }} className="shrink-0 mt-1 md:mt-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold font-serif text-gray-900 leading-tight">{contract.title}</h1>
                            <Badge variant="outline" className="whitespace-nowrap">{contract.status.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">SAP ID: {contract.sap_request_id || contract.payment_terms || "N/A"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">

                    {/* Fast Upload Option */}
                    {canEdit && (
                        <Button
                            variant="outline"
                            className="gap-2 border-dashed border-blue-200 text-blue-700 hover:bg-blue-50 whitespace-nowrap w-full"
                            onClick={() => document.getElementById('new-version-upload')?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Anexar Documento
                        </Button>
                    )}

                    {/* Legal Actions */}
                    {isLegalView && (
                        <>
                            {(contract.status === 'requested' || (contract.status === 'draft' && contract.responsible_legal_id !== user?.id)) && (
                                <Button onClick={() => updateStatus.mutate('legal_review')} variant="outline" className="gap-2 whitespace-nowrap w-full">
                                    <Edit className="h-4 w-4" />
                                    Assumir e Iniciar Minuta
                                </Button>
                            )}
                            {contract.status === 'legal_review' && (
                                <>
                                    <Button onClick={() => setUserIsDrafting(true)} variant="outline" className="gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 whitespace-nowrap w-full">
                                        <Sparkles className="h-4 w-4" />
                                        Elaborar Contrato
                                    </Button>
                                    <Button onClick={() => setIsReturnDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 gap-2 whitespace-nowrap w-full">
                                        <Send className="h-4 w-4" />
                                        Enviar para o Solicitante
                                    </Button>
                                    <Button onClick={() => {
                                        setSigners([{ email: contract?.party_email || "" }]);
                                        setIsSigningDialogOpen(true);
                                    }} className="bg-green-600 hover:bg-green-700 gap-2 whitespace-nowrap w-full">
                                        <CheckCircle className="h-4 w-4" />
                                        Aprovar e Enviar p/ Assinatura
                                    </Button>
                                </>
                            )}
                        </>
                    )}

                    {/* Requester Actions - Show if requester/same sector and contract is in draft status */}
                    {(isRequester || isInSameSector) && contract.status === 'draft' && (
                        <Button onClick={() => updateStatus.mutate('legal_review')} className="bg-purple-600 hover:bg-purple-700 gap-2 whitespace-nowrap w-full">
                            <Send className="h-4 w-4" />
                            Devolver ao Jurídico
                        </Button>
                    )}

                    {/* General Status Badges / Info */}
                    {contract.status === 'legal_review' && !isLegal && (
                        <Badge variant="secondary" className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap w-full justify-center">
                            Aguardando Aprovação do Jurídico
                        </Badge>
                    )}

                    {contract.status === 'draft' && !isRequester && isLegal && (
                        <Badge variant="secondary" className="px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap w-full justify-center">
                            Em revisão pelo Solicitante
                        </Badge>
                    )}

                    {contract.status === 'signing' && isLegalView && (
                        <Button onClick={() => finalizeContract.mutate()} className="bg-green-600 hover:bg-green-700 whitespace-nowrap w-full">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirmar Assinatura
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes e Vigência</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-xs text-muted-foreground block">Solicitante</span>
                                <span className="font-medium text-blue-700">
                                    {(contract as any)?.department?.name || requesterProfile?.full_name || '...'}
                                </span>
                                <p className="text-[10px] text-muted-foreground">{requesterProfile?.full_name}</p>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Contratada</span>
                                <span className="font-medium">{contract.party_name || contract.contractor_name || '-'}</span>
                                <span className="text-xs text-muted-foreground block">{contract.party_document || contract.contractor_cnpj}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Valor Estimado</span>
                                <span className="font-medium">
                                    {contract.value ? contract.value.toLocaleString('pt-BR', { style: 'currency', currency: contract.currency || 'BRL' }) : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Início Vigência</span>
                                <span>{contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : '-'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground block">Fim Vigência</span>
                                <span>{contract.end_date ? format(new Date(contract.end_date), "dd/MM/yyyy") : '-'}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-xs text-muted-foreground block">Objeto / Descrição</span>
                                <div className="mt-1">
                                    <p className="text-sm mb-2 line-clamp-4">
                                        {contract.terms_summary || (contract.description?.length > 100 ? "Contrato detalhado disponível na aba de Minuta." : contract.description) || "-"}
                                    </p>
                                    {contract.description && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setActiveTab("minuta")}
                                            className="w-full mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Abrir Minuta para Conferência
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Drafting Area - Moved here for better visibility */}
                    {canEdit && (
                        <Card className="border-purple-200 bg-purple-50/30">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    Ferramentas de Minuta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                                        onClick={() => setUserIsDrafting(true)}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Gerar Minuta com IA
                                    </Button>
                                    <Button
                                        className="flex-1 gap-2"
                                        variant="outline"
                                        onClick={() => {
                                            setActiveTab("overview");
                                            setTimeout(() => {
                                                document.getElementById('contract-editor')?.scrollIntoView({ behavior: 'smooth' });
                                                document.getElementById('contract-editor')?.focus();
                                            }, 100);
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                        Criar Manualmente
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Utilize a IA para criar uma primeira versão ou edite manualmente o texto abaixo.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full">
                            <TabsTrigger value="overview" className="flex-1">Visão Geral</TabsTrigger>
                            <TabsTrigger value="minuta" className="flex-1">Minuta</TabsTrigger>
                            <TabsTrigger value="revisions" className="flex-1">Versões e Minutas</TabsTrigger>
                            <TabsTrigger value="comments" className="flex-1">Comentários</TabsTrigger>
                        </TabsList>

                        <TabsContent value="revisions" className="space-y-4 pt-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base">Histórico de Versões</CardTitle>
                                        <CardDescription>Upload de minutas para revisão.</CardDescription>
                                    </div>
                                    {canEdit && (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="new-version-upload"
                                                className="hidden"
                                                accept=".pdf,.docx,.doc"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleNewVersionUpload.mutate(file);
                                                }}
                                                disabled={uploadingVersion}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => document.getElementById('new-version-upload')?.click()}
                                                disabled={uploadingVersion}
                                            >
                                                {uploadingVersion ? (
                                                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4 mr-2" />
                                                )}
                                                {uploadingVersion ? "Enviando..." : "Nova Versão"}
                                            </Button>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {!revisions?.length ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            Nenhuma minuta anexada ainda.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {revisions.map((rev: any) => (
                                                <div key={rev.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-8 w-8 text-blue-500" />
                                                        <div>
                                                            <p className="font-medium text-sm">Versão {rev.version_number}</p>
                                                            <p className="text-xs text-muted-foreground">{format(new Date(rev.created_at), "dd/MM/yyyy HH:mm")}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="mt-6 space-y-4">
                            {renderOverviewDashboard()}
                        </TabsContent>

                        <TabsContent value="minuta" className="mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Conteúdo do Contrato</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {canEdit ? (
                                        <div className="space-y-4">
                                            {/* Contract Editor Container */}
                                            <div className="relative border rounded-lg bg-white shadow-sm overflow-hidden min-h-[500px] flex flex-col">
                                                {/* Contract Header / Logo */}
                                                <div className="bg-white border-b p-6 flex justify-center items-center">
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

                                                <Textarea
                                                    className="flex-1 min-h-[400px] font-mono text-sm leading-relaxed p-8 border-0 focus-visible:ring-0 resize-y rounded-none"
                                                    value={draftText}
                                                    onChange={(e) => {
                                                        setDraftText(e.target.value);
                                                        setUserIsDrafting(true);
                                                    }}
                                                    id="contract-editor"
                                                    placeholder="Comece a digitar a minuta do contrato..."
                                                />
                                            </div>

                                            {/* Live Diff Preview for Legal/Admin in Minuta Tab */}
                                            {(revisions && revisions.length > 0 && revisions[0].content) && (
                                                <div className="space-y-3 mt-4">
                                                    <div className="flex items-center justify-between px-1">
                                                        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                            <Eye className="h-4 w-4 text-blue-500" />
                                                            Prévia de Alterações (Destaques em Azul)
                                                        </h4>
                                                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 uppercase">Diferenças vs Versão Anterior</Badge>
                                                    </div>
                                                    <div className="border border-blue-100 rounded-lg overflow-hidden shadow-sm">
                                                        <DiffContent
                                                            oldText={revisions[0].content}
                                                            newText={draftText || contract.description || ""}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    {isSavingDraft ? (
                                                        <>
                                                            <Upload className="h-3 w-3 animate-bounce" />
                                                            <span>Salvando alterações...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                                            <span>Todas as alterações foram salvas.</span>
                                                        </>
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => saveDraft.mutate(draftText)}
                                                    disabled={isSavingDraft || draftText === lastSavedText}
                                                    className="gap-2 bg-slate-900 hover:bg-slate-800 h-8"
                                                    size="sm"
                                                >
                                                    <Save className="h-3 w-3" />
                                                    {isSavingDraft ? "Salvando..." : "Salvar Agora"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col border rounded-lg overflow-hidden bg-white min-h-[500px]">
                                            <div className="bg-white border-b p-6 flex justify-center items-center">
                                                <img
                                                    src="/skinstore-logo.png"
                                                    alt="SKINSTORE S.A."
                                                    className="h-24 object-contain opacity-90"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = '<h2 class="text-xl font-serif text-slate-400 tracking-wide uppercase">SKINSTORE S.A.</h2>';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 p-8 whitespace-pre-wrap text-sm font-mono text-slate-700 leading-relaxed">
                                                {/* Show Diff if in Legal Review OR Draft and we have a previous version to compare */}
                                                {((contract.status === 'legal_review' || contract.status === 'draft') && revisions && revisions.length > 0 && revisions[0].content) ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 text-blue-800 rounded text-xs border border-blue-100">
                                                            <History className="h-4 w-4" />
                                                            <span>Visualizando alterações (em azul).</span>
                                                        </div>
                                                        <DiffContent
                                                            oldText={revisions[0].content}
                                                            newText={contract.description || ''}
                                                        />
                                                    </div>
                                                ) : (
                                                    processContractText(contract?.description || contract?.terms_summary || "Sem conteúdo textual.")
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="comments" className="pt-4">
                            <Card className="h-[500px] flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">Discussão</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 overflow-hidden flex flex-col">
                                    <ScrollArea className="flex-1 pr-4">
                                        <div className="space-y-4">
                                            {contractComments?.map((comment: any) => (
                                                <div key={comment.id} className="flex gap-3 items-start">
                                                    <Avatar className="h-8 w-8 mt-1">
                                                        <AvatarImage src={comment.user?.avatar_url} />
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    <div className="bg-muted p-3 rounded-lg flex-1">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <span className="font-medium text-xs">{comment.user?.full_name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{format(new Date(comment.created_at), "dd/MM HH:mm")}</span>
                                                        </div>
                                                        <p className="text-sm">{comment.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {!contractComments?.length && (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    Nenhum comentário ainda.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                    <div className="mt-4 flex gap-2">
                                        <Input
                                            placeholder="Digite seu comentário..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && sendComment.mutate()}
                                        />
                                        <Button size="icon" onClick={() => sendComment.mutate()} disabled={sendComment.isPending}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    {/* Status Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">Status Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${contract.status !== 'draft' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>1</div>
                                    <div className="text-sm">Solicitação / Rascunho</div>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200 ml-4"></div>
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${['signing', 'active'].includes(contract.status) ? 'bg-green-100 text-green-600' : contract.status === 'legal_review' ? 'bg-blue-100 text-blue-600 animate-pulse' : 'bg-gray-100'}`}>2</div>
                                    <div className="text-sm">Análise Jurídica</div>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200 ml-4"></div>
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${['active'].includes(contract.status) ? 'bg-green-100 text-green-600' : contract.status === 'signing' ? 'bg-purple-100 text-purple-600 animate-pulse' : 'bg-gray-100'}`}>3</div>
                                    <div className="text-sm">Assinatura (DocuSign)</div>
                                </div>
                                <div className="h-8 w-[1px] bg-gray-200 ml-4"></div>
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${contract.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>4</div>
                                    <div className="text-sm">Vigente / Ativo</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            <Dialog open={isSigningDialogOpen} onOpenChange={setIsSigningDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-purple-600" />
                            Configurar Signatários (DocuSign)
                        </DialogTitle>
                        <DialogDescription>
                            Liste os e-mails de todos os participantes que precisam assinar este documento.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="exemplo@email.com"
                                value={newSignerEmail}
                                onChange={(e) => setNewSignerEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newSignerEmail.includes('@')) {
                                            setSigners([...signers, { email: newSignerEmail }]);
                                            setNewSignerEmail("");
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (newSignerEmail.includes('@')) {
                                        setSigners([...signers, { email: newSignerEmail }]);
                                        setNewSignerEmail("");
                                    } else {
                                        toast.error("Informe um e-mail válido.");
                                    }
                                }}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <ScrollArea className="h-[200px] border rounded-lg p-2">
                            {signers.length === 0 ? (
                                <p className="text-center text-muted-foreground text-sm py-8">Nenhum e-mail adicionado.</p>
                            ) : (
                                <div className="space-y-2">
                                    {signers.map((signer, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-md border group">
                                            <span className="text-sm font-medium">{signer.email}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setSigners(signers.filter((_, i) => i !== idx))}
                                            >
                                                <Trash2 className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSigningDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 gap-2"
                            disabled={signers.length === 0 || sendToDocuSign.isPending}
                            onClick={() => sendToDocuSign.mutate(signers.map(s => s.email))}
                        >
                            {sendToDocuSign.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Enviar Agora
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ContractAIWizard
                open={userIsDrafting}
                onOpenChange={setUserIsDrafting}
                onGenerate={(text) => {
                    // Update contract description with generated text
                    setDraftText(text);
                    saveDraft.mutate(text);
                }}
                initialData={{
                    description: contract.terms_summary,
                    value: contract.value,
                    start_date: contract.start_date,
                    // Required for auto-fill
                    party_name: contract.party_name,
                    party_document: contract.party_document,
                    party_address: contract.party_address,
                    contractor_name: contract.contractor_name,
                    contractor_cnpj: contract.contractor_cnpj,
                    contractor_address: contract.contractor_address,

                }}
            />

            <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Devolver para o Solicitante</DialogTitle>
                        <DialogDescription>
                            Por favor, informe o motivo da devolução ou quais ajustes são necessários.
                            Este comentário ficará visível no histórico do contrato.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Ex: Favor corrigir o CNPJ da contratada..."
                            value={returnComment}
                            onChange={(e) => setReturnComment(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsReturnDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmReturn} disabled={!returnComment.trim()}>
                            Confirmar e Devolver
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
