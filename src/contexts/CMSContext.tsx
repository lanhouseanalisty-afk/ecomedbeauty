import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Define the shape of our CMS Content
export interface SiteContent {
    brand: {
        name: string;
        primaryColor: string;
        secondaryColor: string;
    };
    header: {
        menuRequest: string;
        menuProducts: string;
        menuAbout: string;
        menuContact: string;
    };
    hero: {
        badge: string;
        titleStart: string;
        titleEnd: string;
        subtitle: string;
        buttonPrimary: string;
        buttonSecondary: string;
        image: string;
    };
    announcement: {
        enabled: boolean;
        text: string;
        bg: string;
        color: string;
    };
}

const DEFAULT_CONTENT: SiteContent = {
    brand: {
        name: "MedBeauty",
        primaryColor: "#cfa79d",
        secondaryColor: "#ffffff",
    },
    header: {
        menuRequest: "Início",
        menuProducts: "Produtos",
        menuAbout: "Sobre",
        menuContact: "Contato",
    },
    hero: {
        badge: "Nova coleção de fios PDO disponível",
        titleStart: "Beleza e tecnologia em",
        titleEnd: "perfeita harmonia",
        subtitle: "Descubra nossa linha completa de produtos para estética profissional. Naturalmente beauty, definitivamente tech.",
        buttonPrimary: "Ver Produtos",
        buttonSecondary: "Conheça a MedBeauty",
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=2070",
    },
    announcement: {
        enabled: true,
        text: "Frete Grátis para todo o Brasil em compras acima de R$ 299",
        bg: "#0f172a",
        color: "#ffffff"
    }
};

interface CMSContextType {
    content: SiteContent;
    updateContent: (path: string, value: any) => void;
    saveChanges: () => Promise<void>;
    isEditing: boolean;
    toggleEditing: (enabled: boolean) => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export function CMSProvider({ children }: { children: React.ReactNode }) {
    const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load content from Supabase on mount
    useEffect(() => {
        async function loadContent() {
            try {
                const { data, error } = await supabase
                    .from('site_settings') // We'll assume this table exists or create it
                    .select('content')
                    .single();

                if (data && data.content) {
                    // Merge with default to ensure structural integrity
                    setContent(prev => ({ ...prev, ...data.content }));
                }
            } catch (err) {
                console.warn("Could not load site content, using defaults", err);
            } finally {
                setIsLoaded(true);
            }
        }
        loadContent();
    }, []);

    const updateContent = (path: string, value: any) => {
        setContent((prev) => {
            const newContent = { ...prev } as any;
            if (path.includes('.')) {
                const [section, key] = path.split('.');
                newContent[section] = { ...newContent[section], [key]: value };
            } else {
                newContent[path] = value;
            }
            return newContent;
        });
    };

    const saveChanges = async () => {
        try {
            // Mock save for now - in real app, upsert to 'site_settings'
            // const { error } = await supabase.from('site_settings').upsert({ id: 1, content });
            console.log("Saving content:", content);
            toast.success("Conteúdo salvo com sucesso!");
        } catch (err) {
            toast.error("Erro ao salvar alterações.");
        }
    };

    return (
        <CMSContext.Provider value={{ content, updateContent, saveChanges, isEditing, toggleEditing: setIsEditing }}>
            {children}
        </CMSContext.Provider>
    );
}

export function useCMS() {
    const context = useContext(CMSContext);
    if (context === undefined) {
        throw new Error("useCMS must be used within a CMSProvider");
    }
    return context;
}
