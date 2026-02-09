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
    <section className="relative overflow-hidden py-32 bg-[#2b0f54]">
      {/* Decorative Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-10 mix-blend-overlay" />

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ECB546]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2B0F54] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 mb-10">
            <Mail className="h-4 w-4 text-[#ECB546]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Clinical Updates</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Faça parte da nossa <br />
            <span className="text-[#ECB546]">Comunidade Científica</span>
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            Receba com exclusividade laudos técnicos, lançamentos de ativos e convites para workshops presenciais na Academy MedBeauty.
          </p>

          {isSubmitted ? (
            <div className="flex flex-col items-center gap-4 animate-fade-in-up bg-white/5 border border-white/10 p-12 rounded-[3rem] backdrop-blur-md">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h4 className="text-white font-serif text-2xl font-bold">Credenciais Enviadas</h4>
              <p className="text-sm text-gray-400 max-w-sm">
                Enviamos um e-mail de confirmação. Em breve você terá acesso ao nosso conteúdo restrito para profissionais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Mail className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30" />
                  <Input
                    type="email"
                    placeholder="E-mail profissional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-14 h-16 bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-[1.5rem] focus:border-[#ECB546] focus:ring-[#ECB546]/20 transition-all text-lg"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="h-16 px-10 gap-3 bg-[#ECB546] hover:bg-[#d9a53f] text-[#2b0f54] font-bold uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 hover:scale-[1.05] shadow-xl shadow-[#ECB546]/10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Processando..."
                  ) : (
                    <>
                      Assinar News
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Ao se inscrever, você aceita nossa{" "}
                <a href="/privacidade" className="text-[#ECB546] hover:underline">
                  Política de Privacidade Médica
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
