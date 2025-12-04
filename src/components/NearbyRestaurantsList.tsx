import { useEffect, useState } from 'react';
import { getNearbyRestaurants, DatabaseRestaurant } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { getCuisineImage } from '@/lib/cuisineImages';

interface NearbyRestaurantsProps {
  restaurantId: string;
  lat: number;
  lon: number;
}

export const NearbyRestaurantsList = ({ restaurantId, lat, lon }: NearbyRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { lang } = useParams();

  useEffect(() => {
    const fetchNearby = async () => {
      setIsLoading(true);
      const nearby = await getNearbyRestaurants(lat, lon, 15); // 15km radius
      // Filter out the current restaurant
      const filtered = nearby.filter(r => r.id !== restaurantId).slice(0, 4);
      setRestaurants(filtered);
      setIsLoading(false);
    };

    fetchNearby();
  }, [restaurantId, lat, lon]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Restaurants in de buurt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (restaurants.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Restaurants in de buurt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {restaurants.map((restaurant) => {
            const citySlug = restaurant.city?.slug || '';
            const provinceSlug = restaurant.city?.province?.slug || '';
            
            return (
              <NavLink
                key={restaurant.id}
                to={`/${lang}/${provinceSlug}/${citySlug}/${restaurant.place_id}`}
                className="block group"
              >
                <div className="flex items-start gap-4 p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  <img
                    src={restaurant.photos && restaurant.photos.length > 0 
                      ? restaurant.photos[0] 
                      : getCuisineImage(restaurant.cuisine)}
                    alt={restaurant.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {restaurant.cuisine?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((restaurant as any).distance / 1000).toFixed(1)} km
                    </p>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
