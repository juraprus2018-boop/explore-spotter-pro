import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, TrendingUp } from "lucide-react";
import { DatabaseRestaurant } from "@/lib/database";
import { Badge } from "@/components/ui/badge";

interface PopularCuisinesProps {
  restaurants: DatabaseRestaurant[];
}

const PopularCuisines = ({ restaurants }: PopularCuisinesProps) => {
  // Count cuisines
  const cuisineCounts = restaurants.reduce((acc, r) => {
    const cuisine = (r as any).cuisine;
    if (cuisine && cuisine !== null) {
      acc[cuisine] = (acc[cuisine] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Sort by count and get top 6
  const topCuisines = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  if (topCuisines.length === 0) {
    return null;
  }

  const maxCount = topCuisines[0][1];

  const formatCuisineName = (cuisine: string) => {
    return cuisine
      .split(';')[0] // Take only first if multiple
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getCuisineEmoji = (cuisine: string) => {
    const lower = cuisine.toLowerCase();
    if (lower.includes('italian')) return '🍝';
    if (lower.includes('pizza')) return '🍕';
    if (lower.includes('asian') || lower.includes('chinese')) return '🥢';
    if (lower.includes('japanese') || lower.includes('sushi')) return '🍣';
    if (lower.includes('burger')) return '🍔';
    if (lower.includes('french')) return '🥐';
    if (lower.includes('indian')) return '🍛';
    if (lower.includes('mexican')) return '🌮';
    if (lower.includes('thai')) return '🍜';
    if (lower.includes('greek')) return '🥙';
    if (lower.includes('spanish')) return '🥘';
    if (lower.includes('kebab') || lower.includes('turkish')) return '🥙';
    if (lower.includes('seafood') || lower.includes('fish')) return '🐟';
    if (lower.includes('steak')) return '🥩';
    if (lower.includes('vegetarian') || lower.includes('vegan')) return '🥗';
    return '🍽️';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <TrendingUp className="h-6 w-6 text-primary" />
          Populaire Keukens
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          De meest voorkomende keuken types in deze stad
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topCuisines.map(([cuisine, count], index) => {
            const percentage = (count / maxCount) * 100;
            return (
              <div key={cuisine} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCuisineEmoji(cuisine)}</span>
                    <span className="font-medium">{formatCuisineName(cuisine)}</span>
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Populairste
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {count} {count === 1 ? 'restaurant' : 'restaurants'}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularCuisines;