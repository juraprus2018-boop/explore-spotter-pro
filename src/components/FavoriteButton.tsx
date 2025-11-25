import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFavorite, isFavorited } from '@/lib/favorites';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface FavoriteButtonProps {
  restaurantId: string;
  restaurantName: string;
}

export const FavoriteButton = ({ restaurantId, restaurantName }: FavoriteButtonProps) => {
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const favorited = await isFavorited(restaurantId, user.id);
        setIsFav(favorited);
      }
    };
    
    checkAuth();
  }, [restaurantId]);

  const handleToggle = async () => {
    if (!user) {
      toast({
        title: "Inloggen vereist",
        description: "Log in om restaurants toe te voegen aan je favorieten",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    try {
      const newState = await toggleFavorite(restaurantId, user.id);
      setIsFav(newState);
      
      toast({
        title: newState ? "Toegevoegd aan favorieten" : "Verwijderd uit favorieten",
        description: newState 
          ? `${restaurantName} is toegevoegd aan je favorieten`
          : `${restaurantName} is verwijderd uit je favorieten`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Fout",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={isLoading}
      className="transition-colors"
    >
      <Heart
        className={`h-5 w-5 transition-all ${
          isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
        }`}
      />
    </Button>
  );
};
