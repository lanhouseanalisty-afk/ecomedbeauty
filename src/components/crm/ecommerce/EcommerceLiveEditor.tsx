import { useState, useEffect } from "react";
import { Monitor, Smartphone, Save, RotateCcw, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCMS } from "@/contexts/CMSContext";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { ScientificInnovation } from "@/components/home/ScientificInnovation";
import { ClinicalEvidenceSection, BrandLogosSection } from "@/components/home/HomeSections";
import { FeaturedProductsCarousel } from "@/components/home/FeaturedProductsCarousel";
import { MedicalEndorsements } from "@/components/home/MedicalEndorsements";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { Footer } from "@/components/layout/Footer";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "lucide-react";

export function EcommerceLiveEditor() {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const [selectedPage, setSelectedPage] = useState<string>("home");
    const { toggleEditing, saveChanges } = useCMS();

    // Enable editing mode when mounting this editor
    useEffect(() => {
        toggleEditing(true);
        return () => toggleEditing(false);
    }, [toggleEditing]);

    const handleSave = async () => {
        await saveChanges();
    };

    const handleReset = () => {
        window.location.reload();
    };

    return (
        <div className="flex h-[calc(100vh-140px)] border rounded-lg overflow-hidden bg-slate-50 flex-col">
            {/* Top Bar Actions */}
            <div className="h-14 border-b bg-white flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <h2 className="font-serif font-bold text-[#2B0F54] leading-none mb-0.5">Editor da Loja</h2>
                            <span className="text-[9px] font-bold text-[#ECB546] uppercase tracking-[0.2em] flex items-center gap-1 animate-pulse">
                                <Sparkles className="h-2.5 w-2.5" /> AI Enhancement Ativo
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                        <div className="bg-emerald-500/10 text-emerald-600 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/20 tracking-tighter mr-2">LIVE</div>

                        <div className="flex items-center gap-2 border-l pl-4 border-slate-200">
                            <Layout className="w-4 h-4 text-slate-400" />
                            <Select value={selectedPage} onValueChange={setSelectedPage}>
                                <SelectTrigger className="w-[200px] h-8 text-xs font-medium border-slate-200 bg-white shadow-sm">
                                    <SelectValue placeholder="Selecione a página" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="home">Página Inicial (Home)</SelectItem>
                                    <SelectItem value="products">Vitrine de Produtos</SelectItem>
                                    <SelectItem value="product_view">Detalhes do Produto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 rounded-md p-1 border">
                        <Button
                            variant={device === 'desktop' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 w-8 p-0"
                            onClick={() => setDevice('desktop')}
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={device === 'mobile' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 w-8 p-0"
                            onClick={() => setDevice('mobile')}
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground hidden lg:block mr-4 font-medium uppercase tracking-widest">
                        Clique nos textos para editar em tempo real
                    </span>
                    <Button variant="outline" size="sm" onClick={handleReset} className="h-9">
                        <RotateCcw className="mr-2 h-3 w-3" /> Resetar
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-9 bg-[#2B0F54] hover:bg-[#1a0933]">
                        <Save className="mr-2 h-3 w-3" /> Publicar Alterações
                    </Button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 lg:p-12 bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                <div
                    className={`
                bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col relative
                ${device === 'desktop' ? 'w-full h-full rounded-md max-w-[1400px]' : 'w-[375px] h-[750px] rounded-[3rem] border-[12px] border-slate-900'}
            `}
                >
                    {/* Device Header for Mobile */}
                    {device === 'mobile' && (
                        <div className="h-6 w-full flex justify-center items-end pb-1 border-b border-slate-100 bg-slate-50">
                            <div className="w-16 h-1 rounded-full bg-slate-200" />
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto bg-white scrollbar-hide w-full h-full relative">
                        {selectedPage === 'home' && (
                            <>
                                <Header />
                                <HeroSection />
                                <BrandLogosSection />
                                <ScientificInnovation />
                                <ClinicalEvidenceSection />
                                <FeaturedProductsCarousel />
                                <MedicalEndorsements />
                                <NewsletterSection />
                                <Footer />
                            </>
                        )}
                        {selectedPage === 'products' && (
                            <>
                                <Header />
                                <Products />
                                <Footer />
                            </>
                        )}
                        {selectedPage === 'product_view' && (
                            <>
                                <Header />
                                {/* Em modo preview, forçamos um ID na URL via History API antes de renderizar,
                                    ou deixamos ele cair no NotFound. No momento mostramos o preview. */}
                                <ProductDetail />
                                <Footer />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
