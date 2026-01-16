import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contactInfo = [
  {
    icon: Phone,
    title: "Telefone / WhatsApp",
    value: "(11) 4551-3513",
    href: "tel:+551145513513",
  },
  {
    icon: Mail,
    title: "E-mail",
    value: "sac@medbeauty.com.br",
    href: "mailto:sac@medbeauty.com.br",
  },
  {
    icon: MapPin,
    title: "Endereço",
    value: "São Paulo, SP - Brasil",
    href: null,
  },
  {
    icon: Clock,
    title: "Horário de Atendimento",
    value: "Seg a Sex, 9h às 18h",
    href: null,
  },
];

export default function Contact() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <>
      <Helmet>
        <title>Contato | MedBeauty</title>
        <meta
          name="description"
          content="Entre em contato com a MedBeauty. Estamos prontos para atender você. Telefone: (11) 4551-3513 | E-mail: sac@medbeauty.com.br"
        />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Fale Conosco
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Estamos aqui para ajudar. Entre em contato conosco.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Informações de Contato
            </h2>
            <p className="mt-4 text-muted-foreground">
              Nossa equipe está pronta para atender você. Escolha o canal de sua
              preferência.
            </p>

            <div className="mt-8 space-y-6">
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-xl border border-border bg-card p-6 lg:p-8">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              Envie sua mensagem
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  rows={4}
                  required
                  className="mt-1 resize-none"
                />
              </div>

              <Button type="submit" className="w-full">
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
