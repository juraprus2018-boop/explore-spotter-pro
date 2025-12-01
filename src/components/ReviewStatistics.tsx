import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Review {
  rating: number;
}

interface ReviewStatisticsProps {
  reviews: Review[];
}

export const ReviewStatistics = ({ reviews }: ReviewStatisticsProps) => {
  if (reviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  // Calculate rating distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  // Calculate percentages
  const ratingPercentages = ratingCounts.map((count) => 
    reviews.length > 0 ? (count / reviews.length) * 100 : 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-primary text-primary" />
          Review Statistieken
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
            <div className="text-5xl font-bold text-foreground mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex mb-2">
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
            <p className="text-sm text-muted-foreground">
              Gebaseerd op {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm mb-4">Rating Verdeling</h3>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <Progress 
                  value={ratingPercentages[rating - 1]} 
                  className="flex-1 h-2"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {ratingCounts[rating - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
