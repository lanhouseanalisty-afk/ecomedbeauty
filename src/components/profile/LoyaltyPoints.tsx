import { useState, useEffect } from "react";
import {
  Award,
  Gift,
  TrendingUp,
  History,
  Loader2,
  Star,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

interface LoyaltyPointsProps {
  userId: string;
}

interface PointsBalance {
  balance: number;
  total_earned: number;
  total_redeemed: number;
}

interface PointsTransaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  created_at: string;
}

const POINTS_PER_REAL = 1; // 1 ponto por R$1
const LEVELS = [
  { name: "Bronze", minPoints: 0, maxPoints: 500, color: "bg-amber-600" },
  { name: "Prata", minPoints: 500, maxPoints: 1500, color: "bg-gray-400" },
  { name: "Ouro", minPoints: 1500, maxPoints: 3000, color: "bg-yellow-500" },
  { name: "Platina", minPoints: 3000, maxPoints: 5000, color: "bg-cyan-400" },
  { name: "Diamante", minPoints: 5000, maxPoints: Infinity, color: "bg-purple-500" },
];

export function LoyaltyPoints({ userId }: LoyaltyPointsProps) {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPointsData();
  }, [userId]);

  const fetchPointsData = async () => {
    try {
      // Fetch balance
      const { data: balanceData, error: balanceError } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (balanceError) throw balanceError;

      if (balanceData) {
        setBalance({
          balance: balanceData.balance,
          total_earned: balanceData.total_earned,
          total_redeemed: balanceData.total_redeemed,
        });
      } else {
        setBalance({
          balance: 0,
          total_earned: 0,
          total_redeemed: 0,
        });
      }

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      setTransactions(transactionsData || []);
    } catch (error) {
      console.error("Error fetching points data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    const totalEarned = balance?.total_earned || 0;
    return LEVELS.find(
      (level) => totalEarned >= level.minPoints && totalEarned < level.maxPoints
    ) || LEVELS[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentIndex = LEVELS.indexOf(currentLevel);
    return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
  };

  const getLevelProgress = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;

    const totalEarned = balance?.total_earned || 0;
    const progressInLevel = totalEarned - currentLevel.minPoints;
    const levelRange = nextLevel.minPoints - currentLevel.minPoints;
    return Math.min((progressInLevel / levelRange) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      earned: "Pontos ganhos",
      redeemed: "Pontos resgatados",
      expired: "Pontos expirados",
      bonus: "Bônus",
    };
    return labels[type] || type;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "earned":
      case "bonus":
        return "text-green-600";
      case "redeemed":
      case "expired":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const levelProgress = getLevelProgress();

  return (
    <div className="space-y-6">
      {/* Points Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Programa de Fidelidade
          </CardTitle>
          <CardDescription>
            Acumule pontos a cada compra e troque por descontos exclusivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Level */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${currentLevel.color}`}>
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nível Atual</p>
                <p className="text-xl font-bold">{currentLevel.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Saldo Disponível</p>
              <p className="text-3xl font-bold text-primary">
                {balance?.balance || 0}
              </p>
              <p className="text-xs text-muted-foreground">pontos</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para {nextLevel.name}</span>
                <span>
                  {balance?.total_earned || 0} / {nextLevel.minPoints} pontos
                </span>
              </div>
              <Progress value={levelProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Faltam {Math.max(0, nextLevel.minPoints - (balance?.total_earned || 0))} pontos para o próximo nível
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total Acumulado</span>
              </div>
              <p className="text-2xl font-bold">{balance?.total_earned || 0}</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Gift className="h-4 w-4" />
                <span className="text-sm">Total Resgatado</span>
              </div>
              <p className="text-2xl font-bold">{balance?.total_redeemed || 0}</p>
            </div>
          </div>

          {/* How it works */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-medium mb-2">Como funciona:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ganhe {POINTS_PER_REAL} ponto a cada R$1 em compras</li>
              <li>• Troque seus pontos por descontos no checkout</li>
              <li>• Quanto mais pontos, maior seu nível e benefícios</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma transação ainda. Faça sua primeira compra para começar a acumular pontos!
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {getTransactionTypeLabel(transaction.type)}
                    </p>
                    {transaction.description && (
                      <p className="text-xs text-muted-foreground">
                        {transaction.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={getTransactionColor(transaction.type)}
                  >
                    {transaction.points > 0 ? "+" : ""}
                    {transaction.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
