import { Badge } from '@/components/ui/badge';
import { getOpenStatus } from '@/lib/openingHours';

interface OpenStatusBadgeProps {
  openingHours: any;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showDetails?: boolean;
}

export const OpenStatusBadge = ({ 
  openingHours, 
  className = '', 
  size = 'default',
  showDetails = false 
}: OpenStatusBadgeProps) => {
  const status = getOpenStatus(openingHours);
  
  if (status.isOpen === null) return null;
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  if (status.isOpen) {
    const text = showDetails && status.closesAt 
      ? `Open tot ${status.closesAt}` 
      : 'Open';
    
    return (
      <Badge 
        variant="default"
        className={`bg-green-600 hover:bg-green-700 text-white ${sizeClasses[size]} ${className}`}
      >
        {text}
      </Badge>
    );
  }
  
  const closedText = showDetails && status.opensAt && status.opensDay
    ? `Gesloten · Opent ${status.opensDay} om ${status.opensAt}`
    : 'Gesloten';
  
  return (
    <Badge 
      variant="secondary"
      className={`bg-muted text-muted-foreground ${sizeClasses[size]} ${className}`}
    >
      {closedText}
    </Badge>
  );
};
