import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Loader2 } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseRestaurant } from "@/lib/database";

const TrendingRestaurants = () => {
  const [trendingRestaurants, setTrendingRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrendingRestaurants = async () => {
      setIsLoading(true);
      try {
        // Get the date 7 days ago
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get the most viewed restaurant pages from the last week
        const { data: pageViews, error: viewsError } = await supabase
          .from('page_views')
          .select('page_url')
          .gte('created_at', weekAgo.toISOString())
          .like('page_url', '%/%/%/%')  // Match restaurant detail pages (lang/province/city/placeId)
          .order('created_at', { ascending: false });

        if (viewsError) throw viewsError;

        // Count views per restaurant (extract place_id from URL)
        const viewCounts: { [placeId: string]: number } = {};
        pageViews?.forEach((view) => {
          // Extract place_id from URL pattern: /lang/province/city/placeId
          const parts = view.page_url.split('/').filter(p => p);
          if (parts.length >= 4) {
            const placeId = parts[3]; // Get the placeId
            if (placeId && !isNaN(Number(placeId))) {
              viewCounts[placeId] = (viewCounts[placeId] || 0) + 1;
            }
          }
        });

        // Sort by view count and get top 6
        const topPlaceIds = Object.entries(viewCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([placeId]) => Number(placeId));

        if (topPlaceIds.length === 0) {
          setIsLoading(false);
          return;
        }

        // Fetch restaurant details
        const { data: restaurants, error: restaurantsError } = await supabase
          .from('restaurants')
          .select(`
            *,
            city:cities (
              id,
              name,
              slug,
              province_id,
              created_at,
              province:provinces (
                id,
                name,
                slug,
                country_id,
                created_at
              )
            )
          `)
          .in('place_id', topPlaceIds)
          .eq('status', 'approved');

        if (restaurantsError) throw restaurantsError;

        // Sort restaurants by their view count
        const sortedRestaurants = (restaurants || []).sort((a, b) => {
          const aViews = viewCounts[a.place_id.toString()] || 0;
          const bViews = viewCounts[b.place_id.toString()] || 0;
          return bViews - aViews;
        });

        setTrendingRestaurants(sortedRestaurants as any as DatabaseRestaurant[]);
      } catch (error) {
        console.error("Error loading trending restaurants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingRestaurants();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (trendingRestaurants.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          Trending Deze Week
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          De meest bekeken restaurants van de afgelopen 7 dagen
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingRestaurants.map((restaurant, index) => (
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
                cuisine={(restaurant as any).cuisine}
                openingHours={(restaurant as any).opening_hours}
                facilities={{
                  wheelchair: (restaurant as any).wheelchair,
                  outdoor_seating: (restaurant as any).outdoor_seating,
                  takeaway: (restaurant as any).takeaway,
                  delivery: (restaurant as any).delivery,
                }}
              />
              {index < 3 && (
                <div className="absolute top-2 left-2 bg-gradient-to-r from-primary to-primary/70 text-primary-foreground px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold shadow-lg">
                  <TrendingUp className="h-3 w-3" />
                  #{index + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingRestaurants;
