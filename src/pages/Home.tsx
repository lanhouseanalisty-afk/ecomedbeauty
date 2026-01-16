import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { ProductCarousel3D } from "@/components/home/ProductCarousel3D";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CTASection } from "@/components/home/CTASection";
import { TrustBadges } from "@/components/ui/trust-badges";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>MedBeauty - Produtos Premium para Estética Profissional</title>
        <meta
          name="description"
          content="Descubra a linha completa MedBeauty de produtos para estética profissional. Fios de PDO, preenchedores, skincare e instrumentais. Naturalmente beauty, definitivamente tech."
        />
        <link rel="canonical" href="https://medbeauty.com.br" />
      </Helmet>

      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <HowItWorksSection />
      <ProductCarousel3D />
      <TestimonialsSection />

      {/* Trust Badges */}
      <section className="py-12 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <TrustBadges variant="grid" />
        </div>
      </section>

      <NewsletterSection />
      <CTASection />
    </>
  );
}
