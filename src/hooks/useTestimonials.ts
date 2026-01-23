import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    location: string;
    avatar: string;
    content: string;
    rating: number;
}

const localTestimonials: Testimonial[] = [
    {
        id: "1",
        name: "Dra. Marina Costa",
        role: "Dermatologista",
        location: "São Paulo, SP",
        avatar: "MC",
        content: "A MedBeauty revolucionou minha clínica. Produtos de qualidade excepcional e suporte técnico impecável.",
        rating: 5,
    },
    {
        id: "2",
        name: "Dr. Roberto Lima",
        role: "Cirurgião Plástico",
        location: "Rio de Janeiro, RJ",
        avatar: "RL",
        content: "Confio nos produtos MedBeauty há mais de 5 anos. A consistência e qualidade são incomparáveis.",
        rating: 5,
    },
    {
        id: "3",
        name: "Dra. Patricia Alves",
        role: "Esteticista",
        location: "Belo Horizonte, MG",
        avatar: "PA",
        content: "Meus pacientes percebem a diferença. Os resultados com os fios i-THREAD são extraordinários.",
        rating: 5,
    },
];

export function useTestimonials() {
    return useQuery({
        queryKey: ["testimonials"],
        queryFn: async () => {
            try {
                const { data, error } = await supabase
                    .from("testimonials")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                return data as Testimonial[];
            } catch (error) {
                console.warn("Supabase fetch failed for testimonials, using local data:", error);
                return localTestimonials;
            }
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });
}
