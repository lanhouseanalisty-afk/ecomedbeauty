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
    <section className="py-20 lg:py-28 bg-gradient-to-b from-background to-muted/10">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Explore por categoria
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Encontre os melhores produtos para cada tipo de procedimento
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {displayCategories.map((category, index) => (
            <Link
              key={category.id}
              to={`/produtos?categoria=${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image with parallax effect */}
              <img
                src={categoryImages[category.id]}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-125"
              />

              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/80" />

              {/* Accent border on hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-all duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-7">
                <h3 className="font-serif text-lg font-bold text-white lg:text-2xl mb-2 transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/90 transform transition-all duration-500 group-hover:gap-3">
                  <span className="font-medium">{category.count} produtos</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
                </div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

