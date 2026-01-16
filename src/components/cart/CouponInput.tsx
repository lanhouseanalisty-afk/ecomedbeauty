import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Tag, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
}

interface CouponInputProps {
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon | null) => void;
}

export function CouponInput({ cartTotal, appliedCoupon, onApplyCoupon }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch coupon from database
      const { data: coupon, error: fetchError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (fetchError || !coupon) {
        setError("Cupom não encontrado ou inválido");
        toast.error("Cupom inválido");
        setIsLoading(false);
        return;
      }

      // Check if coupon has expired
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError("Este cupom já expirou");
        toast.error("Cupom expirado");
        setIsLoading(false);
        return;
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        setError("Este cupom atingiu o limite de uso");
        toast.error("Cupom esgotado");
        setIsLoading(false);
        return;
      }

      // Check minimum order value
      if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
        setError(`Valor mínimo do pedido: R$ ${coupon.min_order_value.toFixed(2)}`);
        toast.error("Valor mínimo não atingido");
        setIsLoading(false);
        return;
      }

      // Coupon is valid
      onApplyCoupon({
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type as "percentage" | "fixed",
        discount_value: coupon.discount_value,
        min_order_value: coupon.min_order_value || 0,
      });
      setCode("");
      toast.success(`Cupom ${coupon.code} aplicado!`);
    } catch (err) {
      console.error("Error validating coupon:", err);
      setError("Erro ao validar cupom");
      toast.error("Erro ao validar cupom");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    onApplyCoupon(null);
    toast.info("Cupom removido");
  };

  const formatDiscount = (coupon: AppliedCoupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}% de desconto`;
    }
    return `R$ ${coupon.discount_value.toFixed(2)} de desconto`;
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-500/50 bg-green-500/10 p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {appliedCoupon.code}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDiscount(appliedCoupon)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Código do cupom"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            className="pl-10"
            maxLength={20}
          />
        </div>
        <Button onClick={handleApply} disabled={isLoading || !code.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
