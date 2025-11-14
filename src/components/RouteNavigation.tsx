import { useState, useEffect, useCallback, useRef } from "react";
// Using Leaflet core directly for map rendering to avoid Context.Consumer issues
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation, Car, Footprints, Loader2, AlertCircle, ArrowRight, ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
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
  steps?: RouteStep[];
}
interface RouteStep {
  distance: number;
  duration: number;
  instruction: string;
  name?: string;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Internal Leaflet map using core API to avoid react-leaflet Context.Consumer
function RouteLeafletMap({
  userLocation,
  destination,
  route,
  bounds
}: {
  userLocation: [number, number];
  destination: [number, number];
  route: [number, number][];
  bounds: [[number, number], [number, number]];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: userLocation,
      zoom: 13,
      scrollWheelZoom: false
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
  }, []);
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    const group = markersRef.current;
    group.clearLayers();
    L.marker(userLocation).bindPopup("Uw locatie").addTo(group);
    L.marker(destination).bindPopup(`${destination[0]}, ${destination[1]}`).addTo(group);
    if (routeRef.current) {
      mapRef.current.removeLayer(routeRef.current);
      routeRef.current = null;
    }
    if (route && route.length > 1) {
      routeRef.current = L.polyline(route, {
        color: "#3b82f6",
        weight: 5,
        opacity: 0.7
      }).addTo(mapRef.current);
    }
    const allPoints = [...(route || []), userLocation, destination];
    const llb = L.latLngBounds(allPoints.map(p => L.latLng(p[0], p[1])));
    mapRef.current.fitBounds(llb, {
      padding: [50, 50]
    });
  }, [userLocation.join("|"), destination.join("|"), JSON.stringify(route), JSON.stringify(bounds)]);
  return <div ref={containerRef} style={{
    height: "100%",
    width: "100%"
  }} />;
}
const RouteNavigation = ({
  destinationLat,
  destinationLon,
  destinationName
}: RouteNavigationProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>("driving");
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"loading" | "ready" | "error">("loading");
  const { toast } = useToast();
  const { t } = useTranslation();
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      toast({
        title: "Locatie niet beschikbaar",
        description: "Je browser ondersteunt geen locatiedeling.",
        variant: "destructive"
      });
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(position => {
      setUserLocation([position.coords.latitude, position.coords.longitude]);
      setLocationStatus("ready");
    }, error => {
      console.log("Geolocation error:", error);
      setLocationStatus("error");
      toast({
        title: "Locatie niet beschikbaar",
        description: "Geef toestemming voor locatietoegang om navigatie te gebruiken.",
        variant: "destructive"
      });
    }, {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000
    });
  }, [toast]);
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);
  const fetchRoute = async () => {
    if (!userLocation) {
      toast({
        title: "Locatie vereist",
        description: "We hebben je locatie nodig om een route te berekenen.",
        variant: "destructive"
      });
      return;
    }
    setIsLoadingRoute(true);

    // Helper to add a timeout to fetch (prevents hanging requests)
    const fetchWithTimeout = async (url: string, timeoutMs = 8000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } finally {
        clearTimeout(id);
      }
    };
    try {
      const userLonLat = `${userLocation[1]},${userLocation[0]}`;
      const destLonLat = `${destinationLon},${destinationLat}`;

      // Primary (official) OSRM endpoint expects profiles: driving | walking | cycling
      const primaryProfile = travelMode === "driving" ? "driving" : "walking";
      const primaryUrl = `https://router.project-osrm.org/route/v1/${primaryProfile}/${userLonLat};${destLonLat}?overview=full&geometries=geojson&steps=true`;

      // Fallback OSRM mirror (FOSSGIS): base path depends on mode and path profile differs slightly
      const fallbackBase = travelMode === "driving" ? "routed-car" : "routed-foot";
      const fallbackProfile = travelMode === "driving" ? "driving" : "foot";
      const fallbackUrl = `https://routing.openstreetmap.de/${fallbackBase}/route/v1/${fallbackProfile}/${userLonLat};${destLonLat}?overview=full&geometries=geojson&steps=true`;
      let data: any | null = null;

      // Try primary, then fallback if it fails (network/CORS/rate limit)
      try {
        data = await fetchWithTimeout(primaryUrl, 8000);
      } catch (e) {
        console.warn("Primary OSRM failed, trying fallback:", e);
        data = await fetchWithTimeout(fallbackUrl, 10000);
      }
      if (data && data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] // [lon, lat] -> [lat, lon]
        );

        // Extract turn-by-turn steps
        const steps: RouteStep[] = [];
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          route.legs[0].steps.forEach((step: any) => {
            steps.push({
              distance: step.distance,
              duration: step.duration,
              instruction: step.maneuver.instruction || getManeuverInstruction(step.maneuver),
              name: step.name || "",
              maneuver: {
                type: step.maneuver.type,
                modifier: step.maneuver.modifier,
                location: [step.maneuver.location[1], step.maneuver.location[0]] // [lon, lat] -> [lat, lon]
              }
            });
          });
        }
        setRouteData({
          distance: route.distance,
          duration: route.duration,
          coordinates,
          steps
        });
        setShowRoute(true);
        toast({
          title: "Route berekend",
          description: `${formatDistance(route.distance)} - ${formatDuration(route.duration)}`
        });
      } else {
        throw new Error("Geen route gevonden");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      toast({
        title: "Fout bij routeberekening",
        description: "Probeer later opnieuw of open de route in Google Maps.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Generate instruction from maneuver type and modifier
  const getManeuverInstruction = (maneuver: any): string => {
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    if (type === "depart") return "Vertrek";
    if (type === "arrive") return "Aangekomen bij bestemming";
    if (type === "turn") {
      if (modifier === "left") return "Sla linksaf";
      if (modifier === "right") return "Sla rechtsaf";
      if (modifier === "sharp left") return "Sla scherp linksaf";
      if (modifier === "sharp right") return "Sla scherp rechtsaf";
      if (modifier === "slight left") return "Houd links aan";
      if (modifier === "slight right") return "Houd rechts aan";
      if (modifier === "straight") return "Ga rechtdoor";
    }
    if (type === "roundabout" || type === "rotary") return "Neem de rotonde";
    if (type === "merge") return "Voeg in";
    if (type === "fork") {
      if (modifier === "left") return "Houd links aan bij splitsing";
      if (modifier === "right") return "Houd rechts aan bij splitsing";
    }
    if (type === "end of road") {
      if (modifier === "left") return "Aan het einde linksaf";
      if (modifier === "right") return "Aan het einde rechtsaf";
    }
    if (type === "continue") return "Blijf rechtdoor";
    return "Volg de route";
  };

  // Get icon for maneuver type
  const getManeuverIcon = (maneuver: {
    type: string;
    modifier?: string;
  }) => {
    const type = maneuver.type;
    const modifier = maneuver.modifier;
    if (type === "depart" || type === "arrive") return <Navigation className="h-5 w-5" />;
    if (type === "turn") {
      if (modifier === "left" || modifier === "sharp left") return <ArrowLeft className="h-5 w-5" />;
      if (modifier === "right" || modifier === "sharp right") return <ArrowRight className="h-5 w-5" />;
      if (modifier === "slight left") return <ArrowUpRight className="h-5 w-5 rotate-[-45deg]" />;
      if (modifier === "slight right") return <ArrowUpRight className="h-5 w-5" />;
      if (modifier === "straight") return <ArrowUp className="h-5 w-5" />;
    }
    if (type === "roundabout" || type === "rotary") return <ArrowRight className="h-5 w-5 rotate-[270deg]" />;
    if (type === "fork") {
      if (modifier === "left") return <ArrowUpRight className="h-5 w-5 rotate-[-45deg]" />;
      if (modifier === "right") return <ArrowUpRight className="h-5 w-5" />;
    }
    if (type === "continue") return <ArrowUp className="h-5 w-5" />;
    return <ArrowUp className="h-5 w-5" />;
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
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          {t("navigation.title", { name: destinationName })}
        </CardTitle>
        <CardDescription>
          {t("navigation.subtitle", { name: destinationName })}
        </CardDescription>
      </CardHeader>
        <CardContent>
          {locationStatus === "loading" ? <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Locatie ophalen...</p>
            </div> : <div className="space-y-4">
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
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLon}&travelmode=${travelMode}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full">Open in Google Maps</Button>
                </a>
              </div>
            </div>}
        </CardContent>
      </Card>;
  }
  const bounds: [[number, number], [number, number]] = routeData ? [[Math.min(...routeData.coordinates.map(c => c[0])), Math.min(...routeData.coordinates.map(c => c[1]))], [Math.max(...routeData.coordinates.map(c => c[0])), Math.max(...routeData.coordinates.map(c => c[1]))]] : userLocation ? [[Math.min(userLocation[0], destinationLat), Math.min(userLocation[1], destinationLon)], [Math.max(userLocation[0], destinationLat), Math.max(userLocation[1], destinationLon)]] : [[destinationLat, destinationLon], [destinationLat, destinationLon]];

  // Safety check - should never happen due to early return above
  if (!userLocation) {
    return null;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          {t("navigation.title", { name: destinationName })}
        </CardTitle>
        <CardDescription>
          {t("navigation.subtitle", { name: destinationName })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        

        <div className="flex gap-2">
          <Button variant={travelMode === "driving" ? "default" : "outline"} onClick={() => setTravelMode("driving")} className="flex-1">
            <Car className="h-4 w-4 mr-2" />
            Auto
          </Button>
          <Button variant={travelMode === "walking" ? "default" : "outline"} onClick={() => setTravelMode("walking")} className="flex-1">
            <Footprints className="h-4 w-4 mr-2" />
            Lopen
          </Button>
        </div>

        <Button onClick={fetchRoute} disabled={isLoadingRoute} className="w-full" size="lg">
          {isLoadingRoute ? <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Route berekenen...
            </> : <>
              <Navigation className="h-4 w-4 mr-2" />
              Toon route
            </>}
        </Button>

        {routeData && <div className="flex gap-4 justify-center">
            <Badge variant="secondary" className="text-lg py-2 px-4">
              {formatDistance(routeData.distance)}
            </Badge>
            <Badge variant="secondary" className="text-lg py-2 px-4">
              {formatDuration(routeData.duration)}
            </Badge>
          </div>}

        {showRoute && <>
            <div className="h-[400px] rounded-lg overflow-hidden border mb-4">
              <RouteLeafletMap userLocation={userLocation} destination={[destinationLat, destinationLon]} route={routeData?.coordinates || []} bounds={bounds} />
            </div>

            {/* Turn-by-turn instructions */}
            {routeData?.steps && routeData.steps.length > 0 && <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    Routebeschrijving
                  </CardTitle>
                  <CardDescription>
                    Volg deze stappen naar {destinationName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {routeData.steps.map((step, index) => <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {getManeuverIcon(step.maneuver)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">
                            {step.instruction}
                            {step.name && step.name !== "" && <span className="text-muted-foreground"> op {step.name}</span>}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{formatDistance(step.distance)}</span>
                            {step.duration > 0 && <>
                                <span>•</span>
                                <span>{formatDuration(step.duration)}</span>
                              </>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}
          </>}
      </CardContent>
    </Card>;
};
export default RouteNavigation;