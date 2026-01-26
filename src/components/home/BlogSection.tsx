import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function BlogSection() {
    const posts = [
        {
            title: "Tendências em Estética 2024",
            excerpt: "Descubra as principais tendências que estão moldando o mercado de estética profissional.",
            image: "blog-1",
            date: "15 Jan 2024"
        },
        {
            title: "Fios de PDO: Guia Completo",
            excerpt: "Tudo o que você precisa saber sobre fios de PDO e suas aplicações.",
            image: "blog-2",
            date: "10 Jan 2024"
        },
        {
            title: "Cuidados Pós-Procedimento",
            excerpt: "Orientações essenciais para garantir os melhores resultados aos seus pacientes.",
            image: "blog-3",
            date: "05 Jan 2024"
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                        Blog & Novidades
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Fique por dentro das últimas novidades e tendências do mercado
                    </p>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <article
                            key={index}
                            className="bg-white rounded-2xl shadow-card hover:shadow-elegant transition-all duration-300 overflow-hidden border border-border hover:border-primary/30 group"
                        >
                            {/* Image Placeholder */}
                            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <svg
                                    className="w-16 h-16 text-primary/40"
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
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <p className="text-sm text-muted-foreground mb-3">
                                    {post.date}
                                </p>
                                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-muted-foreground mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <Link
                                    to="/blog"
                                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                                >
                                    Continue Lendo
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
