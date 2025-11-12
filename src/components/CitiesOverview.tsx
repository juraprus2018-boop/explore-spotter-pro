import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAllCities } from "@/lib/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";

const CitiesOverview = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();

  useEffect(() => {
    const loadCities = async () => {
      setIsLoading(true);
      const data = await getAllCities();
      setCities(data.slice(0, 12)); // Show top 12 cities
      setIsLoading(false);
    };

    loadCities();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Populaire steden
          </CardTitle>
          <CardDescription>Ontdek restaurants per stad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cities.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Populaire steden
        </CardTitle>
        <CardDescription>Ontdek restaurants per stad</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {cities.map((city) => (
            <Button
              key={city}
              variant="outline"
              className="h-auto py-3 px-4 justify-start"
              onClick={() => navigate(`/${lang}/city/${encodeURIComponent(city)}`)}
            >
              <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{city}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CitiesOverview;
