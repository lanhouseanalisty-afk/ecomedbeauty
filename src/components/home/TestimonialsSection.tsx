import { RatingStars } from "@/components/ui/rating-stars";
import { Quote, Loader2 } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";

export function TestimonialsSection() {
  const { data: testimonials, isLoading } = useTestimonials();

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-[#fdfbf7] to-[#f4f1f9]">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl font-bold text-[#2b0f54]">
            O que dizem nossos clientes
          </h2>
          <p className="mt-3 text-[#5a4b66] max-w-2xl mx-auto">
            Profissionais de estética de todo o Brasil confiam na MedBeauty
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials?.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="relative rounded-xl border border-[#eee0d9] bg-white/80 backdrop-blur-sm p-6 shadow-card transition-all duration-300 hover:shadow-soft hover-lift animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-[#cfa79d]/20" />

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#cfa79d] text-white font-semibold shadow-md">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-[#2b0f54]">{testimonial.name}</h4>
                  <p className="text-sm text-[#5a4b66]">{testimonial.role}</p>
                </div>
              </div>

              <div className="mt-4">
                <RatingStars rating={testimonial.rating} size="sm" />
              </div>

              <p className="mt-4 text-[#5a4b66] leading-relaxed">
                "{testimonial.content}"
              </p>

              <p className="mt-4 text-xs text-[#8e809c]">
                {testimonial.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
