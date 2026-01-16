import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const products = [
    {
        id: 1,
        name: "Fios PDO Premium",
        category: "Fios de Sustentação",
        price: "R$ 450,00",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=500&fit=crop",
        gradient: "from-purple-500 to-pink-500",
    },
    {
        id: 2,
        name: "Preenchedor Facial",
        category: "Preenchedores",
        price: "R$ 680,00",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=500&fit=crop",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        id: 3,
        name: "Sérum Revitalizante",
        category: "Skincare",
        price: "R$ 320,00",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=500&fit=crop",
        gradient: "from-green-500 to-emerald-500",
    },
    {
        id: 4,
        name: "Kit Instrumental Pro",
        category: "Instrumentais",
        price: "R$ 1.200,00",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=500&fit=crop",
        gradient: "from-orange-500 to-red-500",
    },
    {
        id: 5,
        name: "Fios PDO Ultra",
        category: "Fios de Sustentação",
        price: "R$ 520,00",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=500&fit=crop",
        gradient: "from-indigo-500 to-purple-500",
    },
];

export function ProductCarousel3D() {
    const [currentIndex, setCurrentIndex] = useState(2);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const getCardStyle = (index: number) => {
        const diff = index - currentIndex;
        const absIndex = ((diff % products.length) + products.length) % products.length;

        if (absIndex === 0) {
            // Center card
            return {
                transform: "translateX(0%) scale(1.1) translateZ(0px) rotateY(0deg)",
                zIndex: 50,
                opacity: 1,
                filter: "brightness(1)",
            };
        } else if (absIndex === 1 || absIndex === products.length - 1) {
            // Adjacent cards
            const side = absIndex === 1 ? 1 : -1;
            return {
                transform: `translateX(${side * 85}%) scale(0.85) translateZ(-100px) rotateY(${-side * 25}deg)`,
                zIndex: 40,
                opacity: 0.7,
                filter: "brightness(0.7)",
            };
        } else if (absIndex === 2 || absIndex === products.length - 2) {
            // Far cards
            const side = absIndex === 2 ? 1 : -1;
            return {
                transform: `translateX(${side * 140}%) scale(0.65) translateZ(-200px) rotateY(${-side * 35}deg)`,
                zIndex: 30,
                opacity: 0.4,
                filter: "brightness(0.5)",
            };
        } else {
            // Hidden cards
            return {
                transform: "translateX(0%) scale(0.5) translateZ(-300px)",
                zIndex: 10,
                opacity: 0,
                filter: "brightness(0.3)",
            };
        }
    };

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setIsAutoPlaying(false);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        setIsAutoPlaying(false);
    };

    return (
        <section className="py-24 lg:py-32 bg-gradient-to-b from-muted/20 to-background overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="font-serif text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
                        Produtos em Destaque
                    </h2>
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
                        Explore nossa seleção premium em 3D
                    </p>
                </div>

                {/* 3D Carousel Container */}
                <div
                    className="relative h-[600px] mb-16"
                    style={{ perspective: "2000px" }}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="absolute w-[350px] transition-all duration-700 ease-out cursor-pointer"
                                style={getCardStyle(index)}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                }}
                            >
                                <div className="relative group">
                                    {/* Card with glassmorphism */}
                                    <div className="relative rounded-3xl overflow-hidden bg-card/80 backdrop-blur-xl border-2 border-border/50 shadow-2xl hover:shadow-primary/20 transition-all duration-500">
                                        {/* Gradient overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10`} />

                                        {/* Product image */}
                                        <div className="relative h-[400px] overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            {/* Shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                        </div>

                                        {/* Product info */}
                                        <div className="relative p-6 z-20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${product.gradient} text-white text-xs font-bold`}>
                                                    {product.category}
                                                </span>
                                                <div className="flex items-center gap-1 ml-auto">
                                                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                                    <span className="text-sm font-semibold">{product.rating}</span>
                                                </div>
                                            </div>

                                            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center justify-between mt-4">
                                                <span className={`text-3xl font-black bg-gradient-to-r ${product.gradient} bg-clip-text text-transparent`}>
                                                    {product.price}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    className="gap-2 shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    Ver Mais
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3D depth effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-card/80 backdrop-blur-xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 group"
                    >
                        <ChevronLeft className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-card/80 backdrop-blur-xl border-2 border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 group"
                    >
                        <ChevronRight className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
                    </button>
                </div>

                {/* Indicators */}
                <div className="flex items-center justify-center gap-3">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setIsAutoPlaying(false);
                            }}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                    ? "w-12 h-3 bg-gradient-to-r from-primary to-accent"
                                    : "w-3 h-3 bg-border hover:bg-primary/50"
                                }`}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Button asChild size="lg" className="gap-2 shadow-xl hover:shadow-2xl transition-all px-10 py-6 text-lg">
                        <Link to="/produtos">
                            Ver Todos os Produtos
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
