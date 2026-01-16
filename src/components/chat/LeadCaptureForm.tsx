import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^[\d\s()+-]+$/.test(val),
      "Telefone inválido"
    ),
  optInMarketing: z.boolean(),
  lgpdConsent: z.boolean().refine((val) => val === true, {
    message: "Você precisa aceitar os termos para continuar",
  }),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  onClose: () => void;
  onSuccess: (name: string) => void;
  topic?: string;
}

export function LeadCaptureForm({ onClose, onSuccess, topic }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      optInMarketing: true,
      lgpdConsent: false,
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("leads").insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        topic: topic || "newsletter",
        opt_in_marketing: data.optInMarketing,
        lgpd_consent_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado!",
        description: "Você receberá nossas novidades em breve.",
      });
      onSuccess(data.name);
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Erro ao cadastrar",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-scale-in rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Receba Novidades
        </h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Nome completo *
          </label>
          <input
            type="text"
            {...register("name")}
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
              errors.name ? "border-destructive" : "border-input"
            )}
            placeholder="Seu nome"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            E-mail *
          </label>
          <input
            type="email"
            {...register("email")}
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
              errors.email ? "border-destructive" : "border-input"
            )}
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Telefone (opcional)
          </label>
          <input
            type="tel"
            {...register("phone")}
            className={cn(
              "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30",
              errors.phone ? "border-destructive" : "border-input"
            )}
            placeholder="(11) 99999-9999"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Opt-in Marketing */}
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register("optInMarketing")}
            className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
          />
          <span className="text-sm text-muted-foreground">
            Quero receber ofertas e novidades por e-mail
          </span>
        </label>

        {/* LGPD Consent */}
        <div>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              {...register("lgpdConsent")}
              className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-muted-foreground">
              Li e aceito a{" "}
              <a
                href="https://medbeauty.com.br/politica-privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-rose-gold-dark"
              >
                Política de Privacidade
              </a>{" "}
              e autorizo o tratamento dos meus dados pessoais (LGPD) *
            </span>
          </label>
          {errors.lgpdConsent && (
            <p className="mt-1 text-xs text-destructive">
              {errors.lgpdConsent.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all",
            "hover:bg-rose-gold-dark focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          Seus dados estão protegidos conforme a LGPD
        </p>
      </form>
    </div>
  );
}
