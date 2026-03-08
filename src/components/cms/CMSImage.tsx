import { useState } from "react";
import { useCMS } from "@/contexts/CMSContext";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2 } from "lucide-react";
import { AIImageModal } from "./AIImageModal";

interface CMSImageProps {
    path: string; // e.g. "home.hero.image"
    className?: string; // Styles for the image itself
    containerClassName?: string; // Styles for the wrapper
    alt?: string;
    mode?: "img" | "background";
    children?: React.ReactNode;
}

export function CMSImage({ path, className, containerClassName, alt = "", mode = "img", children }: CMSImageProps) {
    const { content, updateContent, isEditing } = useCMS();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Resolve value from path
    const keys = path.split('.');
    let imageUrl = content as any;
    for (const key of keys) {
        imageUrl = imageUrl?.[key];
    }

    if (!imageUrl && !isEditing) return null;

    const handleApplyImage = (newUrl: string) => {
        updateContent(path, newUrl);
    };

    const editOverlay = isEditing && (
        <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-[100] cursor-pointer"
        >
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-2">
                <div className="bg-gradient-to-tr from-[#2B0F54] to-[#ECB546] p-1.5 rounded-full">
                    <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-bold text-[#2B0F54] pr-1">Gerar com IA</span>
            </div>

            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-[#2B0F54] border border-[#2B0F54]/10 shadow-sm opacity-50 group-hover:opacity-100 transition-opacity">
                IMAGEM EDITÁVEL
            </div>
        </div>
    );

    if (mode === "background") {
        return (
            <>
                <div
                    className={cn("relative group", containerClassName)}
                    style={!children ? {
                        backgroundImage: `url('${imageUrl}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                    {children}
                    {editOverlay}
                </div>

                <AIImageModal
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onApply={handleApplyImage}
                    currentUrl={imageUrl}
                />
            </>
        );
    }

    return (
        <>
            <div className={cn("relative group", containerClassName)}>
                <img
                    src={imageUrl}
                    alt={alt}
                    className={cn(
                        isEditing && "transition-all duration-300 group-hover:brightness-75 group-hover:blur-[2px]",
                        className
                    )}
                />
                {editOverlay}
            </div>

            <AIImageModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                onApply={handleApplyImage}
                currentUrl={imageUrl}
            />
        </>
    );
}
