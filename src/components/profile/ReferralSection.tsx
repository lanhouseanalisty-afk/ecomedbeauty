import { useState, useEffect } from "react";
import {
  Users,
  Copy,
  Check,
  Gift,
  Loader2,
  Share2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReferralSectionProps {
  userId: string;
}

interface Referral {
  id: string;
  referred_id: string;
  status: string;
  bonus_points: number;
  created_at: string;
  completed_at: string | null;
}

const BONUS_POINTS = 100;

export function ReferralSection({ userId }: ReferralSectionProps) {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      // Fetch user's referral code
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setReferralCode(profile.referral_code);

      // Fetch referrals made by this user
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData || []);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth?ref=${referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "Compartilhe com seus amigos",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MedBeauty - Ganhe pontos!",
          text: `Use meu código ${referralCode} e ganhe ${BONUS_POINTS} pontos de bônus na sua primeira compra!`,
          url: getReferralLink(),
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completo</Badge>;
      case "pending":
        return <Badge variant="outline">Pendente</Badge>;
      case "expired":
        return <Badge variant="secondary">Expirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const completedReferrals = referrals.filter((r) => r.status === "completed");
  const totalEarned = completedReferrals.reduce((sum, r) => sum + r.bonus_points, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Indique e Ganhe
        </CardTitle>
        <CardDescription>
          Indique amigos e ganhe {BONUS_POINTS} pontos quando eles fizerem a primeira compra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Link */}
        <div className="p-4 bg-primary/5 rounded-lg space-y-3">
          <p className="font-medium text-sm">Seu código de indicação:</p>
          <div className="flex gap-2">
            <Input
              value={referralCode || ""}
              readOnly
              className="font-mono text-lg font-bold text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={shareLink} className="w-full gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar Link
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{completedReferrals.length}</p>
            <p className="text-sm text-muted-foreground">Indicações completas</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{totalEarned}</p>
            <p className="text-sm text-muted-foreground">Pontos ganhos</p>
          </div>
        </div>

        {/* How it works */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="font-medium mb-2 flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            Como funciona:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>1. Compartilhe seu código com amigos</li>
            <li>2. Eles se cadastram usando seu link</li>
            <li>3. Quando fizerem a primeira compra, vocês dois ganham {BONUS_POINTS} pontos!</li>
          </ul>
        </div>

        {/* Referral History */}
        {referrals.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium text-sm">Histórico de Indicações</p>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Indicação #{referral.id.slice(0, 6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(referral.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                    {referral.status === "completed" && (
                      <p className="text-xs text-green-600 mt-1">
                        +{referral.bonus_points} pts
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
