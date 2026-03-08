
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserGamification {
    user_id: string;
    xp: number;
    level: number;
    points: number;
    updated_at: string;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    xp_reward: number;
    points_reward: number;
    sector_id?: string | null;
    type: string;
    is_active: boolean;
}

export interface UserChallenge {
    user_id: string;
    challenge_id: string;
    progress: number;
    status: 'active' | 'completed';
    completed_at: string | null;
    challenge?: Challenge;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    color_hex: string;
}

export interface UserBadge {
    user_id: string;
    badge_id: string;
    unlocked_at: string;
    badge?: Badge;
}

export interface MonthlyMilestone {
    id: string;
    label: string;
    xp_required: number;
    icon_name: string;
    color_hex: string;
}

export interface LeaderboardEntry {
    user_id: string;
    xp: number;
    level: number;
    full_name: string;
    avatar_url?: string;
}

// 1. Hook to fetch user gamification stats
export function useUserGamification(userId?: string) {
    return useQuery({
        queryKey: ["user_gamification", userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_gamification")
                .select("*")
                .eq("user_id", userId)
                .maybeSingle();

            if (error) throw error;
            return data as UserGamification | null;
        },
    });
}

// 2. Hook to fetch active challenges
export function useChallenges(sectorId?: string) {
    return useQuery({
        queryKey: ["gamification_challenges", sectorId],
        queryFn: async () => {
            let query = supabase
                .from("gamification_challenges")
                .select("*")
                .eq("is_active", true);

            if (sectorId) {
                query = query.or(`sector_id.eq.${sectorId},sector_id.is.null`);
            } else {
                query = query.is("sector_id", null);
            }

            const { data, error } = await query;
            if (error) {
                console.error("Error fetching challenges:", error);
                return [] as Challenge[];
            }
            return (data || []) as Challenge[];
        },
    });
}

// 3. Hook to fetch user challenge progress
export function useUserChallenges(userId?: string) {
    return useQuery({
        queryKey: ["user_challenges", userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_challenges")
                .select(`
                    *,
                    challenge:gamification_challenges(*)
                `)
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching user challenges:", error);
                return [] as UserChallenge[];
            }
            return (data || []) as UserChallenge[];
        },
    });
}

// 4. Hook to fetch unlocked badges
export function useUserBadges(userId?: string) {
    return useQuery({
        queryKey: ["user_badges", userId],
        enabled: !!userId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_badges")
                .select(`
                    *,
                    badge:gamification_badges(*)
                `)
                .eq("user_id", userId);

            if (error) {
                console.error("Error fetching user badges:", error);
                return [] as UserBadge[];
            }
            return (data || []) as UserBadge[];
        },
    });
}

// 5. Hook to fetch Leaderboard
export function useLeaderboard() {
    return useQuery({
        queryKey: ["gamification_leaderboard"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("user_gamification")
                .select(`
                    xp,
                    level,
                    user_id,
                    user:employees!user_id(full_name, avatar_url)
                `)
                .order("xp", { ascending: false })
                .limit(10);

            if (error) {
                console.error("Error fetching leaderboard:", error);
                return [] as LeaderboardEntry[];
            }

            if (!data) return [] as LeaderboardEntry[];

            return data.map((entry: any) => ({
                user_id: entry.user_id,
                xp: entry.xp,
                level: entry.level,
                full_name: entry.user?.full_name || "Colaborador",
                avatar_url: entry.user?.avatar_url
            })) as LeaderboardEntry[];
        },
    });
}

// 6. Mutation to update XP (Internal use or admin)
export function useAddXP() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, amount }: { userId: string, amount: number }) => {
            // This would ideally be a RPC function to ensure atomicity
            const { data: current } = await supabase
                .from("user_gamification")
                .select("xp, level")
                .eq("user_id", userId)
                .single();

            if (!current) throw new Error("User profile not found");

            const newXp = current.xp + amount;
            // Simple level logic: level = floor(sqrt(xp / 100)) + 1
            const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

            const { error } = await supabase
                .from("user_gamification")
                .update({
                    xp: newXp,
                    level: newLevel,
                    points: current.points + (amount / 2) // Example: 2 XP = 1 Point
                })
                .eq("user_id", userId);

            if (error) throw error;

            if (newLevel > current.level) {
                toast.success(`Parabéns! Você subiu para o nível ${newLevel}! 🎊`);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["user_gamification", variables.userId] });
            queryClient.invalidateQueries({ queryKey: ["gamification_leaderboard"] });
        },
    });
}

// 7. Mutation to create a new challenge
export function useCreateChallenge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (challenge: Omit<Challenge, "id" | "is_active">) => {
            const { data, error } = await supabase
                .from("gamification_challenges")
                .insert([challenge])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
    });
}

// 8. Mutation to update a challenge
export function useUpdateChallenge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...challenge }: Partial<Challenge> & { id: string }) => {
            const { data, error } = await supabase
                .from("gamification_challenges")
                .update(challenge)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification_challenges"] });
            toast.success("Desafio atualizado com sucesso!");
        },
    });
}

// 9. Mutation to delete a challenge
export function useDeleteChallenge() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("gamification_challenges")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gamification_challenges"] });
            toast.success("Desafio excluído com sucesso!");
        },
        onError: (error: any) => {
            console.error("Error deleting challenge:", error);
            toast.error("Erro ao excluir. O desafio pode já estar em uso.");
        }
    });
}
