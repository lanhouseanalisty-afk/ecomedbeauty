import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

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

            // Buscar avatar do perfil se houver user_id vinculado
            if (data.user_id) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('avatar_url')
                    .eq('id', data.user_id)
                    .maybeSingle();

                if (profileData) {
                    (data as any).avatar_url = profileData.avatar_url;
                }
            }

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
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('employee_posts')
                .select(`
                    *,
                    author:profiles(full_name, avatar_url),
                    likes:employee_post_likes(user_id),
                    comments:employee_post_comments(*, author:profiles(full_name, avatar_url))
                `)
                .eq('employee_id', actualEmployeeId)
                .gte('created_at', sevenDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) {
                console.error("❌ Erro ao buscar posts:", error);
                return [];
            }

            // Enrich likes with employee names via second pass
            if (data && data.length > 0) {
                const allUserIds = [...new Set(data.flatMap((p: any) => (p.likes || []).map((l: any) => l.user_id)))].filter(Boolean);
                if (allUserIds.length > 0) {
                    const { data: employees } = await supabase
                        .from('employees')
                        .select('user_id, full_name')
                        .in('user_id', allUserIds);

                    const nameMap: Record<string, string> = {};
                    (employees || []).forEach((e: any) => { if (e.user_id) nameMap[e.user_id] = e.full_name; });

                    return data.map((post: any) => ({
                        ...post,
                        likes: (post.likes || []).map((l: any) => ({
                            ...l,
                            full_name: nameMap[l.user_id] || null
                        }))
                    }));
                }
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

    const { data: tickets, isLoading: isLoadingTickets } = useQuery({
        queryKey: ['employee-tickets', employee?.user_id],
        queryFn: async () => {
            if (!employee?.user_id) return [];
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    *,
                    category:ticket_categories(name)
                `)
                .eq('requester_id', employee.user_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!employee?.user_id
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
        mutationFn: async ({ content, imageUrl }: { content: string, imageUrl?: string }) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");
            if (!actualEmployeeId) throw new Error("Employee not found");

            console.log("Inserting post for employee:", actualEmployeeId);

            const { error } = await supabase
                .from('employee_posts')
                .insert({
                    employee_id: actualEmployeeId,
                    author_id: user.user.id,
                    content,
                    image_url: imageUrl
                });

            if (error) {
                console.error("Mutation error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log("Post published! Refreshing...");
            // Invalidate and refetch immediately
            queryClient.invalidateQueries({ queryKey: ['employee-posts', actualEmployeeId] });
        }
    });

    const deletePost = useMutation({
        mutationFn: async (postId: string) => {
            console.log("🔥 Tentando excluir post:", postId);
            const { error, count } = await supabase
                .from('employee_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error("❌ Erro técnico no Supabase ao excluir:", error);
                throw error;
            }

            console.log("✅ Resposta do Supabase para exclusão. Linhas afetadas:", count);
            // Se count for 0 e não houver erro, é 100% certeza que o RLS bloqueou.
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['employee-posts', actualEmployeeId] });
            const previousPosts = queryClient.getQueryData(['employee-posts', actualEmployeeId]);

            queryClient.setQueryData(['employee-posts', actualEmployeeId], (old: any) =>
                old?.filter((post: any) => post.id !== postId)
            );

            return { previousPosts };
        },
        onError: (err, postId, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['employee-posts', actualEmployeeId], context.previousPosts);
            }
            toast.error("Erro ao excluir postagem");
        },
        onSuccess: () => {
            toast.success("Postagem excluída!");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-posts', actualEmployeeId] });
        }
    });

    const toggleLike = useMutation({
        mutationFn: async (postId: string) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { data: existingLike } = await supabase
                .from('employee_post_likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', user.user.id)
                .maybeSingle();

            if (existingLike) {
                const { error } = await supabase
                    .from('employee_post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.user.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('employee_post_likes')
                    .insert({
                        post_id: postId,
                        user_id: user.user.id
                    });
                if (error) throw error;
            }
        },
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ['employee-posts', actualEmployeeId] });
            const previousPosts = queryClient.getQueryData(['employee-posts', actualEmployeeId]);
            const { data: userData } = await supabase.auth.getUser();

            queryClient.setQueryData(['employee-posts', actualEmployeeId], (old: any) =>
                old?.map((post: any) => {
                    if (post.id === postId) {
                        const alreadyLiked = post.likes?.some((l: any) => l.user_id === userData.user?.id);
                        const newLikes = alreadyLiked
                            ? post.likes.filter((l: any) => l.user_id !== userData.user?.id)
                            : [...(post.likes || []), { user_id: userData.user?.id }];
                        return { ...post, likes: newLikes };
                    }
                    return post;
                })
            );

            return { previousPosts };
        },
        onError: (err, postId, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['employee-posts', actualEmployeeId], context.previousPosts);
            }
            toast.error("Erro ao processar curtida");
        },
        onSettled: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            queryClient.invalidateQueries({ queryKey: ['employee-posts', actualEmployeeId] });
        }
    });

    const addComment = useMutation({
        mutationFn: async ({ postId, content }: { postId: string, content: string }) => {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('employee_post_comments')
                .insert({
                    post_id: postId,
                    author_id: user.user.id,
                    content
                });

            if (error) throw error;
        },
        onMutate: async ({ postId, content }) => {
            await queryClient.cancelQueries({ queryKey: ['employee-posts', actualEmployeeId] });
            const previousPosts = queryClient.getQueryData(['employee-posts', actualEmployeeId]);

            const tempComment = {
                id: Math.random().toString(),
                post_id: postId,
                content,
                created_at: new Date().toISOString(),
                author: {
                    full_name: employee?.full_name || "Você",
                    avatar_url: employee?.avatar_url
                }
            };

            queryClient.setQueryData(['employee-posts', actualEmployeeId], (old: any) =>
                old?.map((post: any) => {
                    if (post.id === postId) {
                        return { ...post, comments: [...(post.comments || []), tempComment] };
                    }
                    return post;
                })
            );

            return { previousPosts };
        },
        onError: (err, variables, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['employee-posts', actualEmployeeId], context.previousPosts);
            }
            toast.error("Erro ao adicionar comentário");
        },
        onSettled: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            queryClient.invalidateQueries({ queryKey: ['employee-posts', actualEmployeeId] });
        }
    });

    return {
        employee,
        assets,
        posts,
        leaves,
        visits,
        tickets,
        isLoading: isLoadingEmployee || isLoadingAssets || isLoadingPosts || isLoadingLeaves || isLoadingVisits || isLoadingTickets,
        createPost,
        deletePost,
        toggleLike,
        addComment,
        recordVisit
    };
}
