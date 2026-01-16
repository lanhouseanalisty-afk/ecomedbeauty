import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, CreditCard, Lock, Ticket, Award } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CouponInput, AppliedCoupon } from "@/components/cart/CouponInput";
import { PointsRedemption } from "@/components/checkout/PointsRedemption";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Checkout() {
  const { items, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const shippingCost = totalPrice >= 500 ? 0 : 25;

  // Calculate coupon discount
  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      return (totalPrice * appliedCoupon.discount_value) / 100;
    }
    return Math.min(appliedCoupon.discount_value, totalPrice);
  };

  const couponDiscount = calculateCouponDiscount();
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + shippingCost);

  const handlePointsApplied = (points: number, discount: number) => {
    setAppliedPoints(points);
    setPointsDiscount(discount);
  };

  const handleCheckout = async () => {
    if (!email) {
      toast.error("Por favor, informe seu e-mail");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare items for checkout (includes SAP item codes)
      const checkoutItems = items.map((item) => ({
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        itemCode: item.product.id, // SAP ItemCode
      }));

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: checkoutItems,
          email,
          couponId: appliedCoupon?.id,
          discount: totalDiscount,
          pointsUsed: appliedPoints,
          // SAP order data will be created after payment success via webhook
          sapOrderData: {
            email,
            items: checkoutItems.map((item) => ({
              itemCode: item.itemCode,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate("/carrinho");
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout | MedBeauty</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {/* Back */}
        <Link
          to="/carrinho"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao carrinho
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
          Finalizar Compra
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="space-y-6">
            {/* Email */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Informações de Contato
              </h2>
              <div className="mt-4">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="mt-1"
                  required
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Você receberá a confirmação do pedido neste e-mail
                </p>
              </div>
            </div>

            {/* Coupon */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Cupom de Desconto
                </h2>
              </div>
              <CouponInput
                cartTotal={totalPrice}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={setAppliedCoupon}
              />
            </div>

            {/* Points Redemption */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Pontos de Fidelidade
                </h2>
              </div>
              <PointsRedemption
                cartTotal={totalPrice - couponDiscount}
                onPointsApplied={handlePointsApplied}
                appliedPoints={appliedPoints}
              />
            </div>

            {/* Stripe info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Pagamento Seguro</h3>
                  <p className="text-sm text-muted-foreground">
                    Processado pelo Stripe
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Ao clicar em "Pagar com Stripe", você será redirecionado para uma página segura do Stripe para completar o pagamento.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                Seus dados estão protegidos com criptografia SSL
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <Checkbox id="terms" required className="mt-1" />
              <Label htmlFor="terms" className="text-sm text-muted-foreground">
                Li e concordo com os{" "}
                <Link to="/termos" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link to="/privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Resumo do Pedido
            </h2>

            <div className="mt-6 divide-y divide-border">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 py-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-border pt-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} itens)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    Cupom ({appliedCoupon?.code})
                  </span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Pontos ({appliedPoints} pts)
                  </span>
                  <span>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Frete</span>
                <span className={shippingCost === 0 ? "text-green-600" : ""}>
                  {shippingCost === 0 ? "Grátis" : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-foreground">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="mt-6 w-full gap-2"
              size="lg"
              disabled={isProcessing}
            >
              <CreditCard className="h-5 w-5" />
              {isProcessing ? "Processando..." : "Pagar com Stripe"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
