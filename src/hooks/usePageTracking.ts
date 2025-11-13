import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Extract city name from URL if present (e.g., /nl/noord-brabant/eindhoven)
        const pathParts = location.pathname.split('/').filter(Boolean);
        let cityName = null;
        
        // If path has 3 parts (lang/province/city), third part is city
        if (pathParts.length >= 3) {
          cityName = pathParts[2];
        }

        await supabase.from('page_views' as any).insert({
          page_url: location.pathname,
          city_name: cityName,
          user_agent: navigator.userAgent,
        } as any);
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname]);
};
