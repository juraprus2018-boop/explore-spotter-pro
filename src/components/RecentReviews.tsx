import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  restaurant_id: string;
  restaurants: {
    name: string;
    display_name: string;
  };
}

const RecentReviews = () => {
  const { lang } = useParams();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('reviews')
        .select('id, rating, comment, created_at, restaurant_id, restaurants!inner(name, display_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-foreground mb-6">
        {t('recentReviews.title', 'Recente Reviews')}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Card key={review.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/${lang}/restaurant/${review.restaurant_id}`}
                    className="hover:text-primary transition-colors"
                  >
                    <CardTitle className="text-lg line-clamp-1">
                      {review.restaurants.name}
                    </CardTitle>
                  </Link>
                  <CardDescription className="text-sm mt-1">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: nl })}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-foreground">{review.rating}</span>
                </div>
              </div>
            </CardHeader>
            {review.comment && (
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">{review.comment}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecentReviews;
