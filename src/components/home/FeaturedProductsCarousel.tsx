import * as React from "react"
import { CMSText } from "@/components/cms/CMSText"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export function FeaturedProductsCarousel() {
    const plugins = React.useMemo(
        () => [Autoplay({ delay: 2000, stopOnInteraction: false })],
        []
    )

    const products = [
        {
            id: 1,
            name: "i-THREAD",
            description: "Fios de PDO de alta performance.",
            image: "/medbeauty/i-tread3.webp",
            link: "/produto/i-thread"
        },
        {
            id: 2,
            name: "e.p.t.q.",
            description: "Ácido hialurônico de pureza superior.",
            image: "/medbeauty/eptq.webp",
            link: "/produto/eptq"
        },
        {
            id: 3,
            name: "Idebenone",
            description: "O antioxidante mais potente do mercado.",
            image: "/medbeauty/ibedome-03.webp",
            link: "/produto/idebenone"
        },
        {
            id: 4,
            name: "Linha Premium",
            description: "Soluções para terapia capilar.",
            image: "/medbeauty/banner_4.png",
            link: "/produtos"
        },
        {
            id: 5,
            name: "Bioestimuladores",
            description: "Recupere o colágeno e a firmeza.",
            image: "/medbeauty/banner_2.png",
            link: "/produtos"
        }
    ]

    return (
        <section className="py-20 bg-gradient-to-br from-[#fdfbf7] via-[#f4f1f9] to-[#efeaf6]">
            <div className="max-w-7xl mx-auto px-4">
                <CMSText
                    path="home.featured.title"
                    className="text-3xl md:text-4xl font-serif font-bold text-center text-[#2b0f54] mb-4"
                />
                <CMSText
                    path="home.featured.subtitle"
                    className="text-center text-[#5a4b66] mb-12 max-w-2xl mx-auto block"
                />

                <Carousel
                    plugins={plugins}
                    className="w-full max-w-6xl mx-auto"
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1 h-full">
                                    <div className="relative group h-full overflow-hidden rounded-2xl bg-white/40 backdrop-blur-md border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                        {/* Glass Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />

                                        <div className="relative z-10 flex flex-col items-center p-6 lg:p-8 h-full text-center">
                                            <div className="relative h-48 w-full flex items-center justify-center mb-6">
                                                {/* Glow behind image */}
                                                <div className="absolute w-32 h-32 bg-[#cfa79d]/20 rounded-full blur-[40px] group-hover:bg-[#cfa79d]/30 transition-all duration-500" />
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="relative h-full w-full object-contain drop-shadow-xl group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                                                />
                                            </div>

                                            <h3 className="text-2xl font-bold text-[#2b0f54] mb-2 font-serif group-hover:text-[#cfa79d] transition-colors">{product.name}</h3>
                                            <p className="text-[#5a4b66] text-sm mb-6 flex-grow leading-relaxed font-medium">
                                                {product.description}
                                            </p>

                                            <Button asChild variant="outline" className="w-full border-[#cfa79d] text-[#2b0f54] hover:bg-[#cfa79d] hover:text-white rounded-full uppercase tracking-wider font-semibold group-hover:shadow-glow transition-all">
                                                <Link to={product.link}>Explorar</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden md:flex -left-4 md:-left-12 border-none bg-white/50 hover:bg-[#cfa79d] hover:text-white shadow-soft backdrop-blur-sm" />
                    <CarouselNext className="hidden md:flex -right-4 md:-right-12 border-none bg-white/50 hover:bg-[#cfa79d] hover:text-white shadow-soft backdrop-blur-sm" />
                </Carousel>
            </div>
        </section>
    )
}
