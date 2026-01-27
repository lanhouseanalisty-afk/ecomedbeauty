import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export function useEmployeeProfile(employeeId: string) {
    const queryClient = useQueryClient();

    const { data: employee, isLoading: isLoadingEmployee } = useQuery({
        queryKey: ['employee', employeeId],
        queryFn: async () => {
            let query = supabase.from('employees').select(`
                *,
                department:departments(name),
                position:positions(title)
            `);

            if (employeeId && employeeId !== 'meu-perfil') {
                query = query.eq('id', employeeId);
            } else {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) throw new Error("Not authenticated");
                query = query.eq('user_id', userData.user.id);
            }

            const { data, error } = await query.single();
            if (error) throw error;
            return data;
        },
        enabled: true
    });

    const actualEmployeeId = employee?.id;

    const { data: assets, isLoading: isLoadingAssets } = useQuery({
        queryKey: ['employee-assets', actualEmployeeId],
        queryFn: async () => {
            if (!employee) return [];

            const { data, error } = await supabase
                .from('tech_assets')
                .select('*')
                .ilike('assigned_to_name', `%${employee.full_name}%`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!employee
    });

    const { data: posts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ['employee-posts', actualEmployeeId],
        queryFn: async () => {
            if (!actualEmployeeId) return [];
            console.log("🔍 Buscando posts para o ID:", actualEmployeeId);
            const { data, error } = await supabase
                .from('employee_posts')
                .select('*')
                .eq('employee_id', actualEmployeeId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("❌ Erro ao buscar posts:", error);
                return [];
            }
            console.log("✅ Posts retornados:", data?.length);
            return data || [];
        },
        enabled: !!actualEmployeeId
    });

    const { data: leaves, isLoading: isLoadingLeaves } = useQuery({
        queryKey: ['employee-leaves', actualEmployeeId],
        queryFn: async () => {
            if (!employee) return [];
            const { data, error } = await supabase
                .from('leave_requests')
                .select('*')
                .eq('employee_id', employee.id);
            if (error) throw error;
            return data || [];
        },
        enabled: !!employee
    });

    const { data: visits, isLoading: isLoadingVisits } = useQuery({
        queryKey: ['profile-visits', actualEmployeeId],
        queryFn: async () => {
            if (!actualEmployeeId) return [];
            const { data, error } = await supabase
                .from('profile_visits')
                .select('*, visitor:visitor_id(email)')
                .eq('profile_id', actualEmployeeId);
            if (error) return [];
            return data || [];
        },
        enabled: !!actualEmployeeId
    });

    const recordVisit = useMutation({
        mutationFn: async () => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user || !actualEmployeeId) return;

            await supabase.from('profile_visits').insert({
                profile_id: actualEmployeeId,
                visitor_id: user.user.id
            });
        }
    });

    const createPost = useMutation({
        mutationFn: async (content: string) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");
            if (!actualEmployeeId) throw new Error("Employee not found");

            console.log("Inserting post for employee:", actualEmployeeId);

            const { error } = await supabase
                .from('employee_posts')
                .insert({
                    employee_id: actualEmployeeId,
                    author_id: user.user.id,
                    content
                });

            if (error) {
                console.error("Mutation error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Post published! Refreshing...");
            queryClient.invalidateQueries({ queryKey: ['employee-posts', actualEmployeeId] });
            queryClient.refetchQueries({ queryKey: ['employee-posts', actualEmployeeId] });
        }
    });

    return {
        employee,
        assets,
        posts,
        leaves,
        visits,
        isLoading: isLoadingEmployee || isLoadingAssets || isLoadingPosts || isLoadingLeaves || isLoadingVisits,
        createPost,
        recordVisit
    };
}
