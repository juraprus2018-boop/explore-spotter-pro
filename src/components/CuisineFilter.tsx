import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CuisineFilterProps {
  cuisines: string[];
  selectedCuisine: string | null;
  onSelectCuisine: (cuisine: string | null) => void;
}

const CuisineFilter = ({ cuisines, selectedCuisine, onSelectCuisine }: CuisineFilterProps) => {
  if (cuisines.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Filter op cuisine:</span>
      {selectedCuisine && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectCuisine(null)}
          className="h-7 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Reset
        </Button>
      )}
      {cuisines.map((cuisine) => (
        <Badge
          key={cuisine}
          variant={selectedCuisine === cuisine ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => onSelectCuisine(selectedCuisine === cuisine ? null : cuisine)}
        >
          {cuisine}
        </Badge>
      ))}
    </div>
  );
};

export default CuisineFilter;
