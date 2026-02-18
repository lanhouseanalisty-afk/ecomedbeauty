
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PricingIngredient {
    id: string;
    name: string;
    unit: string;
    cost_per_unit: number;
    supplier?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PricingRecipe {
    id: string;
    product_id: string;
    ingredient_id: string;
    quantity: number;
    ingredient?: PricingIngredient;
    created_at?: string;
    updated_at?: string;
}

// Ingredients Hooks
export function usePricingIngredients() {
    return useQuery({
        queryKey: ["pricing_ingredients"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pricing_ingredients")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            return data as PricingIngredient[];
        },
    });
}

export function useCreatePricingIngredient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ingredient: Omit<PricingIngredient, "id" | "created_at" | "updated_at">) => {
            const { data, error } = await supabase
                .from("pricing_ingredients")
                .insert(ingredient)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing_ingredients"] });
            toast.success("Ingrediente criado com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao criar ingrediente: " + error.message);
        },
    });
}

export function useUpdatePricingIngredient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }: Partial<PricingIngredient> & { id: string }) => {
            const { data, error } = await supabase
                .from("pricing_ingredients")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing_ingredients"] });
            toast.success("Ingrediente atualizado!");
        },
        onError: (error: any) => {
            toast.error("Erro ao atualizar ingrediente: " + error.message);
        },
    });
}

export function useDeletePricingIngredient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("pricing_ingredients")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing_ingredients"] });
            toast.success("Ingrediente excluído!");
        },
        onError: (error: any) => {
            toast.error("Erro ao excluir ingrediente: " + error.message);
        },
    });
}

// Recipes Hooks
export function usePricingRecipes(productId?: string) {
    return useQuery({
        queryKey: ["pricing_recipes", productId],
        enabled: !!productId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pricing_recipes")
                .select(`
          *,
          ingredient:pricing_ingredients(*)
        `)
                .eq("product_id", productId);

            if (error) throw error;
            return data as (PricingRecipe & { ingredient: PricingIngredient })[];
        },
    });
}

export function useAllPricingRecipes() {
    return useQuery({
        queryKey: ["pricing_recipes_all"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("pricing_recipes")
                .select(`
            *,
            ingredient:pricing_ingredients(*)
          `);

            if (error) throw error;
            return data as (PricingRecipe & { ingredient: PricingIngredient })[];
        },
    });
}

export function useUpdatePricingRecipe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (items: { product_id: string; ingredients: { ingredient_id: string; quantity: number }[] }) => {
            // First delete existing recipes for this product
            const { error: deleteError } = await supabase
                .from("pricing_recipes")
                .delete()
                .eq("product_id", items.product_id);

            if (deleteError) throw deleteError;

            if (items.ingredients.length === 0) return;

            // Then insert new ones
            const { data, error } = await supabase
                .from("pricing_recipes")
                .insert(
                    items.ingredients.map(ing => ({
                        product_id: items.product_id,
                        ingredient_id: ing.ingredient_id,
                        quantity: ing.quantity,
                    }))
                )
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["pricing_recipes", variables.product_id] });
            queryClient.invalidateQueries({ queryKey: ["pricing_recipes_all"] });
            toast.success("Receita atualizada com sucesso!");
        },
        onError: (error: any) => {
            toast.error("Erro ao atualizar receita: " + error.message);
        },
    });
}
