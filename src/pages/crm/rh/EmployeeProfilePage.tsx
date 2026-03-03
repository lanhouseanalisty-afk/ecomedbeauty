import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    MapPin,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    Grid,
    MessageSquare,
    ThumbsUp,
    Send,
    Camera,
    Monitor,
    Award,
    Clock,
    Trash,
    ClipboardCheck,
    Users as UsersIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEmployeeProfile } from "@/hooks/useEmployeeProfile";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdmissionProcess } from "@/hooks/useAdmission";

export default function EmployeeProfilePage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    // Note: in valid app usage, id should be present.
    const { employee, assets, posts, leaves, visits, isLoading, createPost, deletePost, toggleLike, addComment, recordVisit } = useEmployeeProfile(id || "");
    const { user, roles } = useAuth();
    const [newPostContent, setNewPostContent] = useState("");
    const [pendingAdmission, setPendingAdmission] = useState<any>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const fetchPendingAdmission = async () => {
            if (!employee?.cpf && !employee?.email) return;

            // Busca por checklist de admissão pendente no título com o nome do colaborador
            const { data: checklists } = await supabase
                .from('checklists')
                .select('*')
                .eq('type', 'admissao')
                .eq('status', 'pending')
                .ilike('title', `%${employee.full_name}%`)
                .maybeSingle();

            if (checklists) {
                setPendingAdmission(checklists);
            }
        };

        if (employee) {
            fetchPendingAdmission();
        }
    }, [employee]);

    useEffect(() => {
        if (employee?.id) {
            recordVisit.mutate();
        }
    }, [employee?.id]);

    const vacationDays = leaves?.filter(l => l.type === 'vacation' && l.status === 'approved')
        .reduce((acc, curr) => acc + (curr.days_count || 0), 0) || 0;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = async () => {
        if (!newPostContent.trim() && !selectedFile) return;

        let imageUrl = undefined;

        try {
            setIsUploading(true);

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${user?.id}/${fileName}`;

                const { error: uploadError, data } = await supabase.storage
                    .from('employee-posts')
                    .upload(filePath, selectedFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('employee-posts')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            createPost.mutate({ content: newPostContent, imageUrl }, {
                onSuccess: () => {
                    setNewPostContent("");
                    setSelectedFile(null);
                    setImagePreview(null);
                    toast.success("Postagem publicada com sucesso!");
                },
                onError: () => {
                    toast.error("Erro ao publicar postagem. Verifique os logs.");
                }
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Erro ao carregar mídia: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="w-full h-64 rounded-xl" />
                <div className="flex gap-6">
                    <Skeleton className="w-1/3 h-96 rounded-xl" />
                    <Skeleton className="w-2/3 h-96 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!employee) {
        return <div className="p-8 text-center text-muted-foreground">Funcionário não encontrado.</div>;
    }

    // Cover Image (random gradients based on department or ID)
    const coverGradients = [
        "bg-gradient-to-r from-blue-400 to-emerald-400",
        "bg-gradient-to-r from-purple-400 to-pink-400",
        "bg-gradient-to-r from-orange-400 to-rose-400",
        "bg-gradient-to-r from-cyan-400 to-blue-400"
    ];
    const coverClass = coverGradients[employee.full_name.length % coverGradients.length];

    const isOwner = user?.id === employee.user_id;
    const isAdmin = roles.includes('admin') || user?.email === "reginaldo.mazaro@ext.medbeauty.com.br";

    return (
        <div className="min-h-screen bg-muted/20 pb-10">
            {/* Cover Header Container - No overflow-hidden here to allow avatar to spill out */}
            <div className={`w-full h-72 ${coverClass} relative`}>
                {/* Background Mirror Effect - Isolated with overflow-hidden */}
                <div className="absolute inset-0 overflow-hidden">
                    {employee.avatar_url && (
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-30 blur-[8px] scale-110 transition-all duration-1000"
                            style={{ backgroundImage: `url(${employee.avatar_url})` }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
                </div>

                {/* Content Overlay */}
                <div className="absolute -bottom-20 left-4 md:left-12 flex flex-col md:flex-row items-center md:items-end gap-6 z-20">
                    <div className="relative group">
                        <Avatar className="h-40 w-40 border-[6px] border-background shadow-2xl bg-background transition-transform duration-500 group-hover:scale-105">
                            <AvatarImage src={employee.avatar_url} className="object-cover" />
                            <AvatarFallback className="text-5xl bg-primary/10 text-primary font-serif">
                                {getInitials(employee.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-4 right-4 h-6 w-6 bg-green-500 rounded-full border-4 border-background shadow-lg" title="Online" />
                    </div>

                    <div className="flex flex-col mb-4 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-lg mb-2">
                            {employee.full_name}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 text-sm py-1 px-3">
                                <Briefcase className="h-3.5 w-3.5 mr-2" />
                                {employee.positions?.title || "Colaborador"}
                            </Badge>
                            <Badge variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-white/30 hover:bg-white/30 text-sm py-1 px-3">
                                <MapPin className="h-3.5 w-3.5 mr-2" />
                                {employee.departments?.name || "Geral"}
                            </Badge>
                            {pendingAdmission && (
                                <Button
                                    size="sm"
                                    className="h-8 bg-white text-rose-gold hover:bg-white/90 border-none shadow-lg animate-pulse"
                                    onClick={() => navigate(`/crm/checklist/${pendingAdmission.id}`)}
                                >
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    Admissão
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-32 md:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar: About / Info */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <CardHeader>
                            <CardTitle className="text-lg">Sobre</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Mail className="h-5 w-5 text-primary/70" />
                                <span className="text-sm">{employee.email}</span>
                            </div>
                            {employee.phone && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Phone className="h-5 w-5 text-primary/70" />
                                    <span className="text-sm">{employee.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <Calendar className="h-5 w-5 text-primary/70" />
                                <span className="text-sm">
                                    Admissão: {format(new Date(employee.hire_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                            </div>
                            {employee.cpf && (
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Award className="h-5 w-5 text-primary/70" />
                                    <span className="text-sm">ID: {employee.cpf.replace(/\D/g, '').slice(0, 3)}...</span>
                                </div>
                            )}
                            <Separator />
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="p-2 bg-muted/50 rounded-lg">
                                    <p className="font-bold text-base">{assets?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Ativos</p>
                                </div>
                                <div className="p-2 bg-muted/50 rounded-lg">
                                    <p className="font-bold text-base">{vacationDays}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Férias</p>
                                </div>
                                <div className="p-2 bg-muted/50 rounded-lg">
                                    <p className="font-bold text-base">{visits?.length || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">Visitas</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b border-primary/10">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Equipamentos</span>
                                <Monitor className="h-4 w-4 text-primary/70" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {assets && assets.length > 0 ? (
                                assets.map((asset: any) => (
                                    <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${asset.status === 'in_use' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                            <div className="text-sm font-semibold text-slate-700">{asset.model}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] bg-white/50">{asset.asset_tag}</Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground italic">Nenhum equipamento vinculado.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Create Post - Only for owner */}
                    {isOwner && (
                        <Card>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex gap-4">
                                    <Avatar>
                                        <AvatarFallback>{getInitials("Eu")}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-3">
                                        <Textarea
                                            placeholder={`Escreva algo no seu perfil...`}
                                            className="resize-none min-h-[80px]"
                                            value={newPostContent}
                                            onChange={e => setNewPostContent(e.target.value)}
                                        />

                                        {imagePreview && (
                                            <div className="relative w-full max-h-[300px] overflow-hidden rounded-lg border">
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            id="post-media"
                                            className="hidden"
                                            accept="image/*,video/*"
                                            onChange={handleFileSelect}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                                            onClick={() => document.getElementById('post-media')?.click()}
                                        >
                                            <Camera className="h-4 w-4 mr-2" />
                                            Foto/Vídeo
                                        </Button>
                                    </div>
                                    <Button size="sm" onClick={handlePostSubmit} disabled={createPost.isPending || isUploading || (!newPostContent.trim() && !selectedFile)}>
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 animate-spin" />
                                                Carregando...
                                            </div>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Publicar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="feed">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="feed">Linha do Tempo</TabsTrigger>
                            <TabsTrigger value="history">Histórico</TabsTrigger>
                            <TabsTrigger value="info">Informações</TabsTrigger>
                            <TabsTrigger value="vacations">Férias e Licenças</TabsTrigger>
                        </TabsList>

                        <TabsContent value="feed" className="space-y-4 mt-4">
                            {posts && posts.length > 0 ? (
                                posts.map((post: any) => (
                                    <Card key={post.id}>
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={post.author?.avatar_url} />
                                                        <AvatarFallback>{getInitials(post.author?.full_name || "U")}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{post.author?.full_name || "Usuário"}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {post.created_at ? format(new Date(post.created_at), "dd MMM HH:mm", { locale: ptBR }) : '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {(isAdmin || user?.id === post.author_id) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => {
                                                            if (window.confirm("Deseja realmente excluir esta postagem?")) {
                                                                deletePost.mutate(post.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                            {post.image_url && (
                                                <div className="rounded-lg overflow-hidden border bg-muted/20">
                                                    <img src={post.image_url} className="w-full h-auto max-h-[500px] object-contain mx-auto" alt="Conteúdo da postagem" />
                                                </div>
                                            )}
                                            <Separator />
                                            <div className="flex gap-4 pt-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={`h-8 gap-1 ${post.likes?.some((l: any) => l.user_id === user?.id) ? 'text-blue-600 font-bold' : ''}`}
                                                                onClick={() => toggleLike.mutate(post.id)}
                                                            >
                                                                <ThumbsUp className={`h-4 w-4 ${post.likes?.some((l: any) => l.user_id === user?.id) ? 'fill-current' : ''}`} />
                                                                {post.likes?.some((l: any) => l.user_id === user?.id) ? 'Curtiu' : 'Curtir'} ({post.likes?.length || 0})
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="max-w-xs">
                                                            {post.likes && post.likes.length > 0 ? (
                                                                <span>
                                                                    Curtido por: {post.likes.map((l: any) => {
                                                                        if (l.user_id === user?.id) return employee?.full_name || 'Você';
                                                                        return l.full_name || l.user_id;
                                                                    }).join(', ')}
                                                                </span>
                                                            ) : (
                                                                <span>Ninguém curtiu ainda</span>
                                                            )}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 gap-1"
                                                    onClick={() => {
                                                        setActiveCommentPost(activeCommentPost === post.id ? null : post.id);
                                                        setNewComment("");
                                                    }}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                    Comentar ({post.comments?.length || 0})
                                                </Button>
                                            </div>

                                            {/* Seção de Comentários */}
                                            {activeCommentPost === post.id && (
                                                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2">
                                                    <Separator />
                                                    <div className="space-y-3 pb-2">
                                                        {post.comments?.map((comment: any) => (
                                                            <div key={comment.id} className="flex gap-3 text-sm group">
                                                                <Avatar className="h-7 w-7 mt-1">
                                                                    <AvatarImage src={comment.author?.avatar_url} />
                                                                    <AvatarFallback className="text-[10px]">{getInitials(comment.author?.full_name || "U")}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="bg-muted/50 p-2 rounded-lg flex-1">
                                                                    <p className="font-semibold text-xs mb-0.5">{comment.author?.full_name || "Usuário"}</p>
                                                                    <p className="text-muted-foreground">{comment.content}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs">{getInitials("Eu")}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 flex gap-2">
                                                            <Input
                                                                placeholder="Escreva um comentário..."
                                                                className="h-8 text-sm"
                                                                value={newComment}
                                                                onChange={(e) => setNewComment(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && newComment.trim()) {
                                                                        addComment.mutate({ postId: post.id, content: newComment });
                                                                        setNewComment("");
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                size="sm"
                                                                className="h-8 px-3"
                                                                onClick={() => {
                                                                    if (newComment.trim()) {
                                                                        addComment.mutate({ postId: post.id, content: newComment });
                                                                        setNewComment("");
                                                                    }
                                                                }}
                                                                disabled={!newComment.trim() || addComment.isPending}
                                                            >
                                                                <Send className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-8 text-center text-muted-foreground">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma publicação ainda.</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Histórico Funcional</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative border-l-2 border-muted pl-6 space-y-8 ml-2">
                                        <div className="relative">
                                            <div className="absolute -left-[31px] bg-primary h-4 w-4 rounded-full border-4 border-background" />
                                            <p className="font-medium text-sm">Admissão</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(employee.hire_date), "dd/MM/yyyy")}</p>
                                            <p className="text-sm mt-1">Início das atividades como {employee.position?.title || 'Colaborador'}.</p>
                                        </div>
                                        {/* Mock updates */}
                                        <div className="relative">
                                            <div className="absolute -left-[31px] bg-muted-foreground/30 h-4 w-4 rounded-full border-4 border-background" />
                                            <p className="font-medium text-sm">Avaliação de Desempenho</p>
                                            <p className="text-xs text-muted-foreground">Há 3 meses</p>
                                            <p className="text-sm mt-1">Ciclo de feedback trimestral concluído.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="info">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Escala de Trabalho</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {employee.work_schedule ? (
                                            <div className="text-sm">
                                                <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                                                    {JSON.stringify(employee.work_schedule, null, 2)}
                                                </pre>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Informação não cadastrada.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Contato de Emergência</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {employee.emergency_contact ? (
                                            <div className="text-sm">
                                                <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                                                    {JSON.stringify(employee.emergency_contact, null, 2)}
                                                </pre>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Informação não cadastrada.</p>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Endereço</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {employee.address ? (
                                            <p className="text-sm text-muted-foreground">
                                                {typeof employee.address === 'string' ? employee.address : JSON.stringify(employee.address)}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Endereço não cadastrado.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="vacations">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {leaves && leaves.length > 0 ? (
                                    leaves.map(leave => (
                                        <Card key={leave.id}>
                                            <CardContent className="p-4 flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-primary capitalize">{leave.type === 'vacation' ? 'Férias' : 'Licença'}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{format(new Date(leave.start_date), "dd/MM/yy")} - {format(new Date(leave.end_date), "dd/MM/yy")}</span>
                                                    </div>
                                                    <p className="text-xs font-medium">{leave.days_count} dias</p>
                                                </div>
                                                <Badge variant={leave.status === 'approved' ? 'default' : leave.status === 'pending' ? 'secondary' : 'destructive'} className="capitalize">
                                                    {leave.status === 'approved' ? 'Aprovado' : leave.status === 'pending' ? 'Pendente' : 'Recusado'}
                                                </Badge>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-10 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                                        Nenhuma solicitação de férias ou licença encontrada.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

            </div>
        </div>
    );
}
