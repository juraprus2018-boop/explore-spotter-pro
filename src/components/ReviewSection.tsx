import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Trash2, Edit2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Review {
  id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  photos: string[] | null;
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
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

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
      const { data, error } = await (supabase as any)
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails for reviews that have user_id
      const reviewsWithEmails = await Promise.all(
        (data || []).map(async (review) => {
          if (review.user_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(review.user_id);
            return {
              ...review,
              user_email: userData?.user?.email || "Gebruiker",
            };
          }
          return {
            ...review,
            user_email: "Anonieme gebruiker",
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - uploadedPhotos.length);
    setUploadedPhotos([...uploadedPhotos, ...newFiles]);
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

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
      // Upload photos first
      const photoUrls: string[] = [];
      for (const file of uploadedPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${restaurantId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrl);
      }

      if (editingReview) {
        // Update existing review
        const { error } = await (supabase as any)
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
            photos: photoUrls.length > 0 ? photoUrls : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingReview);

        if (error) throw error;

        toast({
          title: "Review bijgewerkt",
          description: "Je review is succesvol aangepast.",
        });
      } else {
        // Create new review (anonymous or authenticated)
        const { error } = await (supabase as any)
          .from('reviews')
          .insert({
            user_id: user?.id || null,
            restaurant_id: restaurantId,
            rating,
            comment: comment.trim() || null,
            photos: photoUrls.length > 0 ? photoUrls : null,
          });

        if (error) throw error;

        toast({
          title: "Review geplaatst!",
          description: "Bedankt voor je review.",
        });
      }

      // Reset form
      setRating(0);
      setComment("");
      setEditingReview(null);
      setUploadedPhotos([]);
      setPhotoUrls([]);
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
    setPhotoUrls(review.photos || []);
    setEditingReview(review.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Weet je zeker dat je deze review wilt verwijderen?")) return;

    try {
      const { error } = await (supabase as any)
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

            <div>
              <label className="text-sm font-medium mb-2 block">
                Foto's toevoegen (max 5)
              </label>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {uploadedPhotos.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {uploadedPhotos.length < 5 && (
                    <label className="h-20 w-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>
              </div>
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
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Review foto ${idx + 1}`}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
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
