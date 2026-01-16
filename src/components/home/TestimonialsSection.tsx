import { testimonials } from "@/data/products";
import { RatingStars } from "@/components/ui/rating-stars";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            O que dizem nossos clientes
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Profissionais de estética de todo o Brasil confiam na MedBeauty
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-soft hover-lift animate-fade-in-up opacity-0"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>

              <div className="mt-4">
                <RatingStars rating={testimonial.rating} size="sm" />
              </div>

              <p className="mt-4 text-muted-foreground leading-relaxed">
                "{testimonial.content}"
              </p>

              <p className="mt-4 text-xs text-muted-foreground">
                {testimonial.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
