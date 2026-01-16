import { useState, useEffect } from "react";
import { Star, Loader2, Send, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  userName?: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user names for reviews
      const userIds = [...new Set((data || []).map((r) => r.user_id))];
      let namesMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        namesMap = (profiles || []).reduce((acc, p) => {
          acc[p.id] = p.full_name || "Anônimo";
          return acc;
        }, {} as Record<string, string>);
      }

      const reviewsWithNames = (data || []).map((r) => ({
        ...r,
        userName: namesMap[r.user_id] || "Anônimo",
      }));

      setReviews(reviewsWithNames);

      // Check if user already has a review
      if (user) {
        const existing = reviewsWithNames.find((r) => r.user_id === user.id);
        if (existing) {
          setUserReview(existing);
          setRating(existing.rating);
          setComment(existing.comment || "");
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para avaliar este produto.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({ rating, comment: comment || null })
          .eq("id", userReview.id);

        if (error) throw error;

        toast({
          title: "Avaliação atualizada",
          description: "Sua avaliação foi atualizada com sucesso.",
        });
      } else {
        // Create new review
        const { error } = await supabase.from("reviews").insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment || null,
        });

        if (error) throw error;

        toast({
          title: "Avaliação enviada",
          description: "Obrigado por avaliar este produto!",
        });
      }

      fetchReviews();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar sua avaliação.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!userReview) return;

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", userReview.id);

      if (error) throw error;

      setUserReview(null);
      setRating(5);
      setComment("");
      fetchReviews();

      toast({
        title: "Avaliação removida",
        description: "Sua avaliação foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover sua avaliação.",
        variant: "destructive",
      });
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const filteredReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} avaliação{reviews.length !== 1 ? "ões" : ""}
          </p>
        </div>
      </div>

      {/* Write Review Form */}
      <div className="border rounded-lg p-6 bg-card">
        <h3 className="font-semibold text-lg mb-4">
          {userReview ? "Editar sua avaliação" : "Escreva uma avaliação"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Sua nota
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Comentário (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência com este produto..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {userReview ? "Atualizar" : "Enviar"}
            </Button>
            {userReview && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            )}
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground">
              Faça login para avaliar este produto.
            </p>
          )}
        </form>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-semibold text-lg">
            Avaliações dos clientes
          </h3>
          
          {/* Filter by rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Filtrar:</span>
              <button
                onClick={() => setFilterRating(null)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterRating === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                Todas
              </button>
              {ratingCounts.map(({ star, count }) => (
                <button
                  key={star}
                  onClick={() => setFilterRating(star)}
                  disabled={count === 0}
                  className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                    filterRating === star
                      ? "bg-primary text-primary-foreground"
                      : count === 0
                      ? "bg-muted/50 text-muted-foreground cursor-not-allowed"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {star}
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-xs">({count})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {filterRating
              ? `Nenhuma avaliação com ${filterRating} estrela${filterRating !== 1 ? "s" : ""}.`
              : "Ainda não há avaliações para este produto."}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-4 bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(review.userName || "A")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {review.userName}
                        {review.user_id === user?.id && (
                          <span className="ml-2 text-xs text-primary">(Você)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
