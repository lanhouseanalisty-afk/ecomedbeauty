import { Link } from "react-router-dom";
import { useCMS } from "@/contexts/CMSContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Beaker, ShieldCheck, Sparkles } from "lucide-react";

export function HeroSection() {
  const { isEditing } = useCMS();
  const LinkComponent = isEditing ? "div" : Link;
  const linkProps = (to: string) => isEditing ? {} : { to };

  return (
    <section className="relative min-h-[750px] w-full overflow-hidden bg-[#2B0F54]">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 scale-105 animate-spin-slow opacity-40 blur-[100px]"
        style={{
          backgroundImage: `url('/medbeauty/hero_scientific.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, #2B0F54 20%, transparent 100%), url('/medbeauty/hero_scientific.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full min-h-[750px] max-w-7xl items-center px-4 lg:px-8">
        <div className="max-w-3xl space-y-8 py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md animate-fade-in-down">
            <Sparkles className="h-4 w-4 text-[#ECB546]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              Liderança em Tecnologia Estética
            </span>
          </div>

          <h1 className="animate-fade-in-up font-serif text-6xl font-bold leading-[1.1] text-white md:text-8xl">
            Ciência <br />
            <span className="text-gradient">Elevada</span> à <br />
            Beleza <span className="text-[#ECB546]">.</span>
          </h1>

          <p className="max-w-xl animate-fade-in-up text-lg leading-relaxed text-white/70 stagger-1">
            Desenvolvemos soluções estéticas de alta performance com rigor laboratorial e
            resultados clinicamente comprovados para profissionais exigentes.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4 animate-fade-in-up stagger-2">
            <Button
              asChild={!isEditing}
              size="lg"
              className="group h-16 rounded-full bg-[#ECB546] px-10 text-sm font-bold uppercase tracking-widest text-[#2B0F54] transition-all hover:scale-105 hover:bg-white"
            >
              <LinkComponent {...linkProps("/produtos")}>
                Explorar Coleção
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </LinkComponent>
            </Button>

            <LinkComponent {...linkProps("/sobre")} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/5 transition-colors group-hover:border-[#ECB546]/50">
                <Beaker className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold tracking-wide">Nossa Ciência</span>
            </LinkComponent>
          </div>

          {/* Features Badges */}
          <div className="flex flex-wrap gap-8 pt-12 animate-fade-in-up stagger-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#ECB546]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">Certificado SAP</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Integração Global</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Beaker className="h-6 w-6 text-[#ECB546]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">Pureza Lab</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Grau Farmacêutico</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2B0F54] to-transparent z-10" />
    </section>
  );
}
