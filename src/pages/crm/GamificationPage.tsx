import React from "react";
import {
    Trophy,
    Target,
    Award,
    Star,
    Zap,
    Flame,
    Medal,
    Swords,
    ChevronRight,
    Lock,
    Loader2,
    TrendingUp,
    CalendarCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
    useUserGamification,
    useChallenges,
    useUserBadges,
    useLeaderboard,
    useUserChallenges,
    useCreateChallenge
} from "@/hooks/useGamification";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import { toast } from "sonner";

const GamificationPage = () => {
    const { user } = useAuth();
    const { data: stats, isLoading: loadingStats } = useUserGamification(user?.id);
    const { data: challenges, isLoading: loadingChallenges } = useChallenges();
    const { data: userBadges, isLoading: loadingBadges } = useUserBadges(user?.id);
    const { data: userChallengesProgress } = useUserChallenges(user?.id);
    const { data: leaderboard } = useLeaderboard();
    const createChallenge = useCreateChallenge();

    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

    const monthlyMilestones = [
        { id: "1", label: "Cobre", xp_required: 1000, color: "orange" },
        { id: "2", label: "Prata", xp_required: 2500, color: "slate" },
        { id: "3", label: "Ouro", xp_required: 5000, color: "yellow" },
        { id: "4", label: "Platina", xp_required: 10000, color: "cyan" },
        { id: "5", label: "Esmeralda", xp_required: 20000, color: "emerald" },
    ];

    // Derived stats or defaults
    const userLevel = stats?.level || 1;
    const currentXp = stats?.xp || 0;
    const nextLevelXp = Math.pow(userLevel, 2) * 100 + 500; // Example formula
    const xpProgress = Math.min((currentXp / nextLevelXp) * 100, 100);

    if (loadingStats || loadingChallenges || loadingBadges) {
        return (
            <div className="min-h-screen bg-[#0B0D13] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#8347EB]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0D13] text-white p-4 md:p-8 animate-in fade-in duration-700">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Swords className="w-8 h-8 text-[#8347EB]" />
                        <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Gamônia</span>
                    </h1>
                    <p className="text-[#94A3B8] font-medium">Conquistas, desafios e progressão de carreira.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="bg-[#11141D] border-white/10 text-white hover:bg-white/5">
                                <Award className="w-4 h-4 mr-2 text-amber-400" />
                                Ver Ranking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-amber-400" />
                                    Hall da Fama MedBeauty
                                </DialogTitle>
                            </DialogHeader>
                            <div className="mt-6 space-y-6">
                                {/* Podium Top 3 */}
                                {leaderboard && leaderboard.length >= 3 && (
                                    <div className="flex items-end justify-center gap-2 mb-8 h-48">
                                        {/* 2nd Place */}
                                        <div className="flex flex-col items-center gap-2 flex-1">
                                            <div className="relative">
                                                <Avatar className="w-14 h-14 border-2 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                                                    <AvatarImage src={leaderboard[1].avatar_url} />
                                                    <AvatarFallback className="bg-slate-700 text-slate-200">{leaderboard[1].full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-900 border-2 border-[#11141D]">
                                                    2
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-400/10 border border-slate-400/20 rounded-t-lg h-24 flex flex-col items-center justify-center p-2 text-center">
                                                <p className="text-[10px] font-bold leading-tight line-clamp-2">{leaderboard[1].full_name}</p>
                                                <p className="text-[8px] text-slate-400 font-black">{leaderboard[1].xp.toLocaleString()} XP</p>
                                            </div>
                                        </div>

                                        {/* 1st Place */}
                                        <div className="flex flex-col items-center gap-2 flex-1 scale-110">
                                            <div className="relative">
                                                <div className="absolute -inset-1 bg-amber-400/20 blur-md rounded-full animate-pulse" />
                                                <Avatar className="w-16 h-16 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                                                    <AvatarImage src={leaderboard[0].avatar_url} />
                                                    <AvatarFallback className="bg-amber-900 text-amber-200">{leaderboard[0].full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <Trophy className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-xs font-black text-amber-900 border-2 border-[#11141D]">
                                                    1
                                                </div>
                                            </div>
                                            <div className="w-full bg-amber-400/20 border border-amber-400/30 rounded-t-lg h-32 flex flex-col items-center justify-center p-2 text-center shadow-[inset_0_0_20px_rgba(251,191,36,0.05)]">
                                                <p className="text-[10px] font-black leading-tight line-clamp-2 text-amber-400">{leaderboard[0].full_name}</p>
                                                <p className="text-[8px] text-amber-500 font-black">{leaderboard[0].xp.toLocaleString()} XP</p>
                                            </div>
                                        </div>

                                        {/* 3rd Place */}
                                        <div className="flex flex-col items-center gap-2 flex-1">
                                            <div className="relative">
                                                <Avatar className="w-12 h-12 border-2 border-amber-700 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                                                    <AvatarImage src={leaderboard[2].avatar_url} />
                                                    <AvatarFallback className="bg-amber-950 text-amber-700">{leaderboard[2].full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-700 rounded-full flex items-center justify-center text-[9px] font-bold text-amber-100 border-2 border-[#11141D]">
                                                    3
                                                </div>
                                            </div>
                                            <div className="w-full bg-amber-700/10 border border-amber-700/20 rounded-t-lg h-20 flex flex-col items-center justify-center p-2 text-center">
                                                <p className="text-[10px] font-bold leading-tight line-clamp-2">{leaderboard[2].full_name}</p>
                                                <p className="text-[8px] text-amber-700 font-black">{leaderboard[2].xp.toLocaleString()} XP</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Other Ranks */}
                                <div className="space-y-2">
                                    {leaderboard?.slice(3).map((entry, index) => (
                                        <div
                                            key={entry.user_id}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/5",
                                                entry.user_id === user?.id && "border-[#8347EB]/50 bg-[#8347EB]/10"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 text-center font-bold text-slate-500 text-xs">
                                                    {index + 4}º
                                                </span>
                                                <Avatar className="w-8 h-8 border border-white/10">
                                                    <AvatarImage src={entry.avatar_url} />
                                                    <AvatarFallback className="bg-[#8347EB] text-xs font-bold">{entry.full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-[13px]">{entry.full_name}</p>
                                                    <p className="text-[9px] text-slate-400 uppercase">Nível {entry.level}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[13px] font-bold text-[#8347EB]">{entry.xp.toLocaleString()} XP</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Profile & Badges */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Level Progress Card */}
                    <Card className="bg-[#11141D] border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8347EB]/20 blur-[50px] -z-10 group-hover:bg-[#8347EB]/30 transition-colors duration-700" />
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8347EB] to-purple-600 p-[2px]">
                                        <div className="w-full h-full bg-[#11141D] rounded-2xl flex items-center justify-center">
                                            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                                                {userLevel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-amber-400 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#11141D] shadow-lg">
                                        <Star className="w-4 h-4 text-amber-900" fill="currentColor" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{user?.email?.split('@')[0] || "Consultor"}</h2>
                                    <p className="text-[#94A3B8] text-sm">Vendedor Elite</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Progresso Mensal</h3>
                                <div className="flex justify-between gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {monthlyMilestones.map(milestone => {
                                        const isReached = currentXp >= milestone.xp_required;
                                        return (
                                            <div key={milestone.id} className="flex flex-col items-center min-w-[50px] gap-1">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                                    isReached
                                                        ? `bg-${milestone.color}-500/20 text-${milestone.color}-400 border border-${milestone.color}-500 shadow-[0_0_15px_rgba(var(--${milestone.color}-500),0.3)] scale-110`
                                                        : "bg-white/5 text-white/10 border border-white/5"
                                                )}>
                                                    <Award size={18} fill={isReached ? "currentColor" : "none"} />
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] font-bold uppercase",
                                                    isReached ? "text-white" : "text-white/20"
                                                )}>
                                                    {milestone.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-[#94A3B8]">
                                        <span>XP Atual: <span className="text-white">{currentXp.toLocaleString()}</span></span>
                                        <span>Próximo: {nextLevelXp.toLocaleString()}</span>
                                    </div>
                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#8347EB] to-purple-400 relative"
                                            style={{ width: `${xpProgress}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] -translate-x-full" />
                                        </div>
                                    </div>
                                    <p className="text-right text-[10px] text-white/40 font-medium">Faltam {(nextLevelXp - currentXp).toLocaleString()} XP para o Nível {userLevel + 1}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Badges/Achievements Card */}
                    <Card className="bg-[#11141D] border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start sm:items-center mb-6 flex-col sm:flex-row gap-4">
                                <div className="flex items-center gap-4 flex-wrap">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Medal className="w-5 h-5 text-amber-400" />
                                        Mural de Insígnias
                                    </h3>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="bg-[#8347EB]/10 border-[#8347EB]/30 text-[#8347EB] hover:bg-[#8347EB]/20 hover:text-[#8347EB] h-7 text-xs">
                                                Como ganhar?
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-[#11141D] border-white/10 text-white max-w-lg">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                                    <Medal className="w-6 h-6 text-amber-400" />
                                                    Como desbloquear Insígnias?
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-6 py-4">
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-[15px] text-[#8347EB] flex items-center gap-2">
                                                        <Target className="w-4 h-4" /> Desafios e Metas
                                                    </h4>
                                                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                                                        Conclua os desafios ativos da Gamônia. Acumular desafios concluídos desbloqueia insígnias exclusivas como o <strong className="text-white">"Primeiro Passo"</strong> (1º desafio) e <strong className="text-white">"Máquina de Metas"</strong> (10 desafios).
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-[15px] text-emerald-400 flex items-center gap-2">
                                                        <Star className="w-4 h-4" /> Evolução de Nível
                                                    </h4>
                                                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                                                        A cada novo marco de XP atingido (Nível 5, 10, 50, etc.), você recebe automaticamente medalhas de prestígio que demonstram sua consistência na empresa.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="font-bold text-[15px] text-amber-400 flex items-center gap-2">
                                                        <Trophy className="w-4 h-4" /> Reconhecimento Especial
                                                    </h4>
                                                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                                                        A diretoria e gestão podem conceder insígnias raras e personalizadas manualmente por desempenho excepcional, trabalho em equipe de destaque ou inovações.
                                                    </p>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Badge variant="secondary" className="bg-white/5 text-[#94A3B8] border-none whitespace-nowrap">
                                    {userBadges?.length || 0} desbloqueadas
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {userBadges?.map(userBadge => (
                                    <div
                                        key={userBadge.badge_id}
                                        className="flex flex-col items-center gap-2 group cursor-pointer"
                                        title={userBadge.badge?.description}
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                            "bg-[#8347EB]/10 border-2 border-[#8347EB]/30 text-[#8347EB] group-hover:scale-110 shadow-[0_0_20px_rgba(131,71,235,0.1)]"
                                        )}>
                                            <Star size={24} />
                                        </div>
                                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full text-white/80">
                                            {userBadge.badge?.name}
                                        </span>
                                    </div>
                                ))}
                                {(!userBadges || userBadges.length === 0) && (
                                    <div className="col-span-3 py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <p className="text-xs text-white/40">Nenhuma insígnia desbloqueada ainda.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Active Challenges */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Target className="w-6 h-6 text-emerald-400" />
                            Desafios Ativos
                        </h2>
                        <Button variant="ghost" className="text-[#94A3B8] hover:text-white hover:bg-white/5 text-sm h-8 px-3">
                            Ver todos <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>

                    <div className="grid gap-4">
                        {challenges?.map(challenge => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={{
                                    ...challenge,
                                    progress: userChallengesProgress?.find(p => p.challenge_id === challenge.id)?.progress || 0,
                                    total: 10, // Default total for now
                                    completed: userChallengesProgress?.find(p => p.challenge_id === challenge.id)?.status === 'completed'
                                }}
                            />
                        ))}
                        {(!challenges || challenges.length === 0) && (
                            <div className="py-20 text-center bg-[#11141D] rounded-2xl border border-dashed border-white/5">
                                <Trophy className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <p className="text-white/40">Nenhum desafio ativo no momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengeCard = ({ challenge }: any) => {
    const isCompleted = challenge.progress >= (challenge.total || 10) || challenge.completed;
    const pct = isCompleted ? 100 : (challenge.progress / (challenge.total || 10)) * 100;

    // Default icons/colors if not in DB
    const colorClasses: Record<string, string> = {
        orange: "from-amber-500 to-orange-600 text-amber-500 bg-amber-500/10",
        blue: "from-blue-500 to-cyan-500 text-blue-500 bg-blue-500/10",
        purple: "from-[#8347EB] to-purple-600 text-[#8347EB] bg-[#8347EB]/10",
        green: "from-emerald-400 to-emerald-600 text-emerald-400 bg-emerald-400/10",
    };

    const gradient = colorClasses[challenge.color] || colorClasses.purple;
    const iconColor = gradient.split(' ')[2];
    const iconBg = gradient.split(' ')[3];
    const TypeIcon = challenge.type === 'vendas' ? TrendingUp : challenge.type === 'participacao' ? CalendarCheck : Target;

    return (
        <Card className={cn(
            "bg-[#11141D] border-white/5 rounded-2xl overflow-hidden transition-all duration-300 relative group",
            isCompleted ? "border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]" : "hover:border-white/10"
        )}>
            {isCompleted && (
                <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-2 py-0.5 pointer-events-none">
                        CONCLUÍDO
                    </Badge>
                </div>
            )}

            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className={cn("w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center border border-white/5 shadow-inner", iconBg)}>
                        <TypeIcon size={28} className={iconColor} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors flex items-center gap-2">
                                    {challenge.title}
                                    {challenge.type === 'vendas' && <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-none">Vendas</Badge>}
                                    {challenge.type === 'participacao' && <Badge variant="secondary" className="text-[10px] bg-blue-500/20 text-blue-400 border-none">Participação</Badge>}
                                </h3>
                                <p className="text-[#94A3B8] text-sm mb-3">
                                    {challenge.description}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 w-full mt-auto">
                            <div className="flex justify-between items-end">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wider",
                                    isCompleted ? "text-emerald-400" : iconColor
                                )}>
                                    Recompensa: {challenge.xp_reward} XP
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {challenge.progress} / {challenge.total || 10}
                                </span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-1000 ease-out", isCompleted ? "bg-emerald-500" : `bg-gradient-to-r ${gradient.split(' ')[0]} ${gradient.split(' ')[1]}`)}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default GamificationPage;
