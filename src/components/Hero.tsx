import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroProps {
  onSearch: (query: string) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            Ontdek de Wereld
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Zoek naar duizenden bestemmingen wereldwijd met real-time kaarten en locatiegegevens
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex gap-2 bg-background rounded-full p-2 shadow-lg">
              <div className="flex-1 flex items-center">
                <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Zoek een stad, land of bestemming..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg"
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Zoeken
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Hero;
