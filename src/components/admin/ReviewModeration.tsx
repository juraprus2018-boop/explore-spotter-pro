import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Review {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  rating: number;
  comment: string | null;
  status: string;
  created_at: string;
  moderated_at: string | null;
  moderation_note: string | null;
  photos: string[] | null;
  restaurants: {
    name: string;
  };
}

const ReviewModeration = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [moderatingId, setModeratingId] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchReviews();
  }, [activeTab]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          restaurants (
            name
          )
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Fout bij ophalen",
        description: "Kon reviews niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    setModeratingId(reviewId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('reviews')
        .update({
          status: newStatus,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_note: moderationNote || null,
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: newStatus === 'approved' ? "Review goedgekeurd" : "Review afgewezen",
        description: "De status is bijgewerkt",
      });

      setModerationNote("");
      fetchReviews();
    } catch (error: any) {
      console.error('Error moderating review:', error);
      toast({
        title: "Fout bij modereren",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setModeratingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Goedgekeurd</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Afgewezen</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In behandeling</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">In behandeling</TabsTrigger>
          <TabsTrigger value="approved">Goedgekeurd</TabsTrigger>
          <TabsTrigger value="rejected">Afgewezen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Geen reviews in deze categorie
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {review.restaurants?.name || "Onbekend restaurant"}
                      </CardTitle>
                      <CardDescription>
                        {format(new Date(review.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
                      </CardDescription>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <p className="text-sm">{review.comment}</p>
                  )}

                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
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

                  {activeTab === 'pending' && (
                    <div className="space-y-3 pt-3 border-t">
                      <Textarea
                        placeholder="Optionele notitie (bijv. reden voor afwijzing)"
                        value={moderationNote}
                        onChange={(e) => setModerationNote(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModerate(review.id, 'approved')}
                          disabled={moderatingId === review.id}
                          className="flex-1"
                        >
                          {moderatingId === review.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Goedkeuren
                        </Button>
                        <Button
                          onClick={() => handleModerate(review.id, 'rejected')}
                          disabled={moderatingId === review.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          {moderatingId === review.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Afwijzen
                        </Button>
                      </div>
                    </div>
                  )}

                  {review.moderation_note && (
                    <div className="text-sm text-muted-foreground pt-3 border-t">
                      <strong>Moderatie notitie:</strong> {review.moderation_note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReviewModeration;
