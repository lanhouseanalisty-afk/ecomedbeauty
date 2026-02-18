import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";
import { Loader2, Save, Send, FileText, CheckCircle2, History, MessageSquare, AlertTriangle, ArrowLeft, Upload, PenTool, Edit, Sparkles, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SectorContractReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sector = searchParams.get('sector');
    const backUrl = sector ? `/crm/${sector}/contratos` : "/crm/intranet/contratos";
    const queryClient = useQueryClient();
    const [commentText, setCommentText] = useState("");
    const [draftText, setDraftText] = useState("");
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [lastSavedText, setLastSavedText] = useState("");
    const [activeTab, setActiveTab] = useState("draft"); // Default to draft for requester

    const { user } = useAuth();

    // Fetch Contract Details
    const { data: contract, isLoading, isError, error } = useQuery({
        queryKey: ['contract', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('legal_contracts')
                .select('*, requester_id:responsible_id')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as any;
        }
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
            queryClient.invalidateQueries({ queryKey: ['contract-comments', id] });
            toast.success("Comentário enviado!");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Erro ao enviar comentário.");
        }
    });

    // Save Draft Mutation
    const saveDraft = useMutation({
        mutationFn: async (text: string) => {
            setIsSavingDraft(true);
            const { error } = await supabase
                .from('legal_contracts')
                .update({
                    terms_summary: text,
                    description: text
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: (data, variables) => {
            setLastSavedText(variables);
            setIsSavingDraft(false);
            // Updating cache locally
            queryClient.setQueryData(['contract', id], (old: any) => ({
                ...old,
                terms_summary: variables,
                description: variables
            }));
        },
        onError: (error) => {
            setIsSavingDraft(false);
            toast.error(`Erro ao salvar: ${error.message}`);
        }
    });

    // Initialize draft text
    useEffect(() => {
        if (contract) {
            // Load text to edit: Prefer terms_summary (the draft) over description (the prompt/initial object)
            // If terms_summary is empty, fall back to description.
            const initialText = contract.terms_summary || contract.description || "";
            if (draftText === "" && initialText) {
                setDraftText(initialText);
                setLastSavedText(initialText);
            }
        }
    }, [contract]);

    // Auto-save Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (draftText !== lastSavedText && draftText !== "") {
                saveDraft.mutate(draftText);
            }
        }, 3000);

        return () => clearTimeout(delayDebounceFn);
    }, [draftText, lastSavedText]);

    // Return to Legal Mutation
    const returnToLegal = useMutation({
        mutationFn: async () => {
            // 1. Save current draft first
            await saveDraft.mutateAsync(draftText);

            // 2. Update Status
            const { error: updateError } = await supabase.from('legal_contracts').update({ status: 'legal_review' }).eq('id', id);
            if (updateError) throw updateError;

            // 3. Notify Legal (Optional/Backend trigger)
        },
        onSuccess: () => {
            toast.success("Contrato devolvido ao Jurídico para análise!");
            queryClient.invalidateQueries({ queryKey: ['contract', id] });
            navigate(backUrl); // Go back to list
        },
        onError: (error) => toast.error(`Erro: ${error.message}`)
    });

    if (isLoading) return <div className="p-8 text-center flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p>Carregando contrato...</p></div>;
    if (isError || !contract) return <div className="p-8 text-center">Erro ao carregar contrato.</div>;

    return (
        <div className="space-y-6 container mx-auto p-6 animate-in fade-in max-w-6xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)} className="shrink-0">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-serif text-gray-900 leading-tight">{contract.title}</h1>
                            <Badge variant="outline" className="whitespace-nowrap">{contract.status === 'draft' ? 'RASCUNHO / AJUSTE' : contract.status}</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">ID: {contract.sap_request_id || "N/A"}</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    {contract.status === 'draft' && (
                        <Button
                            onClick={() => returnToLegal.mutate()}
                            className="bg-purple-600 hover:bg-purple-700 gap-2 w-full md:w-auto shadow-sm"
                            size="lg"
                        >
                            <Send className="h-4 w-4" />
                            Devolver ao Jurídico
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content Area */}
                <div className="col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="draft">Minuta / Contrato</TabsTrigger>
                            <TabsTrigger value="details">Detalhes da Solicitação</TabsTrigger>
                        </TabsList>

                        <TabsContent value="draft" className="mt-4">
                            <Card className="border-slate-200 shadow-sm">
                                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between py-3">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <CardTitle className="text-sm font-medium">Editor de Minuta</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        {isSavingDraft ? (
                                            <span className="text-amber-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Salvando...</span>
                                        ) : (
                                            <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Salvo</span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="flex flex-col min-h-[600px] bg-white">
                                        <Textarea
                                            className="flex-1 p-8 font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 resize-none"
                                            value={draftText}
                                            onChange={(e) => setDraftText(e.target.value)}
                                            placeholder="O texto do contrato aparecerá aqui..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="details" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Dados do Contrato</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-muted-foreground">Objeto</label>
                                            <p className="text-sm font-medium">{contract.description}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Valor</label>
                                            <p className="text-sm font-medium">
                                                {contract.value ? contract.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Contratada</label>
                                            <p className="text-sm font-medium">{contract.party_name || contract.contractor_name || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Vigência</label>
                                            <p className="text-sm font-medium">
                                                {contract.start_date ? format(new Date(contract.start_date), "dd/MM/yyyy") : '-'} até {contract.end_date ? format(new Date(contract.end_date), "dd/MM/yyyy") : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar Info & Comments */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Passo Atual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <PenTool className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Ajustes / Aprovação</p>
                                    <p className="text-xs text-muted-foreground">Você deve revisar a minuta e fazer os ajustes necessários.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col h-[500px]">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                <CardTitle className="text-base">Comentários do Jurídico</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col pt-0">
                            <ScrollArea className="flex-1 pr-4 -mr-4">
                                <div className="space-y-4 pr-4 py-4">
                                    {contractComments?.map((comment: any) => (
                                        <div key={comment.id} className={`flex gap-3 items-start ${comment.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                                            <Avatar className="h-8 w-8 mt-1">
                                                <AvatarImage src={comment.user?.avatar_url} />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                            <div className={`p-3 rounded-lg max-w-[85%] ${comment.user_id === user?.id ? 'bg-blue-50 ml-auto' : 'bg-slate-100'}`}>
                                                <div className="flex justify-between items-baseline mb-1 gap-2">
                                                    <span className="font-medium text-xs">{comment.user?.full_name}</span>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{format(new Date(comment.created_at), "dd/MM HH:mm")}</span>
                                                </div>
                                                <p className="text-sm">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {!contractComments?.length && (
                                        <div className="text-center py-8 text-muted-foreground text-sm italic">
                                            Nenhum comentário.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="mt-4 flex gap-2 pt-2 border-t">
                                <Input
                                    placeholder="Escrever dúvida ou comentário..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendComment.mutate()}
                                    className="bg-slate-50"
                                />
                                <Button size="icon" onClick={() => sendComment.mutate()} disabled={sendComment.isPending}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
