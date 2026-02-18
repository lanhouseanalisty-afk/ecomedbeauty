
import { useState } from "react";
import {
    Lightbulb,
    Plus,
    ChevronUp,
    MessageSquare,
    Filter,
    Sparkles,
    Zap,
    Coffee,
    Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useIdeaBank, useCreateIdea, useVoteIdea } from "@/hooks/useIntranet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORIES = [
    { value: "Processo", icon: Zap, color: "text-amber-500", bg: "bg-amber-100" },
    { value: "Produto", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-100" },
    { value: "Cultura", icon: Coffee, color: "text-rose-500", bg: "bg-rose-100" },
    { value: "Tecnologia", icon: Globe, color: "text-blue-500", bg: "bg-blue-100" },
];

export default function IdeaBankPage() {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newIdea, setNewIdea] = useState({ title: "", description: "", category: "Processo" });

    const { data: ideas, isLoading } = useIdeaBank();
    const createIdea = useCreateIdea();
    const voteIdea = useVoteIdea();

    const handleCreateIdea = async () => {
        if (!user) return;
        await createIdea.mutateAsync({
            user_id: user.id,
            ...newIdea
        });
        setIsDialogOpen(false);
        setNewIdea({ title: "", description: "", category: "Processo" });
    };

    const handleVote = (ideaId: string, currentUpvotes: string[]) => {
        if (!user) return;
        voteIdea.mutate({ ideaId, userId: user.id, currentUpvotes });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'new': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Nova</Badge>;
            case 'analyzing': return <Badge variant="secondary" className="bg-amber-100 text-amber-700">Em Análise</Badge>;
            case 'implemented': return <Badge variant="secondary" className="bg-green-100 text-green-700">Implementada</Badge>;
            case 'discarded': return <Badge variant="secondary" className="bg-slate-100 text-slate-700">Arquivada</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Lightbulb className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="font-serif text-3xl font-bold">Innovation Hub</h1>
                    </div>
                    <p className="text-muted-foreground ml-10">
                        Onde as ideias da Medbeauty ganham vida.
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                            <Plus className="mr-2 h-5 w-5" />
                            Sugerir Ideia
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-serif">O que você está pensando?</DialogTitle>
                            <DialogDescription>
                                Toda grande mudança começa com uma simples ideia. Compartilhe com o time!
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Título da Ideia</label>
                                <Input
                                    placeholder="Ex: Novo sistema de feedback semanal"
                                    value={newIdea.title}
                                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                                    className="rounded-xl bg-slate-50/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Categoria</label>
                                <Select value={newIdea.category} onValueChange={(val) => setNewIdea({ ...newIdea, category: val })}>
                                    <SelectTrigger className="rounded-xl bg-slate-50/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat.value} value={cat.value}>{cat.value}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Descrição Detalhada</label>
                                <Textarea
                                    placeholder="Explique como isso ajudaria a Medbeauty..."
                                    className="min-h-[120px] rounded-xl bg-slate-50/50"
                                    value={newIdea.description}
                                    onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                            <Button onClick={handleCreateIdea} className="rounded-xl px-8" disabled={createIdea.isPending}>
                                {createIdea.isPending ? "Enviando..." : "Lançar Ideia"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="md:col-span-1 lg:col-span-1 space-y-4">
                    <Card className="rounded-3xl border-none bg-gradient-to-br from-primary/5 to-primary/0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Categorias</CardTitle>
                            <CardDescription>Explore por tema de inovação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {CATEGORIES.map((cat) => (
                                <div key={cat.value} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${cat.bg}`}>
                                            <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                        </div>
                                        <span className="font-medium text-slate-700">{cat.value}</span>
                                    </div>
                                    <Badge variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver todas
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 lg:col-span-2 space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)
                    ) : (
                        ideas?.map((idea) => {
                            const hasVoted = user && idea.upvotes.includes(user.id);
                            const catInfo = CATEGORIES.find(c => c.value === idea.category) || CATEGORIES[0];

                            return (
                                <Card key={idea.id} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="p-4 flex flex-row sm:flex-col items-center justify-center gap-2 bg-slate-50/50 w-full sm:w-20 border-r border-slate-100">
                                            <Button
                                                variant={hasVoted ? "default" : "outline"}
                                                size="icon"
                                                className={`h-11 w-11 rounded-2xl ${hasVoted ? 'bg-primary' : 'border-slate-200'}`}
                                                onClick={() => handleVote(idea.id, idea.upvotes)}
                                                disabled={voteIdea.isPending}
                                            >
                                                <ChevronUp className={`h-6 w-6 ${hasVoted ? 'text-white' : 'text-slate-400'}`} />
                                            </Button>
                                            <span className="text-xl font-bold text-slate-700">{idea.upvotes.length}</span>
                                        </div>

                                        <div className="flex-1 p-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg ${catInfo.bg}`}>
                                                        <catInfo.icon className={`h-3 w-3 ${catInfo.color}`} />
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{idea.category}</span>
                                                </div>
                                                {getStatusBadge(idea.status)}
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl font-bold text-slate-900">{idea.title}</h3>
                                                <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                                                    {idea.description}
                                                </p>
                                            </div>

                                            <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {idea.author_name?.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">por {idea.author_name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-slate-400">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span className="text-xs font-medium">0</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                                                        {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true, locale: ptBR })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })
                    )}

                    {!isLoading && ideas?.length === 0 && (
                        <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                            <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto">
                                <Lightbulb className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400">Nenhuma ideia ainda...</h3>
                            <p className="text-slate-400 max-w-xs mx-auto">
                                Seja o primeiro a sugerir algo incrível para o futuro da Medbeauty!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
