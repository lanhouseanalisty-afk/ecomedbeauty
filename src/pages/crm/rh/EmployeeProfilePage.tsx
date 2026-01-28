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
    Users as UsersIcon
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEmployeeProfile } from "@/hooks/useEmployeeProfile";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EmployeeProfilePage() {
    const { id } = useParams<{ id: string }>();
    // Note: in valid app usage, id should be present.
    const { employee, assets, posts, leaves, visits, isLoading, createPost, recordVisit } = useEmployeeProfile(id || "");
    const [newPostContent, setNewPostContent] = useState("");

    useEffect(() => {
        if (employee?.id) {
            recordVisit.mutate();
        }
    }, [employee?.id]);

    const vacationDays = leaves?.filter(l => l.type === 'vacation' && l.status === 'approved')
        .reduce((acc, curr) => acc + (curr.days_count || 0), 0) || 0;

    const handlePostSubmit = () => {
        if (!newPostContent.trim()) return;
        createPost.mutate(newPostContent, {
            onSuccess: () => {
                setNewPostContent("");
                toast.success("Postagem publicada com sucesso!");
            },
            onError: (error: any) => {
                console.error("Erro ao publicar:", error);
                toast.error("Erro ao publicar postagem. Verifique os logs.");
            }
        });
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

    return (
        <div className="min-h-screen bg-muted/20 pb-10">
            {/* Cover Header */}
            <div className={`w-full h-64 ${coverClass} relative`}>
                <div className="absolute -bottom-16 left-8 flex items-end">
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {getInitials(employee.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-2 right-2 p-1.5 bg-green-500 rounded-full border-2 border-background" title="Online" />
                    </div>
                    <div className="mb-4 ml-6 space-y-1">
                        <h1 className="text-3xl font-bold text-white drop-shadow-md">{employee.full_name}</h1>
                        <div className="flex items-center gap-2 text-white/90 font-medium drop-shadow-sm">
                            <Briefcase className="h-4 w-4" />
                            <span>{(employee as any).position?.title || 'Colaborador'}</span>
                            <span>•</span>
                            <span>{(employee as any).department?.name || 'Departamento'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto mt-20 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Sidebar: About / Info */}
                <div className="space-y-6">
                    <Card>
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

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Equipamentos</span>
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assets && assets.length > 0 ? (
                                assets.map((asset: any) => (
                                    <div key={asset.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${asset.status === 'in_use' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <div className="text-sm font-medium">{asset.model}</div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">{asset.asset_tag}</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">Nenhum equipamento vinculado.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Create Post */}
                    <Card>
                        <CardContent className="p-4 space-y-4">
                            <div className="flex gap-4">
                                <Avatar>
                                    <AvatarFallback>{getInitials("Eu")}</AvatarFallback>
                                </Avatar>
                                <Textarea
                                    placeholder={`Escreva algo no perfil de ${employee.full_name.split(' ')[0]}...`}
                                    className="resize-none min-h-[80px]"
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Foto/Vídeo
                                </Button>
                                <Button size="sm" onClick={handlePostSubmit} disabled={createPost.isPending || !newPostContent.trim()}>
                                    <Send className="h-4 w-4 mr-2" />
                                    Publicar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

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
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {post.content}
                                            </p>
                                            <Separator />
                                            <div className="flex gap-4 pt-2">
                                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    Curtir ({post.likes?.length || 0})
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                                    <MessageSquare className="h-4 w-4" />
                                                    Comentar ({post.comments?.length || 0})
                                                </Button>
                                            </div>
                                            {/* Comments section could go here */}
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
