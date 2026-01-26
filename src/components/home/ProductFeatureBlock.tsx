import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProductFeatureBlockProps {
    title: string;
    description: string;
    features: string[];
    imagePosition?: "left" | "right";
    backgroundColor?: "purple" | "mauve" | "gray";
}

export function ProductFeatureBlock({
    title,
    description,
    features,
    imagePosition = "right",
    backgroundColor = "purple"
}: ProductFeatureBlockProps) {
    const bgColors = {
        purple: "bg-gradient-to-br from-purple-900 to-purple-800",
        mauve: "bg-gradient-to-br from-purple-200 to-purple-100",
        gray: "bg-gradient-to-br from-gray-100 to-gray-50"
    };

    const textColors = {
        purple: "text-white",
        mauve: "text-gray-900",
        gray: "text-gray-900"
    };

    const textColorMuted = {
        purple: "text-white/80",
        mauve: "text-gray-700",
        gray: "text-gray-700"
    };

    return (
        <section className={`py-20 ${bgColors[backgroundColor]}`}>
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${imagePosition === "left" ? "lg:flex-row-reverse" : ""}`}>
                    {/* Image Side */}
                    <div className={`${imagePosition === "left" ? "lg:order-1" : "lg:order-2"}`}>
                        <div className="aspect-square bg-white/10 backdrop-blur-sm rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-elegant">
                            <div className={`text-center ${textColorMuted[backgroundColor]}`}>
                                <svg
                                    className="w-32 h-32 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                <p className="text-lg font-medium">Imagem do produto</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className={`${imagePosition === "left" ? "lg:order-2" : "lg:order-1"}`}>
                        <h2 className={`text-4xl sm:text-5xl font-bold ${textColors[backgroundColor]} mb-6`}>
                            {title}
                        </h2>
                        <p className={`text-xl ${textColorMuted[backgroundColor]} mb-8 leading-relaxed`}>
                            {description}
                        </p>

                        {/* Features List */}
                        <ul className="space-y-4 mb-8">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full ${backgroundColor === "purple" ? "bg-yellow-400" : "bg-primary"} flex items-center justify-center`}>
                                        <Check className={`w-4 h-4 ${backgroundColor === "purple" ? "text-purple-900" : "text-white"}`} />
                                    </div>
                                    <span className={`text-lg ${textColors[backgroundColor]}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            asChild
                            size="lg"
                            className={`${backgroundColor === "purple" ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900" : "bg-primary hover:bg-primary/90 text-white"} font-semibold px-8 py-6 text-lg shadow-xl`}
                        >
                            <Link to="/produtos">
                                Saiba Mais
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
