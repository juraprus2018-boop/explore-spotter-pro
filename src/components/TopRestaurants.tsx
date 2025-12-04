import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Loader2 } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import { getTopRatedRestaurantsByCity, DatabaseRestaurant } from "@/lib/database";

interface TopRestaurantsProps {
  citySlug: string;
  provinceSlug: string;
}

const TopRestaurants = ({ citySlug, provinceSlug }: TopRestaurantsProps) => {
  const [topRestaurants, setTopRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopRestaurants = async () => {
      setIsLoading(true);
      try {
        const restaurants = await getTopRatedRestaurantsByCity(citySlug, 3);
        setTopRestaurants(restaurants);
      } catch (error) {
        console.error("Error loading top restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopRestaurants();
  }, [citySlug]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (topRestaurants.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Top Gewaardeerde Restaurants
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          De best beoordeelde restaurants in deze stad
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRestaurants.map((restaurant) => (
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
              {(restaurant as any).avgRating && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
                  <Star className="h-3 w-3 fill-current" />
                  {(restaurant as any).avgRating.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopRestaurants;