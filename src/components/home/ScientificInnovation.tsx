import { Microscope, Beaker, Dna, ShieldCheck, Zap, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const innovations = [
    {
        id: "pdo",
        title: "PDO de Quinta Geração",
        subtitle: "Bio-estimulação Avançada",
        description: "Nossos fios i-Thread utilizam polidioxanona ultra-purificada com tecnologia de farpa moldada, garantindo tração superior e maior tempo de permanência tecidual.",
        icon: Dna,
        color: "from-blue-500/20 to-indigo-500/20",
        stats: [
            { label: "Pureza", value: "99.9%" },
            { label: "Duração", value: "24 meses" },
        ]
    },
    {
        id: "ah",
        title: "Ácido Hialurônico Reticulado",
        subtitle: "Estrutura Molecular Hexagonal",
        description: "A linha e.p.t.q. apresenta a 'The 9 Essentials', um rigoroso processo de purificação que elimina resíduos de BDDE, resultando em um gel monofásico ultra-estável.",
        icon: Beaker,
        color: "from-[#ECB546]/20 to-[#ECB546]/10",
        stats: [
            { label: "BDDE", value: "Não Detectável" },
            { label: "Viscosidade", value: "Otimizada" },
        ]
    },
    {
        id: "antioxi",
        title: "Idebenona Lipossomada",
        subtitle: "O Antioxidante Mais Potente",
        description: "Com tecnologia de encapsulamento nanocelular, a Idebenona atinge as camadas mais profundas da derme, com eficácia 4x superior à Vitamina C.",
        icon: Zap,
        color: "from-purple-500/20 to-pink-500/20",
        stats: [
            { label: "Potência", value: "4x Vit. C" },
            { label: "Absorção", value: "Instantânea" },
        ]
    }
];

export function ScientificInnovation() {
    return (
        <section className="relative py-24 lg:py-32 overflow-hidden bg-white">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2B0F54]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ECB546]/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#2B0F54]/5 px-4 py-2 border border-[#2B0F54]/10">
                        <Microscope className="h-4 w-4 text-[#2B0F54]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2B0F54]">
                            Inovação Laboratorial
                        </span>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-[#2B0F54]">
                        A Ciência por Trás da <br />
                        <span className="text-[#ECB546]">Excelência</span>
                    </h2>
                    <p className="max-w-2xl text-slate-500 text-lg">
                        Não criamos apenas produtos; desenvolvemos protocolos científicos de alta performance para profissionais que buscam resultados previsíveis e seguros.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {innovations.map((item, index) => (
                        <div
                            key={item.id}
                            className={cn(
                                "group relative bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-soft transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 overflow-hidden",
                                "animate-fade-in-up"
                            )}
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            {/* Decorative Gradient Background */}
                            <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br", item.color)} />

                            <div className="relative z-10 space-y-6">
                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-[#2B0F54] group-hover:bg-white group-hover:scale-110 transition-all duration-500 shadow-sm border border-slate-100">
                                    <item.icon className="h-8 w-8" />
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-[#ECB546] uppercase tracking-[0.2em]">{item.subtitle}</span>
                                    <h3 className="text-2xl font-bold text-[#2B0F54]">{item.title}</h3>
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-600">
                                    {item.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    {item.stats.map((stat, sIdx) => (
                                        <div key={sIdx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:bg-white transition-colors">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                                            <div className="text-sm font-bold text-[#2B0F54]">{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <Button asChild className="h-14 px-10 rounded-2xl bg-[#2B0F54] text-white hover:bg-[#1a0933] shadow-lg shadow-[#2B0F54]/10 gap-3 group">
                        <Link to="/produtos">
                            Explorar Portfólio Técnico
                            <Zap className="h-4 w-4 group-hover:animate-pulse" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
