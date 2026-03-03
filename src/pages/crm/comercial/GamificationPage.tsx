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
    Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const GamificationPage = () => {
    const { user } = useAuth();

    // Mock data for gamification
    const userLevel = 12;
    const currentXp = 8500;
    const nextLevelXp = 10000;
    const xpProgress = (currentXp / nextLevelXp) * 100;

    const activeChallenges = [
        { id: 1, title: "Sprint de Vendas", description: "Feche 5 contratos nesta semana.", progress: 3, total: 5, reward: "500 XP", icon: Flame, color: "orange" },
        { id: 2, title: "Ticket Médio", description: "Mantenha o ticket médio acima de R$ 2.000.", progress: 100, total: 100, reward: "Medalha de Ouro", icon: Target, color: "blue", completed: true },
        { id: 3, title: "Prospecção Ativa", description: "Realize 50 ligações para novos leads.", progress: 20, total: 50, reward: "200 XP", icon: Zap, color: "purple" },
    ];

    const badges = [
        { id: 1, name: "Primeiro Sangue", description: "Feche sua primeira venda.", icon: Medal, unlocked: true, color: "yellow" },
        { id: 2, name: "Negociador Mestre", description: "Venda acima de 10k em um único dia.", icon: Award, unlocked: true, color: "purple" },
        { id: 3, name: "Estrela do Mês", description: "Seja o número 1 no ranking mensal.", icon: Star, unlocked: false, color: "slate" },
        { id: 4, name: "Implacável", description: "Bata a meta em menos de 15 dias.", icon: Flame, unlocked: false, color: "slate" },
        { id: 5, name: "Sniper", description: "Taxa de conversão acima de 30% no mês.", icon: Target, unlocked: false, color: "slate" },
        { id: 6, name: "Guardião da Empresa", description: "Zero churn na carteira por 3 meses.", icon: Shield, unlocked: false, color: "slate" },
    ];

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
                    <Button variant="outline" className="bg-[#11141D] border-white/10 text-white hover:bg-white/5">
                        <Award className="w-4 h-4 mr-2 text-amber-400" />
                        Ver Ranking
                    </Button>
                    <Button className="bg-[#8347EB] hover:bg-[#8347EB]/90 text-white border-0 shadow-[0_0_20px_rgba(131,71,235,0.4)]">
                        + Novo Desafio
                    </Button>
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
                        </CardContent>
                    </Card>

                    {/* Badges/Achievements Card */}
                    <Card className="bg-[#11141D] border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Medal className="w-5 h-5 text-amber-400" />
                                    Mural de Insígnias
                                </h3>
                                <Badge variant="secondary" className="bg-white/5 text-[#94A3B8] border-none">
                                    {badges.filter(b => b.unlocked).length}/{badges.length}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {badges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className="flex flex-col items-center gap-2 group cursor-pointer"
                                        title={badge.description}
                                    >
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                            badge.unlocked
                                                ? `bg-${badge.color}-500/10 border-2 border-${badge.color}-500/30 text-${badge.color}-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(var(--${badge.color}-500),0.3)]`
                                                : "bg-white/5 border-2 border-dashed border-white/10 text-white/20 grayscale"
                                        )}>
                                            {badge.unlocked ? <badge.icon size={24} /> : <Lock size={20} />}
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-bold text-center leading-tight truncate w-full",
                                            badge.unlocked ? "text-white/80" : "text-white/30"
                                        )}>
                                            {badge.name}
                                        </span>
                                    </div>
                                ))}
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
                        {activeChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChallengeCard = ({ challenge }: any) => {
    const isCompleted = challenge.progress >= challenge.total || challenge.completed;
    const pct = isCompleted ? 100 : (challenge.progress / challenge.total) * 100;
    const Icon = challenge.icon;

    const colorClasses: Record<string, string> = {
        orange: "from-amber-500 to-orange-600 text-amber-500 bg-amber-500/10",
        blue: "from-blue-500 to-cyan-500 text-blue-500 bg-blue-500/10",
        purple: "from-[#8347EB] to-purple-600 text-[#8347EB] bg-[#8347EB]/10",
        green: "from-emerald-400 to-emerald-600 text-emerald-400 bg-emerald-400/10",
    };

    const gradient = colorClasses[challenge.color] || colorClasses.blue;
    const iconColor = gradient.split(' ')[2];
    const iconBg = gradient.split(' ')[3];

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
                        <Icon size={28} className={iconColor} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-white/90 transition-colors">
                                    {challenge.title}
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
                                    Recompensa: {challenge.reward}
                                </span>
                                <span className="text-xs font-bold text-white">
                                    {challenge.progress} / {challenge.total}
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

// Shield icon missing from initial import, adding it here for the badge
function Shield(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
    );
}

export default GamificationPage;
