import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsLoading(false);
    toast.success("Inscrição realizada com sucesso!");
  };

  return (
    <section className="relative overflow-hidden py-24 bg-[#2b0f54]">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#ECB546]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ECB546]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <Mail className="h-10 w-10 text-[#ECB546]" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Fique por dentro das novidades
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Receba ofertas exclusivas, lançamentos e conteúdos sobre estética avançada diretamente no seu e-mail.
          </p>

          {isSubmitted ? (
            <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-white font-medium text-lg">Obrigado por se inscrever!</p>
              <p className="text-sm text-gray-400">
                Em breve você receberá nossas novidades.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#ECB546] focus:ring-[#ECB546]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full gap-2 bg-[#ECB546] hover:bg-[#d9a53f] text-[#2b0f54] font-bold uppercase tracking-wider transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Inscrevendo..."
                  ) : (
                    <>
                      Quero receber novidades
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Ao se inscrever, você concorda com nossa{" "}
                <a href="/privacidade" className="text-[#ECB546] hover:underline">
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
