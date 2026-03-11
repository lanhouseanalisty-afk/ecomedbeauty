import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Megaphone, ExternalLink, Sparkles, Wand2, Image as ImageIcon, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MediaGeneratorPage() {
  const embedUrl = "https://aistudio.google.com/apps/drive/1Ew0oo3e9U9x18U0083txydZo7H8lJ4Nr?showPreview=true&showAssistant=true";

  const features = [
    {
      title: "Geração de Copy",
      description: "Crie legendas, anúncios e textos persuasivos em segundos.",
      icon: MessageSquare,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Assistência Criativa",
      description: "Brainstorming de ideias para campanhas e conteúdos de marketing.",
      icon: Sparkles,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Otimização de Mídia",
      description: "Sugestões de melhorias para seus assets criativos.",
      icon: Wand2,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary/10 to-slate-900 border border-primary/20 p-8 md:p-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30 border-primary/30 py-1 px-4 transition-all uppercase tracking-wider text-[10px] font-bold">
            Inteligência Artificial
          </Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Gerador de Mídia Inteligente
          </h1>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed">
            Potencialize suas criações com o Google AI Studio. Uma ferramenta avançada para criação de conteúdo, scripts, e assistência estratégica para o marketing da MedBeauty.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => window.open(embedUrl, '_blank')}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="h-5 w-5 fill-current" />
              Acessar Gerador agora
              <ExternalLink className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(embedUrl, '_blank')}
              className="px-8 py-6 rounded-xl text-lg font-medium border-primary/20 hover:bg-white/5 transition-all"
            >
              Documentação
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="group border-primary/10 bg-slate-900/40 backdrop-blur-sm hover:border-primary/30 transition-all hover:translate-y-[-4px]">
            <CardHeader>
              <div className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Guide Section */}
      <Card className="border-primary/20 bg-slate-950/20 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Como utilizar
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-slate-200">Clique em "Acessar"</h3>
                  <p className="text-sm text-slate-400">O Google AI Studio abrirá em uma nova aba segura do seu navegador.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-slate-200">Descreva seu pedido</h3>
                  <p className="text-sm text-slate-400">Utilize prompts detalhados para obter os melhores resultados criativos.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-slate-200">Copie e aplique</h3>
                  <p className="text-sm text-slate-400">Transfira o conteúdo gerado diretamente para suas campanhas no CRM.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 p-8 flex items-center justify-center border-l border-primary/10">
            <div className="text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Megaphone className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pronto para começar?</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                A IA é o seu braço direito na criação de conteúdos de alto impacto para a MedBeauty.
              </p>
              <Button
                onClick={() => window.open(embedUrl, '_blank')}
                variant="ghost"
                className="text-primary hover:text-primary/80 hover:bg-primary/10"
              >
                Ir para o Google AI Studio →
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
