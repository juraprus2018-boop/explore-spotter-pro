import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchAutocomplete from "./SearchAutocomplete";

interface HeroProps {
  onSearch: (query: string, location?: { lat: number; lon: number }) => void;
}

const Hero = ({ onSearch }: HeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8">
            {t("hero.subtitle")}
          </p>
          
          <SearchAutocomplete onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
