import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Sparkles } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import { DatabaseRestaurant } from "@/lib/database";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const RecentlyAddedRestaurants = () => {
  const [recentRestaurants, setRecentRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentRestaurants = async () => {
      try {
        // Get restaurants added in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabase
          .from("restaurants")
          .select(`
            *,
            city:cities (
              *,
              province:provinces (
                *
              )
            )
          `)
          .gte("created_at", thirtyDaysAgo.toISOString())
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        setRecentRestaurants(data || []);
      } catch (error) {
        console.error("Error fetching recent restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentRestaurants();
  }, []);

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

  if (isLoading || recentRestaurants.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          Recent Toegevoegd
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nieuw ontdekte restaurants op het platform
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentRestaurants.map((restaurant) => (
            <div key={restaurant.place_id} className="relative">
              <RestaurantCard
                placeId={restaurant.place_id}
                name={restaurant.name}
                displayName={restaurant.display_name}
                lat={restaurant.lat}
                lon={restaurant.lon}
                type={restaurant.type || "restaurant"}
                citySlug={restaurant.city?.slug || "unknown"}
                provinceSlug={restaurant.city?.province?.slug || "unknown"}
                cuisine={restaurant.cuisine}
                facilities={{
                  wheelchair: restaurant.wheelchair,
                  outdoor_seating: restaurant.outdoor_seating,
                  takeaway: restaurant.takeaway,
                  delivery: restaurant.delivery,
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

export default RecentlyAddedRestaurants;
