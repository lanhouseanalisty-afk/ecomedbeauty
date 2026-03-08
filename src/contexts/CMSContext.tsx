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
        menuProducts: string;
        menuAbout: string;
        menuContact: string;
    };
    announcement: {
        enabled: boolean;
        text: string;
        bg: string;
        color: string;
    };
    home: {
        hero: {
            badge: string;
            titleStart: string;
            titleEnd: string;
            subtitle: string;
            buttonPrimary: string;
            buttonSecondary: string;
            image: string;
        };
        brands: {
            badge: string;
            title: string;
        };
        innovation: {
            badge: string;
            titleStart: string;
            titleEnd: string;
            description: string;
            buttonText: string;
        };
        evidence: {
            badge: string;
            titleStart: string;
            titleHighlight: string;
            description: string;
            stat1Value: string;
            stat1Label: string;
            stat2Value: string;
            stat2Label: string;
            image: string;
        };
        newsletter: {
            badge: string;
            titleStart: string;
            titleEnd: string;
            description: string;
            buttonText: string;
        };
        endorsements: {
            badge: string;
            titleStart: string;
            titleEnd: string;
            description: string;
        };
        featured: {
            title: string;
            subtitle: string;
        };
    };
    about: {
        heroTitle: string;
        heroSubtitle: string;
        missionTitle: string;
        missionText1: string;
        missionText2: string;
        valuesTitle: string;
        valuesSubtitle: string;
        stat1Value: string;
        stat1Label: string;
        stat2Value: string;
        stat2Label: string;
        stat3Value: string;
        stat3Label: string;
        stat4Value: string;
        stat4Label: string;
        image: string;
    };
}

const DEFAULT_CONTENT: SiteContent = {
    brand: {
        name: "MedBeauty",
        primaryColor: "#cfa79d",
        secondaryColor: "#ffffff",
    },
    header: {
        menuProducts: "Produtos",
        menuAbout: "Sobre",
        menuContact: "Contato",
    },
    announcement: {
        enabled: true,
        text: "Frete Grátis para todo o Brasil em compras acima de R$ 299",
        bg: "#0f172a",
        color: "#ffffff"
    },
    home: {
        hero: {
            badge: "Nova coleção de fios PDO disponível",
            titleStart: "Beleza e tecnologia em",
            titleEnd: "perfeita harmonia",
            subtitle: "Descubra nossa linha completa de produtos para estética profissional. Naturalmente beauty, definitivamente tech.",
            buttonPrimary: "Ver Produtos",
            buttonSecondary: "Conheça a MedBeauty",
            image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=2070",
        },
        brands: {
            badge: "Portfólio Global",
            title: "Marcas de Confiança",
        },
        innovation: {
            badge: "Inovação Laboratorial",
            titleStart: "A Ciência por Trás da",
            titleEnd: "Excelência",
            description: "Não criamos apenas produtos; desenvolvemos protocolos científicos de alta performance para profissionais que buscam resultados previsíveis e seguros.",
            buttonText: "Explorar Portfólio Técnico",
        },
        evidence: {
            badge: "Protocolo de Segurança",
            titleStart: "Evidência Clínica de",
            titleHighlight: "Alta Performance",
            description: "Nossos processos são auditados internacionalmente, garantindo que cada miligrama de produto entregue a pureza necessária para procedimentos de alta complexidade.",
            stat1Value: "98%",
            stat1Label: "Satisfação Clínica",
            stat2Value: "Zero",
            stat2Label: "Efeitos Adversos",
            image: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1974&auto=format&fit=crop",
        },
        featured: {
            title: "Coleção em Destaque",
            subtitle: "Descubra os produtos mais amados pelos profissionais de estética.",
        },
        newsletter: {
            badge: "Clinical Updates",
            titleStart: "Faça parte da nossa",
            titleEnd: "Comunidade Científica",
            description: "Receba com exclusividade laudos técnicos, lançamentos de ativos e convites para workshops presenciais na Academy MedBeauty.",
            buttonText: "Assinar News",
        },
        endorsements: {
            badge: "Respaldo Profissional",
            titleStart: "Reconhecido pela",
            titleEnd: "Elite Médica",
            description: "Nossos produtos são a escolha número um dos principais especialistas do Brasil e do mundo, passando por rigorosos testes clínicos antes de chegarem à sua clínica.",
        },
    },
    about: {
        heroTitle: "Sobre a MedBeauty",
        heroSubtitle: "Naturalmente beauty, definitivamente tech. Somos uma empresa comprometida com a inovação em produtos para estética profissional.",
        missionTitle: "Nossa Missão",
        missionText1: "A MedBeauty nasceu com o propósito de oferecer aos profissionais de estética os melhores produtos do mercado, unindo tecnologia de ponta e resultados comprovados.",
        missionText2: "Trabalhamos com marcas reconhecidas internacionalmente e somos pioneiros na introdução de diversas tecnologias no mercado brasileiro.",
        valuesTitle: "Nossos Valores",
        valuesSubtitle: "Os princípios que guiam nossa atuação no mercado",
        stat1Value: "10+",
        stat1Label: "Anos de experiência",
        stat2Value: "5.000+",
        stat2Label: "Clientes atendidos",
        stat3Value: "50+",
        stat3Label: "Produtos no catálogo",
        stat4Value: "27",
        stat4Label: "Estados atendidos",
        image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=2070"
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
            const keys = path.split('.');
            let current = newContent;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) current[key] = {};
                current[key] = { ...current[key] };
                current = current[key];
            }

            current[keys[keys.length - 1]] = value;
            return { ...newContent };
        });
    };

    const saveChanges = async () => {
        try {
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 1,
                    content,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            console.log("Saved content:", content);
            toast.success("Conteúdo salvo com sucesso!");
        } catch (err) {
            console.error("Error saving CMS changes:", err);
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
