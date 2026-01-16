import { Sparkles, Shield, Truck, Award, HeartHandshake, Microscope } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Qualidade Premium",
    description: "Produtos selecionados com os mais altos padrões de qualidade e eficácia comprovada.",
    gradient: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/qualidade_premium_1768584314030.png",
  },
  {
    icon: Shield,
    title: "Aprovação ANVISA",
    description: "Todos os produtos são aprovados e regulamentados pela ANVISA para sua segurança.",
    gradient: "from-blue-400 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/aprovacao_anvisa_1768584330015.png",
  },
  {
    icon: Truck,
    title: "Entrega Rápida",
    description: "Entregamos para todo o Brasil com agilidade, segurança e rastreamento em tempo real.",
    gradient: "from-emerald-400 to-green-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/entrega_rapida_1768584346128.png",
  },
  {
    icon: Award,
    title: "Marca Premiada",
    description: "Reconhecida internacionalmente por inovação e excelência em estética.",
    gradient: "from-purple-400 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/marca_premiada_1768584363197.png",
  },
  {
    icon: HeartHandshake,
    title: "Suporte Especializado",
    description: "Equipe de especialistas disponível para orientação técnica e científica.",
    gradient: "from-rose-400 to-red-500",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/suporte_especializado_1768584379542.png",
  },
  {
    icon: Microscope,
    title: "Tecnologia Avançada",
    description: "Pesquisa e desenvolvimento contínuo para oferecer o que há de mais moderno.",
    gradient: "from-indigo-400 to-violet-500",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    image: "/brain/0a3dd2cb-f1d9-4233-9898-639450972ba0/tecnologia_avancada_1768584395430.png",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Diferenciais</span>
          </div>
          <h2 className="font-serif text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl mb-6">
            Por que escolher a MedBeauty?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Somos referência em produtos para estética profissional no Brasil,
            oferecendo qualidade, segurança e inovação em cada detalhe.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card rounded-3xl border border-border/50 overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Image with Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/95 to-card/80 backdrop-blur-[2px]" />
              </div>

              {/* Content */}
              <div className="relative p-10 z-10">
                {/* Icon container */}
                <div className="relative mb-8">
                  <div className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl ${feature.bgColor} transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-6`}>
                      <feature.icon className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="font-serif text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>

                  <p className="text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <p className="text-lg text-muted-foreground">
            Junte-se a mais de <span className="font-bold text-foreground">10.000 profissionais</span> que confiam na MedBeauty
          </p>
        </div>
      </div>
    </section>
  );
}
