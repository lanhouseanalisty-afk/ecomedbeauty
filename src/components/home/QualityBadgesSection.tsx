import { Shield, Award, CheckCircle } from "lucide-react";

export function QualityBadgesSection() {
    const badges = [
        {
            icon: Shield,
            label: "ISO Certified",
            description: "Padrão internacional de qualidade"
        },
        {
            icon: CheckCircle,
            label: "CE Approved",
            description: "Certificação europeia"
        },
        {
            icon: Award,
            label: "ANVISA",
            description: "Aprovado pela vigilância sanitária"
        }
    ];

    return (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        Resultados Reais
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Produtos certificados com os mais altos padrões de qualidade e segurança
                    </p>
                </div>

                {/* Quality Badges Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {badges.map((badge, index) => {
                        const Icon = badge.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-card hover:shadow-elegant transition-all duration-300 border border-border hover:border-primary/30 group"
                            >
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-10 h-10 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground">
                                        {badge.label}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {badge.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Models/Results Image Placeholder */}
                <div className="mt-16 relative">
                    <div className="aspect-[21/9] bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-elegant">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <svg
                                    className="w-24 h-24 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <p className="text-lg font-medium">Imagem de modelos com resultados</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
