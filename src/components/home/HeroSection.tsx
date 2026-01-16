import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{
        background: `
          radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
          radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)
        `,
      }}
    >
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div
          className="absolute w-[800px] h-[800px] rounded-full blur-3xl animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)",
            left: `${mousePosition.x * 0.5}%`,
            top: `${mousePosition.y * 0.5}%`,
            transform: "translate(-50%, -50%)",
            transition: "all 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)",
            right: `${mousePosition.x * 0.3}%`,
            bottom: `${mousePosition.y * 0.3}%`,
            animationDelay: "1s",
            transition: "all 0.3s ease-out",
          }}
        />
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 border border-primary rotate-45 animate-spin-slow" />
        <div className="absolute bottom-20 right-20 w-60 h-60 border border-accent rounded-full animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border-2 border-rose-gold-light rotate-12 animate-float" />
      </div>

      {/* Floating orbs with 3D effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float opacity-20"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${i % 3 === 0 ? "rgba(168, 85, 247, 0.6)" :
                  i % 3 === 1 ? "rgba(236, 72, 153, 0.6)" :
                    "rgba(251, 191, 36, 0.6)"
                } 0%, transparent 70%)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:px-8 lg:py-32 w-full z-10">
        <div className="mx-auto max-w-5xl text-center">
          {/* Futuristic badge */}
          <div className="mb-10 inline-flex items-center gap-3 rounded-full border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-accent/10 to-rose-gold-light/10 backdrop-blur-xl px-6 py-3 text-sm animate-fade-in-down shadow-2xl hover:shadow-primary/20 hover:scale-105 transition-all duration-500 cursor-pointer group">
            <div className="relative">
              <Zap className="h-5 w-5 text-primary animate-pulse" />
              <div className="absolute inset-0 blur-md bg-primary/50 animate-pulse" />
            </div>
            <span className="text-foreground font-semibold tracking-wide">Nova coleção de fios PDO disponível</span>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold shadow-lg group-hover:shadow-primary/50 transition-shadow">
              LANÇAMENTO
            </span>
          </div>

          {/* 3D Title with layered effect */}
          <div className="relative mb-8">
            <h1
              className="font-serif text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl animate-fade-in-up leading-[1.1]"
              style={{
                transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.02}deg) rotateY(${(mousePosition.x - 50) * 0.02}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <span className="block text-foreground mb-2">Beleza e tecnologia</span>
              <span className="block relative">
                <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-50" />
                <span className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-gradient-x">
                  em perfeita harmonia
                </span>
              </span>
            </h1>
          </div>

          <p className="mt-10 text-xl leading-9 text-muted-foreground sm:text-2xl lg:text-3xl animate-fade-in-up stagger-1 max-w-4xl mx-auto font-light">
            Descubra nossa linha completa de produtos para estética profissional.
            <span className="block mt-3 font-semibold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Naturalmente beauty, definitivamente tech.
            </span>
          </p>

          {/* CTA Buttons with 3D effect */}
          <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row animate-fade-in-up stagger-2">
            <Button
              asChild
              size="lg"
              className="gap-3 shadow-2xl hover:shadow-primary/50 transition-all duration-500 px-10 py-7 text-lg group relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] animate-gradient-x"
            >
              <Link to="/produtos">
                <span className="relative z-10">Ver Produtos</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-3 group px-10 py-7 text-lg backdrop-blur-xl border-2 hover:border-primary/50 hover:bg-primary/10 transition-all duration-500 shadow-xl"
            >
              <Link to="/sobre">
                <Play className="h-6 w-6 transition-transform group-hover:scale-125 group-hover:rotate-90" />
                Conheça a MedBeauty
              </Link>
            </Button>
          </div>

          {/* Stats with 3D cards */}
          <div className="mt-24 grid grid-cols-2 gap-6 sm:grid-cols-4 animate-fade-in-up stagger-3">
            {[
              { value: "10K+", label: "Clientes Ativos", icon: "👥", color: "from-blue-500 to-cyan-500" },
              { value: "500+", label: "Clínicas Parceiras", icon: "🏥", color: "from-purple-500 to-pink-500" },
              { value: "98%", label: "Satisfação", icon: "❤️", color: "from-rose-500 to-red-500" },
              { value: "5.0", label: "Avaliação", icon: "⭐", color: "from-amber-500 to-orange-500", showStar: true },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all duration-500 cursor-default hover:scale-110 hover:-translate-y-2 shadow-xl hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-500">{stat.icon}</div>
                  <div className={`text-4xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent sm:text-5xl group-hover:scale-110 transition-transform duration-500`}>
                    {stat.value}
                    {stat.showStar && <Star className="inline-block h-7 w-7 ml-2 fill-amber-500 text-amber-500" />}
                  </div>
                  <div className="mt-3 text-sm text-muted-foreground font-semibold tracking-wide">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </section>
  );
}
