import { useState } from "react";
import Hero from "@/components/Hero";
import DestinationCard from "@/components/DestinationCard";
import MapView from "@/components/MapView";
import { searchLocation, NominatimResult } from "@/lib/nominatim";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe } from "lucide-react";

const Index = () => {
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.3676, 4.9041]);
  const [mapZoom, setMapZoom] = useState(6);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      const searchResults = await searchLocation(query);
      setResults(searchResults);
      
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        setMapCenter([parseFloat(firstResult.lat), parseFloat(firstResult.lon)]);
        setMapZoom(12);
        
        toast({
          title: "Zoekresultaten gevonden!",
          description: `${searchResults.length} locatie${searchResults.length !== 1 ? 's' : ''} gevonden voor "${query}"`,
        });
      } else {
        toast({
          title: "Geen resultaten",
          description: "Probeer een andere zoekterm",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fout bij zoeken",
        description: "Er ging iets mis bij het zoeken. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOnMap = (lat: number, lon: number) => {
    setMapCenter([lat, lon]);
    setMapZoom(14);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const locations = results.map(result => ({
    name: result.name || result.display_name.split(',')[0],
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    display_name: result.display_name,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Aan het zoeken...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Kaart Weergave
              </h2>
              <MapView 
                locations={locations}
                center={mapCenter}
                zoom={mapZoom}
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Gevonden Locaties ({results.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result) => (
                  <DestinationCard
                    key={result.place_id}
                    name={result.name || result.display_name.split(',')[0]}
                    displayName={result.display_name}
                    lat={parseFloat(result.lat)}
                    lon={parseFloat(result.lon)}
                    type={result.type}
                    onViewOnMap={() => handleViewOnMap(parseFloat(result.lat), parseFloat(result.lon))}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Globe className="h-20 w-20 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">
              Begin met zoeken
            </h3>
            <p className="text-muted-foreground max-w-md">
              Gebruik de zoekbalk hierboven om bestemmingen te vinden. Zoek op steden, landen of specifieke locaties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
