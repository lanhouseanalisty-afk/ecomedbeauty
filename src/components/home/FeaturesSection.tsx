import { Sparkles, Shield, Truck, Award, HeartHandshake, Microscope } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Qualidade Premium",
    description: "Produtos selecionados com os mais altos padrões de qualidade e eficácia comprovada.",
  },
  {
    icon: Shield,
    title: "Aprovação ANVISA",
    description: "Todos os produtos são aprovados e regulamentados pela ANVISA para sua segurança.",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    description: "Entregamos para todo o Brasil com agilidade, segurança e rastreamento em tempo real.",
  },
  {
    icon: Award,
    title: "Marca Premiada",
    description: "Reconhecida internacionalmente por inovação e excelência em estética.",
  },
  {
    icon: HeartHandshake,
    title: "Suporte Especializado",
    description: "Equipe de especialistas disponível para orientação técnica e científica.",
  },
  {
    icon: Microscope,
    title: "Tecnologia Avançada",
    description: "Pesquisa e desenvolvimento contínuo para oferecer o que há de mais moderno.",
  },
];

export function FeaturesSection() {
  return (
    <section className="border-y border-border bg-card py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Por que escolher a MedBeauty?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Somos referência em produtos para estética profissional no Brasil
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-soft hover-lift animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-all group-hover:bg-primary/20 group-hover:scale-110">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
