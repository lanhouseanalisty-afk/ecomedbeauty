import { Search, ShoppingCart, Truck, CheckCircle } from "lucide-react";

const steps = [
    {
        icon: Search,
        title: "Explore nossos produtos",
        description: "Navegue por nossa linha completa de produtos premium para estética profissional",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: ShoppingCart,
        title: "Adicione ao carrinho",
        description: "Selecione os produtos desejados e adicione ao seu carrinho de forma simples e rápida",
        color: "from-purple-500 to-pink-500",
    },
    {
        icon: Truck,
        title: "Receba em casa",
        description: "Entrega rápida e segura para todo o Brasil com rastreamento em tempo real",
        color: "from-orange-500 to-red-500",
    },
    {
        icon: CheckCircle,
        title: "Aproveite os resultados",
        description: "Produtos de alta qualidade para oferecer os melhores tratamentos aos seus clientes",
        color: "from-green-500 to-emerald-500",
    },
];

export function HowItWorksSection() {
    return (
        <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                        Como funciona?
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Processo simples e seguro para você adquirir os melhores produtos
                    </p>
                </div>

                <div className="relative">
                    {/* Connection line - desktop only */}
                    <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step, index) => (
                            <div
                                key={step.title}
                                className="relative group animate-fade-in-up opacity-0"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                {/* Step number badge */}
                                <div className="absolute -top-4 -left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>

                                {/* Card */}
                                <div className="relative h-full rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                    {/* Icon with gradient background */}
                                    <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                        <step.icon className="h-8 w-8 text-white" />
                                    </div>

                                    <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                                        {step.title}
                                    </h3>

                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>

                                    {/* Hover gradient overlay */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
