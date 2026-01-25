import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/home/HeroSection";
import {
  RealResultsSection,
  BrandLogosSection
} from "@/components/home/HomeSections";
import { FeaturedProductsCarousel } from "@/components/home/FeaturedProductsCarousel";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>MedBeauty – Você Naturalmente Beauty</title>
        <meta
          name="description"
          content="A Medbeauty é especializada em soluções estéticas de alta performance, desenvolvidas com tecnologia e foco em resultados naturais e seguros."
        />
        <link rel="canonical" href="https://medbeauty.com.br" />
      </Helmet>

      <HeroSection />
      <RealResultsSection />
      <BrandLogosSection />
      <FeaturedProductsCarousel />

      {/* Keeping some original sections as additional content lower on the page */}
      {/* <FeaturesSection /> */}
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
