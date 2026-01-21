import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/products";

const categoryImages: Record<string, string> = {
  Fios: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
  Preenchedores: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop",
  Skincare: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=300&fit=crop",
  Instrumentais: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop",
};

export function CategoriesSection() {
  const displayCategories = categories.filter((c) => c.id !== "all");

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Explore por categoria
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Encontre os melhores produtos para cada tipo de procedimento
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {displayCategories.map((category, index) => (
            <Link
              key={category.id}
              to={`/produtos?categoria=${category.id}`}
              className="group relative overflow-hidden rounded-xl aspect-[4/3] animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <img
                src={categoryImages[category.id]}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-6">
                <h3 className="font-serif text-lg font-bold text-white lg:text-xl">
                  {category.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                  <span>{category.count} produtos</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
