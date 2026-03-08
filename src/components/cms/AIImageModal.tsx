import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Image as ImageIcon, Check, RefreshCw, Upload } from "lucide-react";
import { aiImageService } from "@/services/aiImageService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIImageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (url: string) => void;
    currentUrl?: string;
}

export function AIImageModal({ open, onOpenChange, onApply, currentUrl }: AIImageModalProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("ai");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error("Por favor, descreva a imagem que deseja gerar.");
            return;
        }

        setIsGenerating(true);
        try {
            const url = await aiImageService.generateImage(prompt);
            setGeneratedUrl(url);
            toast.success("Imagem gerada com sucesso!");
        } catch (error) {
            toast.error("Erro ao gerar imagem. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Por favor, selecione um arquivo de imagem.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setGeneratedUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleApply = () => {
        if (generatedUrl) {
            onApply(generatedUrl);
            setPrompt("");
            setGeneratedUrl(null);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col bg-slate-50 border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-white p-6 border-b shrink-0">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-tr from-[#2B0F54] to-[#ECB546] rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <DialogTitle className="text-2xl font-serif">Assistente de Imagem</DialogTitle>
                        </div>
                        <DialogDescription className="text-base">
                            Escolha entre gerar uma imagem com IA ou subir um arquivo do seu computador.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <Tabs defaultValue="ai" className="w-full" onValueChange={(v) => {
                        setActiveTab(v);
                        setGeneratedUrl(null);
                    }}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="ai" className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Gerar com IA
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Upload Manual
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai" className="space-y-6 mt-0">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Descrição da Imagem</label>
                                <Textarea
                                    placeholder="Ex: Um laboratório de estética minimalista com tons de dourado e branco, iluminação suave..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="min-h-[100px] bg-white border-slate-200 focus:border-[#2B0F54] focus:ring-1 focus:ring-[#2B0F54] resize-none text-lg"
                                />
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !prompt.trim()}
                                    className="w-full bg-[#2B0F54] hover:bg-[#1a0933]"
                                >
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    {generatedUrl ? "Gerar Outra" : "Gerar com IA"}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="upload" className="space-y-6 mt-0">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Selecione o Arquivo</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <div className="p-3 bg-slate-100 rounded-full group-hover:bg-[#2B0F54]/10 transition-colors">
                                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-[#2B0F54]" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[#2B0F54] font-semibold">Clique para fazer upload</span>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG ou WebP até 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center mt-6">
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-4 animate-pulse">
                                    <Loader2 className="h-10 w-10 text-[#2B0F54] animate-spin" />
                                    <span className="text-slate-500 font-medium">Processando com IA...</span>
                                </div>
                            ) : generatedUrl ? (
                                <img src={generatedUrl} alt="Preview" className="w-full h-full object-cover animate-in fade-in zoom-in duration-500" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <ImageIcon className="h-12 w-12 opacity-20" />
                                    <span className="text-sm">A prévia da imagem aparecerá aqui</span>
                                </div>
                            )}

                            {generatedUrl && !isGenerating && activeTab === 'ai' && (
                                <div className="absolute top-2 right-2">
                                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={handleGenerate}>
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>

                <DialogFooter className="bg-slate-100 p-4 border-t flex sm:justify-between items-center gap-4 shrink-0 mt-auto">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={!generatedUrl || isGenerating}
                        className="bg-[#2B0F54] hover:bg-[#1a0933] text-white min-w-[120px]"
                    >
                        <Check className="mr-2 h-4 w-4" /> Aplicar na Loja
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

