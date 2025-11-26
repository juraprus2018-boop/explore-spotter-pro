import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, TrendingUp } from "lucide-react";
import { DatabaseRestaurant } from "@/lib/database";

interface PriceDistributionProps {
  restaurants: DatabaseRestaurant[];
}

const PriceDistribution = ({ restaurants }: PriceDistributionProps) => {
  // Count price ranges
  const priceRangeCounts = restaurants.reduce((acc, r) => {
    const priceRange = (r as any).price_range;
    if (priceRange && priceRange >= 1 && priceRange <= 4) {
      acc[priceRange] = (acc[priceRange] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const totalWithPrices = Object.values(priceRangeCounts).reduce((sum, count) => sum + count, 0);

  if (totalWithPrices === 0) {
    return null;
  }

  const priceRanges = [
    { level: 1, label: 'Budget-vriendelijk', symbol: '€', color: 'text-green-500', bgColor: 'bg-green-500' },
    { level: 2, label: 'Middensegment', symbol: '€€', color: 'text-blue-500', bgColor: 'bg-blue-500' },
    { level: 3, label: 'Luxe', symbol: '€€€', color: 'text-purple-500', bgColor: 'bg-purple-500' },
    { level: 4, label: 'Premium', symbol: '€€€€', color: 'text-amber-500', bgColor: 'bg-amber-500' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Euro className="h-6 w-6 text-primary" />
          Prijsklasse Verdeling
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verdeling van restaurants per prijsklasse
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {priceRanges.map(({ level, label, symbol, color, bgColor }) => {
            const count = priceRangeCounts[level] || 0;
            const percentage = totalWithPrices > 0 ? (count / totalWithPrices) * 100 : 0;
            
            if (count === 0) return null;

            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xl font-bold ${color}`}>{symbol}</span>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} {count === 1 ? 'restaurant' : 'restaurants'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${color}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bgColor} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground text-center">
            {totalWithPrices} van {restaurants.length} restaurants hebben een prijsindicatie
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDistribution;