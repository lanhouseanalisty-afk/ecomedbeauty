import { useState, useEffect } from "react";
import { Monitor, Smartphone, Save, RotateCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCMS } from "@/contexts/CMSContext";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export function EcommerceLiveEditor() {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
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
                    <h2 className="font-semibold text-lg">Editor Visual</h2>
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
                    <span className="text-xs text-muted-foreground flex items-center gap-1 hidden md:flex">
                        <ExternalLink className="h-3 w-3" />
                        Clique nos textos para editar
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}>
                        <RotateCcw className="mr-2 h-3 w-3" /> Resetar
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-3 w-3" /> Publicar Alterações
                    </Button>
                </div>
            </div>

            {/* Preview Viewport */}
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8 bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                <div
                    className={`
                bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col relative
                ${device === 'desktop' ? 'w-full h-full rounded-md max-w-[1400px]' : 'w-[375px] h-[667px] rounded-[2rem] border-[8px] border-slate-800'}
            `}
                >
                    {/* Render the ACTUAL store components here */}
                    {/* We use 'isolate' to create a new stacking context so fixed elements are contained within this div if possible, 
                 though fixed usually escapes. For Header, we might need a specific style override context. */}
                    <div className="flex-1 overflow-y-auto bg-white scrollbar-hide w-full h-full relative">
                        <div className="relative z-10">
                            <Header />
                        </div>
                        <HeroSection />
                        <div className="pointer-events-none opacity-50 grayscale">
                            <FeaturesSection />
                        </div>
                        {/* 
                  Note: FeaturesSection and others are read-only for now until we convert them.
                  Added opacity to indicate they might not be fully editable yet in this MVP.
                */}
                    </div>
                </div>
            </div>
        </div>
    );
}
