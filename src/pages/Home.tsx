import { Helmet } from "react-helmet-async";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandLogosSection, ClinicalEvidenceSection } from "@/components/home/HomeSections";
import { ScientificInnovation } from "@/components/home/ScientificInnovation";
import { MedicalEndorsements } from "@/components/home/MedicalEndorsements";
import { FeaturedProductsCarousel } from "@/components/home/FeaturedProductsCarousel";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>MedBeauty – Ciência Elevada à Beleza</title>
        <meta
          name="description"
          content="Liderança em tecnologia estética com soluções de alta performance, fios de PDO, preenchedores de AH e nutrição celular avançada."
        />
        <link rel="canonical" href="https://medbeauty.com.br" />
      </Helmet>

      <HeroSection />

      {/* 1. Global Brand Marquee */}
      <BrandLogosSection />

      {/* 2. Scientific Core Innovation */}
      <ScientificInnovation />

      {/* 3. Featured Portfolio */}
      <FeaturedProductsCarousel />

      {/* 4. Clinical Evidence & Data */}
      <ClinicalEvidenceSection />

      {/* 5. Medical Trust & Endorsements */}
      <MedicalEndorsements />

      {/* 6. Professional Community Expansion */}
      <NewsletterSection />
    </>
  );
}
