import { Card, CardContent } from "@/components/ui/card";
import { ChefHat, MapPin, Star, Utensils } from "lucide-react";
import { DatabaseRestaurant } from "@/lib/database";

interface CityStatsProps {
  restaurants: DatabaseRestaurant[];
}

const CityStats = ({ restaurants }: CityStatsProps) => {
  // Calculate stats
  const totalRestaurants = restaurants.length;
  
  const uniqueCuisines = Array.from(
    new Set(
      restaurants
        .map(r => (r as any).cuisine)
        .filter(c => c && c !== null)
    )
  ).length;

  const facilitiesCount = restaurants.filter(r => {
    const rest = r as any;
    return rest.wheelchair === "yes" || 
           rest.outdoor_seating === "yes" || 
           rest.takeaway === "yes" || 
           rest.delivery === "yes";
  }).length;

  const priceRangeDistribution = restaurants.reduce((acc, r) => {
    const priceRange = (r as any).price_range;
    if (priceRange) {
      acc[priceRange] = (acc[priceRange] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const mostCommonPriceRange = Object.entries(priceRangeDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  const stats = [
    {
      icon: ChefHat,
      label: "Restaurants",
      value: totalRestaurants.toString(),
      color: "text-primary"
    },
    {
      icon: Utensils,
      label: "Keuken types",
      value: uniqueCuisines.toString(),
      color: "text-orange-500"
    },
    {
      icon: Star,
      label: "Met faciliteiten",
      value: facilitiesCount.toString(),
      color: "text-yellow-500"
    },
    {
      icon: MapPin,
      label: "Prijsklasse",
      value: mostCommonPriceRange ? "€".repeat(parseInt(mostCommonPriceRange)) : "N/A",
      color: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-full bg-primary/10 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CityStats;