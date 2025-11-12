import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation, Car, Footprints, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RouteNavigationProps {
  destinationLat: number;
  destinationLon: number;
  destinationName: string;
}

type TravelMode = "walking" | "driving";

interface RouteData {
  distance: number;
  duration: number;
  geometry: any;
}

const RouteNavigation = ({ destinationLat, destinationLon, destinationName }: RouteNavigationProps) => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.log("Geolocation error:", error);
          toast({
            title: "Locatie niet beschikbaar",
            description: "Geef toestemming voor locatietoegang om navigatie te gebruiken.",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: userLocation,
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers
    new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML("<p>Uw locatie</p>"))
      .addTo(map.current);

    new mapboxgl.Marker({ color: "#ef4444" })
      .setLngLat([destinationLon, destinationLat])
      .setPopup(new mapboxgl.Popup().setHTML(`<p>${destinationName}</p>`))
      .addTo(map.current);

    setShowTokenInput(false);
  };

  const fetchRoute = async () => {
    if (!userLocation || !mapboxToken) return;

    setIsLoadingRoute(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/${travelMode}/${userLocation[0]},${userLocation[1]};${destinationLon},${destinationLat}?geometries=geojson&access_token=${mapboxToken}`
      );

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
        });

        // Draw route on map
        if (map.current) {
          if (map.current.getSource("route")) {
            (map.current.getSource("route") as mapboxgl.GeoJSONSource).setData({
              type: "Feature",
              properties: {},
              geometry: route.geometry,
            });
          } else {
            map.current.addLayer({
              id: "route",
              type: "line",
              source: {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: route.geometry,
                },
              },
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#3b82f6",
                "line-width": 5,
                "line-opacity": 0.75,
              },
            });
          }

          // Fit map to route bounds
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce(
            (bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
              return bounds.extend(coord as [number, number]);
            },
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
          );
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({
        title: "Fout bij routeberekening",
        description: "Kan route niet berekenen. Controleer je Mapbox token.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  useEffect(() => {
    if (mapboxToken && userLocation && !map.current) {
      initializeMap();
    }
  }, [mapboxToken, userLocation]);

  useEffect(() => {
    if (map.current && userLocation) {
      fetchRoute();
    }
  }, [travelMode, userLocation, mapboxToken]);

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

  if (showTokenInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Navigatie instellen
          </CardTitle>
          <CardDescription>
            Voer je Mapbox token in om navigatie te activeren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Je hebt een gratis Mapbox account nodig. Maak er een aan op{" "}
              <a
                href="https://mapbox.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>{" "}
              en kopieer je Public Token.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>

          <Button
            onClick={initializeMap}
            disabled={!mapboxToken || !userLocation}
            className="w-full"
          >
            {!userLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Locatie ophalen...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Navigatie activeren
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigatie naar {destinationName}
        </CardTitle>
        <CardDescription>Kies je vervoersmiddel</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={travelMode === "driving" ? "default" : "outline"}
            onClick={() => setTravelMode("driving")}
            className="flex-1"
            disabled={isLoadingRoute}
          >
            <Car className="h-4 w-4 mr-2" />
            Auto
          </Button>
          <Button
            variant={travelMode === "walking" ? "default" : "outline"}
            onClick={() => setTravelMode("walking")}
            className="flex-1"
            disabled={isLoadingRoute}
          >
            <Footprints className="h-4 w-4 mr-2" />
            Te voet
          </Button>
        </div>

        {routeData && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Afstand</p>
              <p className="text-lg font-semibold">{formatDistance(routeData.distance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reistijd</p>
              <p className="text-lg font-semibold">{formatDuration(routeData.duration)}</p>
            </div>
          </div>
        )}

        <div
          ref={mapContainer}
          className="w-full h-[400px] rounded-lg overflow-hidden"
        />

        {isLoadingRoute && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteNavigation;
