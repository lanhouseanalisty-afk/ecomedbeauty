import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-rose-gold-light/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm animate-fade-in-down">
            <Sparkles className="h-4 w-4 text-primary animate-pulse-soft" />
            <span className="text-muted-foreground">Nova coleção de fios PDO disponível</span>
          </div>

          <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in-up">
            Beleza e tecnologia em{" "}
            <span className="text-gradient">perfeita harmonia</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl animate-fade-in-up stagger-1">
            Descubra nossa linha completa de produtos para estética profissional.
            Naturalmente beauty, definitivamente tech.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up stagger-2">
            <Button asChild size="lg" className="gap-2 shadow-glow hover:shadow-lifted transition-all">
              <Link to="/produtos">
                Ver Produtos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 group">
              <Link to="/sobre">
                <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
                Conheça a MedBeauty
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4 animate-fade-in-up stagger-3">
            {[
              { value: "10K+", label: "Clientes" },
              { value: "500+", label: "Clínicas" },
              { value: "98%", label: "Satisfação" },
              { value: "5★", label: "Avaliação" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
