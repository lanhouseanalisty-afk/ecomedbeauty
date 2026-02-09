import { Quote, Star, ShieldCheck, Award, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const endorsements = [
    {
        name: "Dr. Ricardo Silveira",
        role: "Cirurgião Plástico & Pesquisador",
        text: "A qualidade dos fios i-Thread é incomparável. A previsibilidade de resultados e a segurança na aplicação são fundamentais para o sucesso dos meus procedimentos de lifting sem cortes.",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=2070",
        rating: 5,
        cert: "SBCP"
    },
    {
        name: "Dra. Helena Martins",
        role: "Dermatologista Especialista em Injetáveis",
        text: "O preenchedor e.p.t.q. elevou o padrão da minha clínica. Sua reologia equilibrada permite uma escultura facial natural e duradoura, com baixíssimo índice de edema pós-procedimento.",
        image: "https://images.unsplash.com/photo-1559839734-2b71f153675f?auto=format&fit=crop&q=80&w=2070",
        rating: 5,
        cert: "SBD"
    },
    {
        name: "Prof. Alberto Conti",
        role: "PhD em Biotecnologia Estética",
        text: "Como acadêmico, analiso a pureza. A MedBeauty entrega exatamente o que promete em seus laudos: ativos purificados com tecnologia de ponta e biocompatibilidade excepcional.",
        image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=2070",
        rating: 5,
        cert: "Harvard Fellow"
    }
];

export function MedicalEndorsements() {
    return (
        <section className="py-24 lg:py-32 bg-[#2B0F54] relative overflow-hidden">
            {/* Decorative Orbs */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#ECB546]/10 blur-[100px] rounded-full translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-md">
                            <ShieldCheck className="h-4 w-4 text-[#ECB546]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
                                Respaldo Profissional
                            </span>
                        </div>

                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            Reconhecido pela <br />
                            <span className="text-[#ECB546]">Elite Médica</span>
                        </h2>

                        <p className="text-white/60 text-lg max-w-lg leading-relaxed">
                            Nossos produtos são a escolha número um dos principais especialistas do Brasil e do mundo, passando por rigorosos testes clínicos antes de chegarem à sua clínica.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Award className="h-6 w-6 text-[#ECB546]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Certificação SAP</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Global Purity</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-[#ECB546]" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Academy MedBeauty</span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-widest">Treinamento Expert</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {endorsements.map((item, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] flex gap-6 items-center transition-all duration-500 hover:bg-white/10 group",
                                    "animate-fade-in-right"
                                )}
                                style={{ animationDelay: `${index * 200}ms` }}
                            >
                                <div className="relative shrink-0 hidden sm:block">
                                    <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-[#ECB546]/50 transition-colors">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#ECB546] rounded-full p-1.5 shadow-lg">
                                        <Quote className="h-3 w-3 text-[#2B0F54] fill-current" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold">{item.name}</span>
                                            <span className="text-[10px] text-[#ECB546] font-bold uppercase tracking-widest">{item.role}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/10">{item.cert}</span>
                                    </div>
                                    <p className="text-white/70 text-sm italic py-1 border-l-2 border-[#ECB546]/20 pl-4">
                                        "{item.text}"
                                    </p>
                                    <div className="flex gap-1 text-[#ECB546]">
                                        {[...Array(item.rating)].map((_, i) => (
                                            <Star key={i} className="h-3 w-3 fill-current" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
