import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Section: "Você é naturalmente beauty"
export function BrandStatementSection() {
    return (
        <section className="py-20 bg-[#fdfbf7] text-center">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-[#cfa79d] font-bold text-3xl md:text-4xl font-serif mb-4 uppercase tracking-widest">
                    MEDBEAUTY
                </h2>
                <p className="text-[#5a4b66] text-lg md:text-xl font-light italic">
                    Você é naturalmente beauty!
                </p>
            </div>
        </section>
    )
}

import { CheckSquare } from "lucide-react";

// Section: "Resultados Reais" - Redesigned
export function RealResultsSection() {
    return (
        <section className="relative w-full overflow-hidden bg-[#7e6c92] min-h-[500px] flex items-center py-12 lg:py-0">
            <div className="mx-auto w-full max-w-[1400px] flex flex-col lg:flex-row relative z-10 px-4 lg:px-0">

                {/* Left Card - Glassmorphism Effect */}
                <div className="bg-white/90 backdrop-blur-xl border border-white/20 lg:w-[65%] w-full rounded-r-[50px] lg:rounded-r-[80px] rounded-l-[20px] lg:rounded-l-none flex flex-col md:flex-row shadow-2xl overflow-hidden relative min-h-[450px]">
                    {/* Image Side */}
                    <div className="w-full md:w-1/2 relative h-[300px] md:h-auto">
                        <img
                            src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1974&auto=format&fit=crop"
                            alt="Resultados Reais"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Gold Glow/Overlay effect at bottom left */}
                        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-[#ECB546]/30 blur-[60px] rounded-full pointer-events-none"></div>
                    </div>

                    {/* Text Side */}
                    <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                        <h2 className="text-[#3b1b63] font-bold text-3xl md:text-4xl font-sans mb-6">
                            Resultados reais
                        </h2>
                        <p className="text-gray-600 text-base leading-relaxed">
                            A Medbeauty é especializada em soluções estéticas de alta performance, desenvolvidas com tecnologia e foco em resultados naturais e seguros.
                        </p>
                    </div>

                    {/* Decorative Purple Curve overlapping from right (Visual trick) */}
                    <div className="absolute top-0 right-0 w-0 md:w-0 h-full"></div>
                </div>

                {/* Right Content - On Purple Background */}
                <div className="lg:w-[35%] w-full flex flex-col justify-center pl-8 lg:pl-16 pr-8 mt-8 lg:mt-0 text-white space-y-8">

                    {[
                        "Todos os produtos MedBeauty são desenvolvidos seguindo os mais rigorosos padrões de qualidade e segurança",
                        "Certificação ISO, CE e BPF ANVISA: Atestando que nossos processos de produção seguem normas internacionais de qualidade.",
                        "Registro na ANVISA: Garantindo que nossos produtos são seguros e aprovados para uso no Brasil.",
                        "Certificações Internacionais: Reconhecimento de órgãos globais que validam a eficácia e a biocompatibilidade dos nossos produtos."
                    ].map((text, idx) => (
                        <div key={idx} className="flex gap-4 items-start group">
                            <div className="mt-1 shrink-0">
                                <div className="bg-white/20 p-1 rounded hover:bg-white/30 transition-colors">
                                    <CheckSquare className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <p className="text-sm font-medium leading-normal opacity-90 group-hover:opacity-100 transition-opacity">
                                {text}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    )
}

// Section: Brand Logos Grid
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
        <section className="py-12 border-t border-b border-[#eee0d9] bg-[#fcfaf7]">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {brands.map((brand, idx) => (
                        <Link
                            key={idx}
                            to={brand.link}
                            className="hover:opacity-100 transition-opacity animate-float"
                            style={{ animationDelay: `${idx * 0.5}s` }}
                        >
                            <img src={brand.img} alt="Brand" className="h-8 md:h-12 object-contain mix-blend-multiply" />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

// Section: Product Highlights (Alternating)
export function ProductHighlightsSection() {
    return (
        <div className="flex flex-col">
            {/* i-Thread */}
            <section className="bg-gradient-to-br from-[#fdfbf7] via-[#f7f4fc] to-[#efeaf6] py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h2 className="text-4xl font-serif font-bold text-[#2b0f54]">i-THREAD</h2>
                        <p className="text-[#5a4b66] text-lg leading-relaxed">
                            O i-Thread foi o primeiro fio de PDO a ser introduzido no mercado brasileiro e, desde então, consolidou-se como referência em excelência e confiança.
                        </p>
                        <Button asChild className="bg-[#cfa79d] hover:bg-[#b08d85] text-white uppercase tracking-wider px-8 rounded-none shadow-md">
                            <Link to="/produto/i-thread">Saiba mais</Link>
                        </Button>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center">
                        <img src="/medbeauty/i-tread3.webp" alt="i-Thread" className="max-w-full max-h-[500px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
            </section>

            {/* e.p.t.q. */}
            <section className="bg-gradient-to-bl from-[#efeaf6] via-[#f7f4fc] to-[#fdfbf7] py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="order-1 lg:order-1 flex justify-center">
                        <img src="/medbeauty/eptq.webp" alt="e.p.t.q." className="max-w-full max-h-[500px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="space-y-6 order-2 lg:order-2 lg:pl-12">
                        <h2 className="text-4xl font-serif font-bold text-[#2b0f54]">e.p.t.q.</h2>
                        <p className="text-[#5a4b66] text-lg leading-relaxed">
                            O e.p.t.q. é um preenchedor de ácido hialurônico reconhecido em mais de 60 países pela sua pureza e qualidade superior.
                        </p>
                        <Button asChild className="bg-[#cfa79d] hover:bg-[#b08d85] text-white uppercase tracking-wider px-8 rounded-none shadow-md">
                            <Link to="/produto/eptq">Saiba mais</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Idebenone */}
            <section className="bg-gradient-to-br from-[#fdfbf7] via-[#f7f4fc] to-[#efeaf6] py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 order-2 lg:order-1">
                        <h2 className="text-4xl font-serif font-bold text-[#2b0f54]">Idebenone Ampoule</h2>
                        <p className="text-[#5a4b66] text-lg leading-relaxed">
                            Idebenone Ampoule é o antioxidante mais potente do mercado. Com eficácia superior a outros princípios ativos e resultados 4x mais potentes que o da Vitamina C.
                        </p>
                        <Button asChild className="bg-[#cfa79d] hover:bg-[#b08d85] text-white uppercase tracking-wider px-8 rounded-none shadow-md">
                            <Link to="/produto/idebenone">Saiba mais</Link>
                        </Button>
                    </div>
                    <div className="order-1 lg:order-2 flex justify-center">
                        <img src="/medbeauty/ibedome-03.webp" alt="Idebenone" className="max-w-full max-h-[500px] object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                </div>
            </section>
        </div>
    )
}
