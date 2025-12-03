import { Badge } from '@/components/ui/badge';
import { isCurrentlyOpen } from '@/lib/openingHours';

interface OpenStatusBadgeProps {
  openingHours: any;
  className?: string;
  size?: 'sm' | 'default';
}

export const OpenStatusBadge = ({ openingHours, className = '', size = 'default' }: OpenStatusBadgeProps) => {
  const isOpen = isCurrentlyOpen(openingHours);
  
  if (isOpen === null) return null;
  
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : '';
  
  return (
    <Badge 
      variant={isOpen ? "default" : "secondary"}
      className={`${isOpen ? 'bg-green-600 hover:bg-green-700' : 'bg-muted text-muted-foreground'} ${sizeClasses} ${className}`}
    >
      {isOpen ? 'Open' : 'Gesloten'}
    </Badge>
  );
};
