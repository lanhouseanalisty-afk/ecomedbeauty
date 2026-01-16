import { useState, useEffect } from "react";
import { Award, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PointsRedemptionProps {
  cartTotal: number;
  onPointsApplied: (pointsUsed: number, discountAmount: number) => void;
  appliedPoints: number;
}

const POINTS_VALUE = 0.10; // Each point is worth R$0.10

export function PointsRedemption({ cartTotal, onPointsApplied, appliedPoints }: PointsRedemptionProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [pointsToUse, setPointsToUse] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from("loyalty_points")
        .select("balance")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setBalance(data?.balance || 0);
    } catch (error) {
      console.error("Error fetching points balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxPointsToUse = Math.min(
    balance,
    Math.floor(cartTotal / POINTS_VALUE) // Can't use more points than the cart value
  );

  const calculateDiscount = (points: number) => {
    return points * POINTS_VALUE;
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointsToUse) || 0;
    if (points <= 0 || points > maxPointsToUse) return;

    setApplying(true);
    const discount = calculateDiscount(points);
    onPointsApplied(points, discount);
    setApplying(false);
  };

  const handleRemovePoints = () => {
    setPointsToUse("");
    onPointsApplied(0, 0);
  };

  const handleUseMax = () => {
    setPointsToUse(maxPointsToUse.toString());
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (balance === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-5 w-5" />
            <p className="text-sm">Você ainda não tem pontos de fidelidade</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-medium">Usar Pontos de Fidelidade</span>
          </div>
          <span className="text-sm text-muted-foreground">
            Saldo: <span className="font-semibold text-primary">{balance} pts</span>
          </span>
        </div>

        {appliedPoints > 0 ? (
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm">
                {appliedPoints} pontos aplicados (-R$ {calculateDiscount(appliedPoints).toFixed(2)})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePoints}
              className="text-destructive hover:text-destructive"
            >
              Remover
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Quantidade de pontos"
                value={pointsToUse}
                onChange={(e) => setPointsToUse(e.target.value)}
                min={0}
                max={maxPointsToUse}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseMax}
                className="shrink-0"
              >
                Usar máx.
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Máximo utilizável: {maxPointsToUse} pts (R$ {calculateDiscount(maxPointsToUse).toFixed(2)})
              </span>
              <Button
                onClick={handleApplyPoints}
                disabled={!pointsToUse || parseInt(pointsToUse) <= 0 || parseInt(pointsToUse) > maxPointsToUse || applying}
                size="sm"
              >
                Aplicar
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Cada ponto vale R$ {POINTS_VALUE.toFixed(2)}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
