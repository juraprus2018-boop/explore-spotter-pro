import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Trash2, Edit2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

interface ReviewSectionProps {
  restaurantId: string;
  restaurantName: string;
}

const ReviewSection = ({ restaurantId, restaurantName }: ReviewSectionProps) => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [editingReview, setEditingReview] = useState<string | null>(null);

  useEffect(() => {
    // Check auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails for reviews
      const reviewsWithEmails = await Promise.all(
        (data || []).map(async (review) => {
          const { data: userData } = await supabase.auth.admin.getUserById(review.user_id);
          return {
            ...review,
            user_email: userData?.user?.email || "Gebruiker",
          };
        })
      );

      setReviews(reviewsWithEmails);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Log in vereist",
        description: "Je moet ingelogd zijn om een review achter te laten.",
        variant: "destructive",
      });
      navigate(`/${lang}/auth`);
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating vereist",
        description: "Geef een rating tussen 1 en 5 sterren.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingReview);

        if (error) throw error;

        toast({
          title: "Review bijgewerkt",
          description: "Je review is succesvol aangepast.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            restaurant_id: restaurantId,
            rating,
            comment: comment.trim() || null,
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Review bestaat al",
              description: "Je hebt al een review geplaatst voor dit restaurant.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          toast({
            title: "Review geplaatst!",
            description: "Bedankt voor je review.",
          });
        }
      }

      // Reset form
      setRating(0);
      setComment("");
      setEditingReview(null);
      await fetchReviews();
    } catch (error: any) {
      toast({
        title: "Fout bij plaatsen review",
        description: error.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setRating(review.rating);
    setComment(review.comment || "");
    setEditingReview(review.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Weet je zeker dat je deze review wilt verwijderen?")) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review verwijderd",
        description: "Je review is succesvol verwijderd.",
      });
      
      await fetchReviews();
    } catch (error: any) {
      toast({
        title: "Fout bij verwijderen",
        description: error.message || "Er is iets misgegaan.",
        variant: "destructive",
      });
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            Reviews ({reviews.length})
          </CardTitle>
          <CardDescription>
            {reviews.length > 0 ? (
              <>
                Gemiddelde beoordeling: {averageRating.toFixed(1)} / 5.0
              </>
            ) : (
              "Nog geen reviews. Wees de eerste!"
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Review Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingReview ? "Review bewerken" : "Schrijf een review"}
          </CardTitle>
          <CardDescription>
            Deel je ervaring bij {restaurantName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <div className="flex gap-2">
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
              <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Jouw review (optioneel)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Vertel over je ervaring..."
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length} / 500 karakters
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || rating === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Bezig...
                  </>
                ) : editingReview ? (
                  "Review bijwerken"
                ) : (
                  "Review plaatsen"
                )}
              </Button>
              
              {editingReview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingReview(null);
                    setRating(0);
                    setComment("");
                  }}
                  disabled={isSubmitting}
                >
                  Annuleren
                </Button>
              )}
            </div>

            {!user && (
              <p className="text-sm text-muted-foreground">
                Je moet{" "}
                <button
                  type="button"
                  onClick={() => navigate(`/${lang}/auth`)}
                  className="text-primary hover:underline"
                >
                  ingelogd zijn
                </button>{" "}
                om een review te plaatsen.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
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
                      <span className="text-sm text-muted-foreground">
                        door {review.user_email?.split('@')[0]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {format(new Date(review.created_at), "d MMMM yyyy", { locale: nl })}
                    </p>
                    {review.comment && (
                      <p className="text-sm mt-2">{review.comment}</p>
                    )}
                  </div>

                  {user && user.id === review.user_id && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditReview(review)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Nog geen reviews. Wees de eerste die een review plaatst!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewSection;
