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
import { searchRestaurantsInDatabase } from "@/lib/database";
import { searchRestaurants } from "@/lib/nominatim";

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
}

interface Suggestion {
  name: string;
  displayName: string;
  source: "database" | "api";
}

const SearchAutocomplete = ({ onSearch }: SearchAutocompleteProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      // Search in database first
      const dbResults = await searchRestaurantsInDatabase(query);
      const dbSuggestions: Suggestion[] = dbResults.slice(0, 5).map((r) => ({
        name: r.name,
        displayName: r.display_name,
        source: "database" as const,
      }));

      // If we have less than 5 results, fetch from API
      if (dbSuggestions.length < 5) {
        const apiResults = await searchRestaurants(query);
        const apiSuggestions: Suggestion[] = apiResults
          .slice(0, 5 - dbSuggestions.length)
          .map((r) => ({
            name: r.name || r.display_name.split(",")[0],
            displayName: r.display_name,
            source: "api" as const,
          }));

        setSuggestions([...dbSuggestions, ...apiSuggestions]);
      } else {
        setSuggestions(dbSuggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
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

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
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
            <div className="absolute top-full left-0 right-0 mt-2 z-50">
              <Command className="rounded-lg border shadow-md bg-background">
                <CommandList>
                  <CommandEmpty>
                    {isLoadingSuggestions ? "Laden..." : "Geen suggesties"}
                  </CommandEmpty>
                  <CommandGroup>
                    {suggestions.map((suggestion, index) => (
                      <CommandItem
                        key={`${suggestion.name}-${index}`}
                        onSelect={() => handleSelectSuggestion(suggestion)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{suggestion.name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {suggestion.displayName}
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
          className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {t("hero.searchButton")}
        </Button>
      </div>
    </form>
  );
};

export default SearchAutocomplete;
