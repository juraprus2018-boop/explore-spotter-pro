import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { OpenStatusBadge } from "./OpenStatusBadge";

interface RestaurantCardProps {
  placeId: number;
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  citySlug: string;
  provinceSlug: string;
  onViewOnMap?: () => void;
  cuisine?: string | null;
  distance?: number; // Distance in meters
  facilities?: {
    wheelchair?: string;
    outdoor_seating?: string;
    takeaway?: string;
    delivery?: string;
  };
  openingHours?: any;
}

const RestaurantCard = ({
  placeId,
  name,
  displayName,
  type,
  citySlug,
  provinceSlug,
  onViewOnMap,
  cuisine,
  distance,
  facilities,
  openingHours,
}: RestaurantCardProps) => {
  const { lang } = useParams();
  const navigate = useNavigate();

  const handleCardClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/${lang}/${provinceSlug}/${citySlug}/${placeId}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {name}
              </CardTitle>
              <OpenStatusBadge openingHours={openingHours} size="sm" />
            </div>
            {cuisine && (
              <p className="text-sm text-muted-foreground capitalize mb-1">
                {cuisine.replace(/_/g, ' ')}
              </p>
            )}
            <CardDescription className="text-sm">
              {displayName.split(",").slice(1, 3).join(",")}
            </CardDescription>
            {distance !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                📍 {distance < 1000 
                  ? `${Math.round(distance)} m` 
                  : `${(distance / 1000).toFixed(1)} km`
                }
              </p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {facilities && (Object.values(facilities).some(v => v === 'yes')) && (
          <div className="flex flex-wrap gap-1.5">
            {facilities.wheelchair === 'yes' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary" title="Rolstoeltoegankelijk">
                ♿
              </span>
            )}
            {facilities.outdoor_seating === 'yes' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary" title="Terras">
                🌤️
              </span>
            )}
            {facilities.takeaway === 'yes' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary" title="Afhalen">
                🥡
              </span>
            )}
            {facilities.delivery === 'yes' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary" title="Bezorgen">
                🚚
              </span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={handleCardClick}
          >
            Meer info
          </Button>
          {onViewOnMap && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewOnMap();
              }}
            >
              <MapPin className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
