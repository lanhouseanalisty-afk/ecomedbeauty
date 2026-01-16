import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-16 lg:py-24">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-primary-foreground lg:text-4xl">
          Pronto para elevar seus resultados?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/80 lg:text-lg">
          Entre em contato com nossa equipe e descubra como a MedBeauty pode transformar seus procedimentos com produtos de qualidade superior.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="gap-2 shadow-elegant"
          >
            <Link to="/contato">
              Fale Conosco
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <a href="tel:+551199999999">
              <Phone className="h-4 w-4" />
              (11) 9999-9999
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
