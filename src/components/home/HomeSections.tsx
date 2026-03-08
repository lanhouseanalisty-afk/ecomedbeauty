import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCMS } from "@/contexts/CMSContext";
import { CMSText } from "@/components/cms/CMSText";
import { CMSImage } from "@/components/cms/CMSImage";
import { CheckSquare, ShieldCheck } from "lucide-react";

// Section: "Evidência Clínica" - Overhauled for Grade 10+
export function ClinicalEvidenceSection() {
    const { content } = useCMS();

    return (
        <section className="relative py-24 lg:py-32 overflow-hidden bg-slate-50">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-5" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual Comparison / Evidence Card */}
                    <div className="relative group animate-fade-in-up">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-[#2B0F54]/10 to-[#ECB546]/10 rounded-[4rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <CMSImage
                            path="home.evidence.image"
                            alt="Evidência Clínica"
                            containerClassName="relative bg-white rounded-[3.5rem] p-4 shadow-elegant border border-slate-100 overflow-hidden"
                            className="w-full h-[500px] object-cover rounded-[3rem] transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute bottom-10 left-10 right-10 flex gap-4 pointer-events-none">
                            <div className="flex-1 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg pointer-events-auto">
                                <CMSText path="home.evidence.stat1Value" className="text-2xl font-bold text-[#2B0F54]" />
                                <CMSText path="home.evidence.stat1Label" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" />
                            </div>
                            <div className="flex-1 bg-[#2B0F54]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-lg">
                                <CMSText path="home.evidence.stat2Value" className="text-2xl font-bold text-[#ECB546]" />
                                <CMSText path="home.evidence.stat2Label" className="text-[10px] font-bold text-white/60 uppercase tracking-widest" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-10 animate-fade-in-up stagger-1">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 text-[#ECB546]">
                            <ShieldCheck className="h-5 w-5" />
                            <CMSText path="home.evidence.badge" className="text-xs font-bold uppercase tracking-[0.3em]" />
                        </div>
                        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2B0F54] leading-tight">
                            <CMSText path="home.evidence.titleStart" /> <br />
                            <span className="text-[#cfa79d] italic"><CMSText path="home.evidence.titleHighlight" /></span>
                        </h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            <CMSText path="home.evidence.description" multiline />
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {[
                            { title: "Certificação Global", desc: "Aprovado pelos rigorosos critérios da ANVISA, CE e FDA Compliant." },
                            { title: "Rastreabilidade SAP", desc: "Controle total do lote, desde a síntese molecular até a sua clínica." },
                            { title: "Biocompatibilidade", desc: "Fórmulas otimizadas para integração tecidual sem resposta inflamatória." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-5 group">
                                <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 group-hover:border-[#ECB546]/30 transition-colors">
                                    <CheckSquare className="h-5 w-5 text-[#ECB546]" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-[#2B0F54]">{item.title}</h4>
                                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

// Section: Brand Logos - Scrolling Marquee Grade 10+
export function BrandLogosSection() {
    const brands = [
        { img: '/medbeauty/logo_ithread.jpg.webp', link: '/produto/i-thread' },
        { img: '/medbeauty/logo_eptq.jpg.webp', link: '/produto/eptq' },
        { img: '/medbeauty/logo_splendor.jpg.webp', link: '#' },
        { img: '/medbeauty/logo_sphera.jpg.webp', link: '#' },
        { img: '/medbeauty/logo_nano.jpg.webp', link: '#' },
        { img: '/medbeauty/logo_idebenone.jpg.webp', link: '#' },
    ];

    return (
        <section className="py-16 bg-white border-y border-slate-100 overflow-hidden">
            <div className="flex flex-col items-center mb-10 space-y-2">
                <CMSText path="home.brands.badge" className="text-[10px] font-bold text-[#ECB546] uppercase tracking-[0.3em]" />
                <CMSText path="home.brands.title" className="font-serif text-2xl font-bold text-[#2B0F54]" />
            </div>

            <div className="relative flex overflow-hidden group">
                <div className="flex animate-marquee whitespace-nowrap gap-16 items-center py-4 group-hover:pause">
                    {[...brands, ...brands, ...brands].map((brand, idx) => (
                        <Link
                            key={idx}
                            to={brand.link}
                            className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 px-4"
                        >
                            <img src={brand.img} alt="Brand" className="h-10 md:h-14 object-contain mix-blend-multiply" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

