import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OpeningHoursDisplayProps {
  openingHours: any;
}

export const OpeningHoursDisplay = ({ openingHours }: OpeningHoursDisplayProps) => {
  if (!openingHours) return null;

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('nl-NL', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (typeof openingHours === 'object' && openingHours.hours) {
      // Parse opening hours if structured
      return { isOpen: true, nextChange: null };
    }

    return { isOpen: null, nextChange: null };
  };

  const status = getCurrentStatus();
  
  const formatHours = (hours: any) => {
    if (typeof hours === 'string') {
      return hours.split('\n').map((line, i) => (
        <div key={i} className="flex justify-between py-2 border-b border-border last:border-0">
          <span className="text-muted-foreground">{line}</span>
        </div>
      ));
    }
    
    if (typeof hours === 'object' && hours.hours) {
      return (
        <div className="text-muted-foreground whitespace-pre-line">
          {hours.hours}
        </div>
      );
    }

    return <div className="text-muted-foreground">Openingstijden niet beschikbaar</div>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Openingstijden
          </CardTitle>
          {status.isOpen !== null && (
            <Badge variant={status.isOpen ? "default" : "secondary"}>
              {status.isOpen ? "Nu open" : "Gesloten"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {formatHours(openingHours)}
      </CardContent>
    </Card>
  );
};
