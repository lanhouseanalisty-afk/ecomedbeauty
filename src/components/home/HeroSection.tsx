import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCMS } from "@/contexts/CMSContext";
import { Button } from "@/components/ui/button";

const slides = [
  '/medbeauty/banner_1.png',
  '/medbeauty/banner_2.png',
  '/medbeauty/banner_3.png',
  '/medbeauty/banner_4.png'
];

export function HeroSection() {
  const { isEditing } = useCMS();
  const LinkComponent = isEditing ? "div" : Link;
  const linkProps = (to: string) => isEditing ? {} : { to };
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[650px] w-full overflow-hidden bg-black">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          style={{
            backgroundImage: `url(${slide})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ))}

      {/* Overlay Content */}
      <div className="relative z-10 mx-auto h-full max-w-7xl px-4 flex items-center lg:px-8">
        <div className="max-w-2xl animate-fade-in-up bg-black/30 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-serif leading-tight drop-shadow-lg">
            Beleza
            <br />
            elevada
            <br />
            à ciência
          </h2>

          <div className="mt-8">
            <Button
              asChild={!isEditing}
              className="bg-[#cfa79d] hover:bg-[#b08d85] text-white rounded-none px-8 py-6 text-sm uppercase tracking-wider font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <LinkComponent {...linkProps("/onde-comprar")}>
                Onde Comprar
              </LinkComponent>
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white/80"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
