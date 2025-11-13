import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchLocations } from "@/lib/nominatim";

interface SearchAutocompleteProps {
  onSearch: (query: string, location?: { lat: number; lon: number }) => void;
}

interface LocationSuggestion {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: string;
  country: string;
  region?: string;
}

const SearchAutocomplete = ({ onSearch }: SearchAutocompleteProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      console.log("Fetching suggestions for:", query);
      const locationResults = await searchLocations(query);
      console.log("Got location results:", locationResults);
      
      const locationSuggestions: LocationSuggestion[] = locationResults.map((r) => {
        const addr = r.address || {};
        const name = r.name || addr.city || addr.town || addr.village || addr.municipality || r.display_name.split(',')[0]?.trim() || query;
        const country = addr.country || r.display_name.split(',').pop()?.trim() || '';
        const region = addr.state || addr.county || addr.municipality || '';
        
        return {
          name,
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
          type: r.type,
          country,
          region,
        };
      });

      console.log("Setting suggestions:", locationSuggestions);
      setSuggestions(locationSuggestions);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearch(searchQuery);
    }
  };

  const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    // Pass location coordinates to search for restaurants in that area
    onSearch(suggestion.name, { lat: suggestion.lat, lon: suggestion.lon });
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
      <div className="relative flex gap-2 bg-background rounded-full p-2 shadow-lg">
        <div className="flex-1 flex items-center relative">
          <Search className="absolute left-6 h-5 w-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder={t("hero.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-12 pr-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-[99999]">
              <Command className="rounded-xl border border-border/50 shadow-2xl bg-background">
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>
                    {isLoadingSuggestions ? "Laden..." : "Geen suggesties"}
                  </CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={`${suggestion.name}-${suggestion.country}-${index}`}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                        className="cursor-pointer py-3 px-4 hover:bg-muted/50 aria-selected:bg-muted"
                      >
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium text-base text-foreground">
                              {suggestion.name}
                              {suggestion.region && `, ${suggestion.region}`}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {suggestion.country}
                            </span>
                          </div>
                          <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-md whitespace-nowrap capitalize font-medium">
                            {suggestion.type}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="rounded-full px-8"
        >
          {t("hero.searchButton")}
        </Button>
      </div>
    </form>
  );
};

export default SearchAutocomplete;
