export function BrandShowcase() {
    const brands = [
        "i-THREAD",
        "e.p.t.q.",
        "Splendor",
        "MedBeauty",
        "Premium Line",
        "Professional"
    ];

    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Marcas Parceiras
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Trabalhamos com as melhores marcas do mercado
                    </p>
                </div>

                {/* Brand Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                    {brands.map((brand, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-gray-200 hover:border-primary/30 group"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-2xl font-bold text-primary">
                                        {brand.charAt(0)}
                                    </span>
                                </div>
                                <p className="text-sm font-semibold text-foreground">
                                    {brand}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
