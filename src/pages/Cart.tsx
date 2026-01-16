import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { CouponInput } from "@/components/cart/CouponInput";
import type { AppliedCoupon } from "@/components/cart/CouponInput";
import { ShippingCalculator } from "@/components/cart/ShippingCalculator";
import { CartRecommendations } from "@/components/cart/CartRecommendations";
import { FreeShippingGoal } from "@/components/cart/FreeShippingGoal";
import { BuyTogether } from "@/components/cart/BuyTogether";

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
}

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (totalPrice * appliedCoupon.discount_value) / 100
      : Math.min(appliedCoupon.discount_value, totalPrice)
    : 0;

  const shippingAmount = selectedShipping?.price || 0;
  const finalTotal = totalPrice - discountAmount + shippingAmount;

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Carrinho | MedBeauty</title>
        </Helmet>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted animate-bounce-subtle">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
            Seu carrinho está vazio
          </h1>
          <p className="mt-2 text-muted-foreground">
            Explore nossos produtos e adicione itens ao seu carrinho.
          </p>
          <Button asChild className="mt-8 gap-2">
            <Link to="/produtos">
              Ver Produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Carrinho (${totalItems}) | MedBeauty`}</title>
        <meta
          name="description"
          content="Revise seu carrinho, aplique cupons e calcule o frete para finalizar sua compra na MedBeauty."
        />
        <link rel="canonical" href="https://medbeauty.com.br/carrinho" />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Carrinho de Compras
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div
                key={item.product.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4 sm:p-6 animate-fade-in-up opacity-0 hover-lift"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <Link
                  to={`/produto/${item.product.id}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32 img-zoom"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link
                      to={`/produto/${item.product.id}`}
                      className="font-serif text-lg font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.product.category}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Quantity */}
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price & Remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buy Together */}
          <div className="lg:col-span-2">
            <BuyTogether cartItems={items} discountPercent={10} />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Free Shipping Goal */}
          <div className="lg:col-span-2">
            <FreeShippingGoal cartTotal={totalPrice} threshold={500} />
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Shipping Calculator */}
            <div className="rounded-xl border border-border bg-card p-6">
              <ShippingCalculator
                cartTotal={totalPrice}
                onSelectShipping={setSelectedShipping}
                selectedOption={selectedShipping as any}
              />
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Resumo do Pedido
              </h2>

              {/* Coupon */}
              <div className="mt-6">
                <CouponInput
                  cartTotal={totalPrice}
                  appliedCoupon={appliedCoupon}
                  onApplyCoupon={setAppliedCoupon}
                />
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Desconto</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Frete</span>
                  <span className={shippingAmount === 0 ? "text-success" : ""}>
                    {selectedShipping
                      ? shippingAmount === 0
                        ? "Grátis"
                        : formatPrice(shippingAmount)
                      : "Calcule acima"}
                  </span>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <Button asChild className="mt-6 w-full gap-2">
                <Link to="/checkout">
                  Finalizar Compra
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="mt-3 w-full">
                <Link to="/produtos">Continuar Comprando</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {/* Recommendations Carousel */}
        <CartRecommendations cartItems={items} maxItems={8} />
      </div>
    </>
  );
}
