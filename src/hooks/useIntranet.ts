
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnifiedEmployee {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    position_title?: string;
    department_name?: string;
    bio?: string;
    skills?: string[];
    social_links?: any;
}

export interface InternalIdea {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: string;
    status: 'new' | 'analyzing' | 'implemented' | 'discarded';
    upvotes: string[];
    created_at: string;
    author_name?: string;
}

export interface StoreRequest {
    id: string;
    employee_id: string;
    product_id: string;
    quantity: number;
    status: 'pending' | 'approved' | 'delivered' | 'cancelled';
    payment_method: string;
    notes?: string;
    created_at: string;
    product?: {
        name: string;
        image_url: string;
        price: number;
    }
}

// 1. Employee Directory Hooks
export function useEmployeeDirectory() {
    return useQuery({
        queryKey: ["employee_directory"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("employees")
                .select(`
          id,
          full_name,
          email,
          phone,
          bio,
          skills,
          social_links,
          department:departments(name),
          position:positions(title)
        `)
                .eq("status", "active");

            if (error) throw error;

            return data.map((emp: any) => ({
                ...emp,
                department_name: emp.department?.name,
                position_title: emp.position?.title
            })) as UnifiedEmployee[];
        },
    });
}

// 2. Idea Bank Hooks
export function useIdeaBank() {
    return useQuery({
        queryKey: ["internal_ideas"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("internal_ideas")
                .select(`
          *,
          user:employees!user_id(full_name)
        `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            return data.map((idea: any) => ({
                ...idea,
                author_name: idea.user?.full_name || 'Desconhecido'
            })) as InternalIdea[];
        },
    });
}

export function useCreateIdea() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (idea: Omit<InternalIdea, "id" | "upvotes" | "created_at" | "status" | "author_name">) => {
            const { data, error } = await supabase
                .from("internal_ideas")
                .insert([idea])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["internal_ideas"] });
            toast.success("Ideia enviada com sucesso! Obrigado por colaborar.");
        },
    });
}

export function useVoteIdea() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ ideaId, userId, currentUpvotes }: { ideaId: string, userId: string, currentUpvotes: string[] }) => {
            let newUpvotes = [...currentUpvotes];
            if (newUpvotes.includes(userId)) {
                newUpvotes = newUpvotes.filter(id => id !== userId);
            } else {
                newUpvotes.push(userId);
            }

            const { error } = await supabase
                .from("internal_ideas")
                .update({ upvotes: newUpvotes })
                .eq("id", ideaId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["internal_ideas"] });
        },
    });
}

// 3. Corporate Store Hooks
export function useCorporateStoreRequests(employeeId?: string) {
    return useQuery({
        queryKey: ["corporate_store_requests", employeeId],
        enabled: !!employeeId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("corporate_store_requests")
                .select(`
          *,
          product:products(name, image_url, price)
        `)
                .eq("employee_id", employeeId);

            if (error) throw error;
            return data as StoreRequest[];
        },
    });
}

export function useCreateStoreRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: Omit<StoreRequest, "id" | "created_at" | "status" | "product">) => {
            const { data, error } = await supabase
                .from("corporate_store_requests")
                .insert([request])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["corporate_store_requests"] });
            toast.success("Solicitação enviada! O RH entrará em contato.");
        },
    });
}
