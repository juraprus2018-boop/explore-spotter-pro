import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, Car, Footprints, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RouteNavigationProps {
  destinationLat: number;
  destinationLon: number;
  destinationName: string;
}

type TravelMode = "walking" | "driving";

interface RouteData {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to fit map bounds
function FitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

const RouteNavigation = ({ destinationLat, destinationLon, destinationName }: RouteNavigationProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "error">("loading");
  const { toast } = useToast();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast({
        title: "Locatie niet beschikbaar",
        description: "Je browser ondersteunt geen locatiedeling.",
        variant: "destructive",
      });
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationStatus("ready");
      },
      (error) => {
        console.log("Geolocation error:", error);
        setLocationStatus("error");
        toast({
          title: "Locatie niet beschikbaar",
          description: "Geef toestemming voor locatietoegang om navigatie te gebruiken.",
          variant: "destructive",
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }, [toast]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fetchRoute = async () => {
    if (!userLocation) {
      toast({
        title: "Locatie vereist",
        description: "We hebben je locatie nodig om een route te berekenen.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingRoute(true);
    try {
      // OSRM API - completely free, no API key required
      const profile = travelMode === "driving" ? "car" : "foot";
      const url = `https://router.project-osrm.org/route/v1/${profile}/${userLocation[1]},${userLocation[0]};${destinationLon},${destinationLat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] // Convert [lon, lat] to [lat, lon]
        );

        setRouteData({
          distance: route.distance,
          duration: route.duration,
          coordinates,
        });
        setShowRoute(true);

        toast({
          title: "Route berekend",
          description: `${formatDistance(route.distance)} - ${formatDuration(route.duration)}`,
        });
      } else {
        toast({
          title: "Route niet gevonden",
          description: "Kan geen route berekenen naar deze locatie.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({
        title: "Fout bij routeberekening",
        description: "Er is een probleem opgetreden bij het berekenen van de route.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} u ${remainingMinutes} min`;
  };

  if (locationStatus !== "ready") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigatie
          </CardTitle>
          <CardDescription>
            Route naar {destinationName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {locationStatus === "loading" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Locatie ophalen...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Locatie kan niet worden opgehaald. Sta locatietoegang toe in je browser of gebruik een van de opties hieronder.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={requestLocation} variant="outline" className="flex-1">
                  Opnieuw proberen
                </Button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}&travelmode=${travelMode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button className="w-full">Open in Google Maps</Button>
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const bounds: [[number, number], [number, number]] = routeData
    ? [
        [
          Math.min(...routeData.coordinates.map(c => c[0])),
          Math.min(...routeData.coordinates.map(c => c[1])),
        ],
        [
          Math.max(...routeData.coordinates.map(c => c[0])),
          Math.max(...routeData.coordinates.map(c => c[1])),
        ],
      ]
    : userLocation
    ? [
        [Math.min(userLocation[0], destinationLat), Math.min(userLocation[1], destinationLon)],
        [Math.max(userLocation[0], destinationLat), Math.max(userLocation[1], destinationLon)],
      ]
    : [[destinationLat, destinationLon], [destinationLat, destinationLon]];

  // Safety check - should never happen due to early return above
  if (!userLocation) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigatie
        </CardTitle>
        <CardDescription>
          Route naar {destinationName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            100% gratis routeberekening via OpenStreetMap - geen API key nodig!
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button
            variant={travelMode === "driving" ? "default" : "outline"}
            onClick={() => setTravelMode("driving")}
            className="flex-1"
          >
            <Car className="h-4 w-4 mr-2" />
            Auto
          </Button>
          <Button
            variant={travelMode === "walking" ? "default" : "outline"}
            onClick={() => setTravelMode("walking")}
            className="flex-1"
          >
            <Footprints className="h-4 w-4 mr-2" />
            Lopen
          </Button>
        </div>

        <Button
          onClick={fetchRoute}
          disabled={isLoadingRoute}
          className="w-full"
          size="lg"
        >
          {isLoadingRoute ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Route berekenen...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Toon route
            </>
          )}
        </Button>

        {routeData && (
          <div className="flex gap-4 justify-center">
            <Badge variant="secondary" className="text-lg py-2 px-4">
              {formatDistance(routeData.distance)}
            </Badge>
            <Badge variant="secondary" className="text-lg py-2 px-4">
              {formatDuration(routeData.duration)}
            </Badge>
          </div>
        )}

        {showRoute && (
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* User location marker */}
              <Marker position={userLocation}>
                <Popup>Uw locatie</Popup>
              </Marker>

              {/* Destination marker */}
              <Marker position={[destinationLat, destinationLon]}>
                <Popup>{destinationName}</Popup>
              </Marker>

              {/* Route line */}
              {routeData && (
                <Polyline
                  positions={routeData.coordinates}
                  color="#3b82f6"
                  weight={5}
                  opacity={0.7}
                />
              )}

              <FitBounds bounds={bounds} />
            </MapContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteNavigation;
