import { Euro } from 'lucide-react';

interface PriceRangeIndicatorProps {
  priceRange?: number;
  className?: string;
}

export const PriceRangeIndicator = ({ priceRange, className = '' }: PriceRangeIndicatorProps) => {
  if (!priceRange || priceRange < 1 || priceRange > 4) {
    return null;
  }

  const maxIcons = 4;
  
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxIcons }).map((_, index) => (
        <Euro
          key={index}
          className={`h-4 w-4 ${
            index < priceRange
              ? 'text-primary fill-primary'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
};
