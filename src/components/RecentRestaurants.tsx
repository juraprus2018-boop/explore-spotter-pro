import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Sparkles } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import { DatabaseRestaurant } from "@/lib/database";
import { Badge } from "@/components/ui/badge";

interface RecentRestaurantsProps {
  restaurants: DatabaseRestaurant[];
  citySlug: string;
  provinceSlug: string;
}

const RecentRestaurants = ({ restaurants, citySlug, provinceSlug }: RecentRestaurantsProps) => {
  // Get restaurants added in the last 30 days, sorted by creation date
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRestaurants = restaurants
    .filter(r => {
      const createdAt = new Date(r.created_at || '');
      return createdAt >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at || '');
      const dateB = new Date(b.created_at || '');
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 3);

  if (recentRestaurants.length === 0) {
    return null;
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Vandaag toegevoegd";
    if (diffDays === 1) return "Gisteren toegevoegd";
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 14) return "1 week geleden";
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return "Recent toegevoegd";
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          Recent Toegevoegd
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nieuw ontdekte restaurants in deze stad
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentRestaurants.map((restaurant) => (
            <div key={restaurant.place_id} className="relative">
              <RestaurantCard
                placeId={restaurant.place_id}
                name={restaurant.name}
                displayName={restaurant.display_name}
                lat={restaurant.lat}
                lon={restaurant.lon}
                type={restaurant.type || "restaurant"}
                citySlug={citySlug}
                provinceSlug={provinceSlug}
                cuisine={(restaurant as any).cuisine}
                openingHours={(restaurant as any).opening_hours}
                photos={(restaurant as any).photos || []}
                facilities={{
                  wheelchair: (restaurant as any).wheelchair,
                  outdoor_seating: (restaurant as any).outdoor_seating,
                  takeaway: (restaurant as any).takeaway,
                  delivery: (restaurant as any).delivery,
                }}
              />
              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground shadow-lg">
                <Clock className="h-3 w-3 mr-1" />
                {getDaysAgo(restaurant.created_at || '')}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentRestaurants;