import React from "react";
import { Trophy, Medal, Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeaderboard, useChallenges, useCreateChallenge, useDeleteChallenge, useUpdateChallenge } from "@/hooks/useGamification";
import { Challenge } from "@/hooks/useGamification";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminGamificationPage = () => {
    const { data: leaderboard, isLoading: loadingRank } = useLeaderboard();
    const { data: challenges, isLoading: loadingChallenges } = useChallenges();
    const createChallenge = useCreateChallenge();
    const updateChallenge = useUpdateChallenge();
    const deleteChallenge = useDeleteChallenge();
    const { user } = useAuth();

    // State for creating
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    // State for editing
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingChallenge, setEditingChallenge] = React.useState<Partial<Challenge> | null>(null);

    const [newChallenge, setNewChallenge] = React.useState({
        title: "",
        description: "",
        xp_reward: 100,
        points_reward: 50,
        type: "general"
    });

    const handleCreateChallenge = async () => {
        if (!newChallenge.title) return;
        await createChallenge.mutateAsync(newChallenge);
        setIsCreateModalOpen(false);
        setNewChallenge({
            title: "",
            description: "",
            xp_reward: 100,
            points_reward: 50,
            type: "general"
        });
    };

    const handleUpdateChallenge = async () => {
        if (!editingChallenge || !editingChallenge.id) return;
        await updateChallenge.mutateAsync({
            id: editingChallenge.id,
            title: editingChallenge.title,
            description: editingChallenge.description,
            xp_reward: editingChallenge.xp_reward,
            points_reward: editingChallenge.points_reward,
            type: editingChallenge.type
        });
        setIsEditModalOpen(false);
        setEditingChallenge(null);
    };

    const handleDeleteChallenge = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este desafio?")) {
            await deleteChallenge.mutateAsync(id);
        }
    };

    if (loadingRank || loadingChallenges) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-[#8347EB]" />
                    Gestão de Gamificação
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Gerencie os desafios ativos, visualize o ranking estendido e conceda medalhas bônus.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ranking Completo */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Medal className="w-5 h-5 text-amber-500" /> Ranking Geral
                        </CardTitle>
                        <CardDescription>Visualização administrativa de todos os níveis de colaboradores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Pos</TableHead>
                                    <TableHead>Colaborador</TableHead>
                                    <TableHead className="text-right">Nível</TableHead>
                                    <TableHead className="text-right">XP Total</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard?.map((entry, idx) => (
                                    <TableRow key={entry.user_id}>
                                        <TableCell className="font-medium text-slate-500">{idx + 1}º</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={entry.avatar_url} />
                                                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                                                        {entry.full_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{entry.full_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="font-bold">Nv. {entry.level}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-[#8347EB] font-bold">
                                            {entry.xp.toLocaleString()} XP
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10">
                                                + Medalha
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!leaderboard || leaderboard.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                            Nenhum dado encontrado no ranking.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Gestão de Desafios */}
                <Card className="shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-emerald-500" /> Desafios e Metas
                            </CardTitle>
                            <CardDescription>Crie e gerencie os desafios da equipe comercial.</CardDescription>
                        </div>
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-[#8347EB] hover:bg-[#8347EB]/90 text-white shadow-md">
                                    <Plus className="w-4 h-4 mr-2" /> Novo Desafio
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Criar Novo Desafio</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Título</label>
                                        <Input
                                            value={newChallenge.title}
                                            onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })}
                                            placeholder="Ex: Meta de Vendas"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descrição</label>
                                        <Textarea
                                            value={newChallenge.description}
                                            onChange={e => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                            placeholder="Descreva o que o usuário deve fazer"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tipo de Desafio</label>
                                        <Select
                                            value={newChallenge.type}
                                            onValueChange={(value) => setNewChallenge({ ...newChallenge, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="general">Geral</SelectItem>
                                                <SelectItem value="vendas">Vendas / Comercial</SelectItem>
                                                <SelectItem value="participacao">Participação / Eventos</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Recompensa XP</label>
                                            <Input
                                                type="number"
                                                value={newChallenge.xp_reward}
                                                onChange={e => setNewChallenge({ ...newChallenge, xp_reward: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Recompensa Pontos</label>
                                            <Input
                                                type="number"
                                                value={newChallenge.points_reward}
                                                onChange={e => setNewChallenge({ ...newChallenge, points_reward: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-[#8347EB] hover:bg-[#8347EB]/90"
                                        onClick={handleCreateChallenge}
                                        disabled={createChallenge.isPending}
                                    >
                                        {createChallenge.isPending ? "Criando..." : "Salvar Desafio"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {challenges?.map(challenge => (
                                <div key={challenge.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center group">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white">{challenge.title}</h4>
                                            {challenge.type === 'vendas' && <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">Vendas</Badge>}
                                            {challenge.type === 'participacao' && <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400">Participação</Badge>}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{challenge.description}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="outline" className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-800">
                                                {challenge.xp_reward} XP
                                            </Badge>
                                            <Badge variant="outline" className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800">
                                                {challenge.points_reward} Pontos
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-[#8347EB]"
                                            onClick={() => {
                                                setEditingChallenge(challenge);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-red-500"
                                            onClick={() => handleDeleteChallenge(challenge.id)}
                                            disabled={deleteChallenge.isPending}
                                        >
                                            {deleteChallenge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(!challenges || challenges.length === 0) && (
                                <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
                                    Nenhum desafio ativo.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Modal de Edição */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Editar Desafio</DialogTitle>
                        </DialogHeader>
                        {editingChallenge && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Título</label>
                                    <Input
                                        value={editingChallenge.title || ""}
                                        onChange={e => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Descrição</label>
                                    <Textarea
                                        value={editingChallenge.description || ""}
                                        onChange={e => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tipo de Desafio</label>
                                    <Select
                                        value={editingChallenge.type || "general"}
                                        onValueChange={(value) => setEditingChallenge({ ...editingChallenge, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">Geral</SelectItem>
                                            <SelectItem value="vendas">Vendas / Comercial</SelectItem>
                                            <SelectItem value="participacao">Participação / Eventos</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Recompensa XP</label>
                                        <Input
                                            type="number"
                                            value={editingChallenge.xp_reward || 0}
                                            onChange={e => setEditingChallenge({ ...editingChallenge, xp_reward: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Recompensa Pontos</label>
                                        <Input
                                            type="number"
                                            value={editingChallenge.points_reward || 0}
                                            onChange={e => setEditingChallenge({ ...editingChallenge, points_reward: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-[#8347EB] hover:bg-[#8347EB]/90"
                                    onClick={handleUpdateChallenge}
                                    disabled={updateChallenge.isPending}
                                >
                                    {updateChallenge.isPending ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
};

export default AdminGamificationPage;
