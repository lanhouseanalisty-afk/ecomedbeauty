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
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 gradient-premium" />
      
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-foreground">
            Fique por dentro das novidades
          </h2>
          <p className="mt-3 text-muted-foreground">
            Receba ofertas exclusivas, lançamentos e conteúdos sobre estética avançada.
          </p>

          {isSubmitted ? (
            <div className="mt-8 flex flex-col items-center gap-3 animate-fade-in-up">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-foreground font-medium">Obrigado por se inscrever!</p>
              <p className="text-sm text-muted-foreground">
                Em breve você receberá nossas novidades.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <Button type="submit" className="gap-2" disabled={isLoading}>
                  {isLoading ? (
                    "Inscrevendo..."
                  ) : (
                    <>
                      Inscrever-se
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Ao se inscrever, você concorda com nossa{" "}
                <a href="/privacidade" className="text-primary hover:underline">
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
