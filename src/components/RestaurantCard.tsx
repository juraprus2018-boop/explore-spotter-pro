import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { OpenStatusBadge } from "./OpenStatusBadge";
import { getCuisineImage } from "@/lib/cuisineImages";

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
  distance?: number;
  facilities?: {
    wheelchair?: string;
    outdoor_seating?: string;
    takeaway?: string;
    delivery?: string;
  };
  openingHours?: any;
  photos?: string[];
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
  photos,
}: RestaurantCardProps) => {
  const { lang } = useParams();
  const navigate = useNavigate();

  const handleCardClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/${lang}/${provinceSlug}/${citySlug}/${placeId}`);
  };

  // Use first photo if available, otherwise use cuisine-based image
  const imageUrl = photos && photos.length > 0 ? photos[0] : getCuisineImage(cuisine);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleCardClick}>
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg line-clamp-1 drop-shadow-md">
            {name}
          </h3>
          {cuisine && (
            <p className="text-white/90 text-sm capitalize drop-shadow-md">
              {cuisine.replace(/_/g, ' ')}
            </p>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <OpenStatusBadge openingHours={openingHours} size="sm" />
        </div>
        <Badge variant="secondary" className="absolute top-3 left-3 capitalize bg-background/90">
          {type}
        </Badge>
      </div>

      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {displayName.split(",").slice(1, 3).join(",")}
        </p>
        
        {distance !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {distance < 1000 
              ? `${Math.round(distance)} m` 
              : `${(distance / 1000).toFixed(1)} km`
            }
          </p>
        )}

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

        <div className="flex gap-2 pt-2">
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
