import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, ExternalLink, AlertTriangle, Maximize2, Minimize2, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PowerBIPage() {
    const [isFocusMode, setIsFocusMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const originalUrl = "https://app.powerbi.com/groups/me/apps/3ed42947-b2f1-45ec-8092-5906b498ebd1/reports/4b593051-1697-49f6-93ca-4d534e50dad0/9b0546b182b88a740e60?ctid=f558b0e4-c400-4992-b98a-3e1cecae578d&experience=power-bi";

    // Power BI reports require specific "reportEmbed" URL to work inside iframes
    // filterPaneEnabled=false hides the side filters, navContentPaneEnabled=false hides the bottom tabs
    const embedUrl = "https://app.powerbi.com/reportEmbed?reportId=4b593051-1697-49f6-93ca-4d534e50dad0&ctid=f558b0e4-c400-4992-b98a-3e1cecae578d&autoAuth=true&filterPaneEnabled=false&navContentPaneEnabled=false";

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="space-y-4 flex flex-col h-[calc(100vh-100px)]">
            {/* Header - Hidden in Focus Mode for more space */}
            {!isFocusMode && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                        <h1 className="font-serif text-3xl font-bold">Power BI</h1>
                        <p className="text-muted-foreground">Relatórios Dinâmicos e Analytics</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-primary/20 hover:bg-primary/5 shadow-sm"
                            onClick={() => window.open(originalUrl, '_blank')}
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span className="hidden sm:inline">Nova Aba</span>
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 shadow-sm"
                            onClick={() => setIsFocusMode(true)}
                        >
                            <Maximize2 className="h-4 w-4" />
                            Modo Foco
                        </Button>

                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2 shadow-sm"
                            onClick={toggleFullscreen}
                        >
                            <LayoutPanelLeft className="h-4 w-4" />
                            Tela Cheia
                        </Button>

                        <div className="bg-white p-2 rounded-lg border shadow-sm flex items-center gap-2 text-sm text-muted-foreground ml-2">
                            <BarChart3 className="h-4 w-4 text-primary" />
                            <span className="hidden lg:inline">Analytics em Tempo Real</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert/Notice - Hidden in Focus Mode */}
            {!isFocusMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in duration-500">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                        <p>
                            Se o gráfico não carregar, use o botão <strong>"Nova Aba"</strong>.
                            Para modo imersivo, clique em <strong>"Modo Foco"</strong> ou <strong>"Tela Cheia"</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* Focus Mode Exit UI */}
            {isFocusMode && (
                <div className="flex items-center justify-between bg-primary/5 p-2 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary ml-2">
                        <BarChart3 className="h-4 w-4" />
                        Modo Foco Ativo
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="gap-2">
                            <Maximize2 className="h-4 w-4" />
                            Tela Cheia
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsFocusMode(false)} className="gap-2">
                            <Minimize2 className="h-4 w-4" />
                            Sair do Foco
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Report Container */}
            <div
                ref={containerRef}
                className={cn(
                    "flex-1 overflow-hidden transition-all duration-300 relative",
                    isFocusMode ? "mt-0" : "mt-2",
                    "bg-[#111] rounded-2xl shadow-2xl border border-slate-800"
                )}
            >
                <Card className="h-full w-full border-none shadow-none rounded-none overflow-hidden bg-transparent">
                    <CardContent className="p-0 h-full w-full bg-transparent">
                        <iframe
                            title="Power BI Report"
                            className="w-full h-full border-0"
                            src={embedUrl}
                            allowFullScreen={true}
                            allow="fullscreen"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
