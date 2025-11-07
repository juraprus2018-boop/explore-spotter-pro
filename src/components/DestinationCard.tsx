import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DestinationCardProps {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  onViewOnMap: () => void;
}

const DestinationCard = ({ 
  name, 
  displayName, 
  lat, 
  lon, 
  type,
  onViewOnMap 
}: DestinationCardProps) => {
  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      city: "Stad",
      town: "Plaats",
      village: "Dorp",
      country: "Land",
      state: "Provincie",
      administrative: "Administratief",
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {getTypeLabel(type)}
              </span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {displayName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono">
              {lat.toFixed(4)}, {lon.toFixed(4)}
            </span>
          </div>
          <Button 
            onClick={onViewOnMap}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Bekijk op Kaart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationCard;
