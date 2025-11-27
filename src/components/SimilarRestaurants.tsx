import { useEffect, useState } from 'react';
import { getSimilarRestaurants } from '@/lib/database';
import type { DatabaseRestaurant } from '@/lib/database';
import RestaurantCard from './RestaurantCard';
import { Skeleton } from './ui/skeleton';

interface SimilarRestaurantsProps {
  restaurantId: string;
  lat: number;
  lon: number;
  cuisine: string | null;
  priceRange: number | null;
}

export const SimilarRestaurants = ({ 
  restaurantId, 
  lat, 
  lon, 
  cuisine, 
  priceRange 
}: SimilarRestaurantsProps) => {
  const [restaurants, setRestaurants] = useState<DatabaseRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      setIsLoading(true);
      try {
        const data = await getSimilarRestaurants(
          restaurantId,
          lat,
          lon,
          cuisine,
          priceRange
        );
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching similar restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [restaurantId, lat, lon, cuisine, priceRange]);

  if (isLoading) {
    return (
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Vergelijkbare restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Vergelijkbare restaurants</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            placeId={restaurant.place_id}
            name={restaurant.name}
            displayName={restaurant.display_name}
            lat={restaurant.lat}
            lon={restaurant.lon}
            type={restaurant.type || 'restaurant'}
            citySlug={restaurant.city?.slug || ''}
            provinceSlug={restaurant.city?.province?.slug || ''}
            cuisine={restaurant.cuisine}
            distance={(restaurant as any).distance}
          />
        ))}
      </div>
    </section>
  );
};
