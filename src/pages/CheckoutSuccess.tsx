import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Package, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function CheckoutSuccess() {
  const { items, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const sessionId = searchParams.get("session_id");
  const subtotal = totalPrice;

  useEffect(() => {
    const sendConfirmationEmail = async () => {
      if (!sessionId || emailSent || items.length === 0) return;

      try {
        // Get user email
        const email = user?.email || sessionStorage.getItem("guestEmail");
        const customerName = user?.user_metadata?.full_name || sessionStorage.getItem("guestName") || "Cliente";

        if (!email) {
          console.log("No email available for confirmation");
          return;
        }

        // Send confirmation email
        const { error } = await supabase.functions.invoke("send-order-email", {
          body: {
            email,
            customerName,
            orderId: sessionId,
            items: items.map((item) => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
            })),
            subtotal,
            shipping: subtotal >= 500 ? 0 : 49.9,
            discount: 0,
            total: subtotal >= 500 ? subtotal : subtotal + 49.9,
          },
        });

        if (error) {
          console.error("Error sending email:", error);
          setEmailError(true);
        } else {
          console.log("Confirmation email sent successfully");
          setEmailSent(true);
        }
      } catch (error) {
        console.error("Failed to send confirmation email:", error);
        setEmailError(true);
      }

      // Clear cart after processing
      clearCart();
      sessionStorage.removeItem("guestEmail");
      sessionStorage.removeItem("guestName");
    };

    sendConfirmationEmail();
  }, [sessionId]);

  return (
    <>
      <Helmet>
        <title>Pedido Confirmado | MedBeauty</title>
      </Helmet>

      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-success/10 animate-scale-in">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>

        <h1 className="mt-8 font-serif text-3xl font-bold text-foreground animate-fade-in-up">
          Pedido Confirmado!
        </h1>
        
        <p className="mt-4 text-lg text-muted-foreground animate-fade-in-up stagger-1">
          Obrigado pela sua compra! Seu pagamento foi processado com sucesso.
        </p>

        {emailSent && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-success animate-fade-in-up">
            <Mail className="h-4 w-4" />
            E-mail de confirmação enviado!
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border bg-card p-6 text-left animate-fade-in-up stagger-2">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="font-semibold text-foreground">Próximos passos</h2>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">1</span>
              Você receberá um e-mail de confirmação com os detalhes do pedido
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">2</span>
              Seu pedido será preparado e enviado em até 2 dias úteis
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">3</span>
              Você receberá o código de rastreamento por e-mail
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center animate-fade-in-up stagger-3">
          <Button asChild size="lg" className="gap-2">
            <Link to="/produtos">
              Continuar Comprando
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
