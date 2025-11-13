import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PageViewStats {
  page_url: string;
  view_count: number;
}

interface CityStats {
  city_name: string;
  view_count: number;
}

const PageViewsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [pageStats, setPageStats] = useState<PageViewStats[]>([]);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total views
      const { count: total } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true });

      setTotalViews(total || 0);

      // Get page views grouped by URL
      const { data: pages, error: pagesError } = await supabase
        .from('page_views')
        .select('page_url')
        .order('created_at', { ascending: false });

      if (pagesError) throw pagesError;

      // Count views per page
      const pageCounts = pages?.reduce((acc: Record<string, number>, item) => {
        acc[item.page_url] = (acc[item.page_url] || 0) + 1;
        return acc;
      }, {});

      const pageStatsArray = Object.entries(pageCounts || {})
        .map(([page_url, view_count]) => ({ page_url, view_count: view_count as number }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      setPageStats(pageStatsArray);

      // Get city views
      const { data: cities, error: citiesError } = await supabase
        .from('page_views')
        .select('city_name')
        .not('city_name', 'is', null);

      if (citiesError) throw citiesError;

      // Count views per city
      const cityCounts = cities?.reduce((acc: Record<string, number>, item) => {
        if (item.city_name) {
          acc[item.city_name] = (acc[item.city_name] || 0) + 1;
        }
        return acc;
      }, {});

      const cityStatsArray = Object.entries(cityCounts || {})
        .map(([city_name, view_count]) => ({ city_name, view_count: view_count as number }))
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 10);

      setCityStats(cityStatsArray);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Totaal Paginaweergaven</CardTitle>
          <CardDescription>Totaal aantal pageviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">{totalViews.toLocaleString()}</div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Pagina's</CardTitle>
            <CardDescription>Meest bezochte pagina's</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pagina</TableHead>
                  <TableHead className="text-right">Weergaven</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{stat.page_url}</TableCell>
                    <TableCell className="text-right font-semibold">{stat.view_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Steden</CardTitle>
            <CardDescription>Meest bezochte steden</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stad</TableHead>
                  <TableHead className="text-right">Weergaven</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityStats.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell className="capitalize">{stat.city_name.replace(/-/g, ' ')}</TableCell>
                    <TableCell className="text-right font-semibold">{stat.view_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PageViewsAnalytics;
