import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

interface RestaurantCardProps {
  placeId: number;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  onViewOnMap: () => void;
}

const RestaurantCard = ({ placeId, name, displayName, lat, lon, type, onViewOnMap }: RestaurantCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang } = useParams();

  const handleViewDetails = () => {
    navigate(`/${lang}/restaurant/${placeId}`, {
      state: {
        placeId,
        name,
        displayName,
        lat,
        lon,
        type,
      }
    });
  };

  // Extract city name from display_name
  const getCityName = () => {
    const parts = displayName.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return parts[parts.length - 3] || parts[parts.length - 2] || "";
    }
    return "";
  };

  const cityName = getCityName();

  const handleViewCity = () => {
    if (cityName) {
      navigate(`/${lang}/city/${encodeURIComponent(cityName)}`);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="line-clamp-2">{name}</span>
        </CardTitle>
        <CardDescription className="flex items-start gap-2">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{displayName}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t("card.coordinates")}:</span>
            <span>{lat.toFixed(4)}, {lon.toFixed(4)}</span>
          </div>
          {cityName && (
            <Button
              onClick={handleViewCity}
              variant="link"
              className="h-auto p-0 text-sm text-primary"
            >
              <Building2 className="h-3 w-3 mr-1" />
              Meer restaurants in {cityName}
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onViewOnMap} variant="outline" className="flex-1">
          <MapPin className="h-4 w-4 mr-2" />
          {t("card.viewOnMap")}
        </Button>
        <Button onClick={handleViewDetails} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          {t("card.viewDetails")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RestaurantCard;
