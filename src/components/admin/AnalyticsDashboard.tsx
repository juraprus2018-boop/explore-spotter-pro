import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, Users, MessageSquare, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { nl } from "date-fns/locale";

interface MonthlyData {
  month: string;
  reviews: number;
  claims: number;
  newRestaurants: number;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface ClaimStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [claimStats, setClaimStats] = useState<ClaimStats | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Get last 6 months
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), 5 - i);
        return {
          start: startOfMonth(date).toISOString(),
          end: endOfMonth(date).toISOString(),
          label: format(date, 'MMM yyyy', { locale: nl }),
        };
      });

      // Fetch data for each month
      const monthlyStats = await Promise.all(
        months.map(async ({ start, end, label }) => {
          // Reviews count
          const { count: reviewsCount } = await (supabase as any)
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', start)
            .lte('created_at', end);

          // Claims count
          const { count: claimsCount } = await supabase
            .from('restaurants')
            .select('*', { count: 'exact', head: true })
            .gte('claimed_at', start)
            .lte('claimed_at', end)
            .not('claimed_at', 'is', null);

          // New restaurants count
          const { count: restaurantsCount } = await supabase
            .from('restaurants')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', start)
            .lte('created_at', end);

          return {
            month: label,
            reviews: reviewsCount || 0,
            claims: claimsCount || 0,
            newRestaurants: restaurantsCount || 0,
          };
        })
      );

      setMonthlyData(monthlyStats);

      // Fetch review statistics
      const { data: reviewsData } = await (supabase as any)
        .from('reviews')
        .select('status');

      if (reviewsData) {
        const stats = {
          total: reviewsData.length,
          pending: reviewsData.filter(r => r.status === 'pending').length,
          approved: reviewsData.filter(r => r.status === 'approved').length,
          rejected: reviewsData.filter(r => r.status === 'rejected').length,
        };
        setReviewStats(stats);
      }

      // Fetch claim statistics
      const { data: claimsData } = await (supabase as any)
        .from('restaurants')
        .select('claim_status')
        .not('claim_status', 'is', null);

      if (claimsData) {
        const stats = {
          total: claimsData.length,
          pending: claimsData.filter(r => r.claim_status === 'pending').length,
          approved: claimsData.filter(r => r.claim_status === 'approved').length,
          rejected: claimsData.filter(r => r.claim_status === 'rejected').length,
        };
        setClaimStats(stats);
      }

      // Fetch total users count (approximate from reviews and claims)
      const { count: usersCount } = await (supabase as any)
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      setTotalUsers(usersCount || 0);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Fout bij ophalen statistieken",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const reviewStatusData = reviewStats
    ? [
        { name: 'In behandeling', value: reviewStats.pending },
        { name: 'Goedgekeurd', value: reviewStats.approved },
        { name: 'Afgewezen', value: reviewStats.rejected },
      ]
    : [];

  const claimStatusData = claimStats
    ? [
        { name: 'In behandeling', value: claimStats.pending },
        { name: 'Goedgekeurd', value: claimStats.approved },
        { name: 'Afgewezen', value: claimStats.rejected },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {reviewStats?.pending || 0} in behandeling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Claims</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claimStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {claimStats?.pending || 0} in behandeling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Geregistreerde gebruikers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groei</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyData.length > 1
                ? `+${Math.round(
                    ((monthlyData[monthlyData.length - 1].reviews -
                      monthlyData[monthlyData.length - 2].reviews) /
                      Math.max(monthlyData[monthlyData.length - 2].reviews, 1)) *
                      100
                  )}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Reviews t.o.v. vorige maand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activiteit per Maand</CardTitle>
              <CardDescription>
                Reviews, claims en nieuwe restaurants van de afgelopen 6 maanden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reviews" fill="#8884d8" name="Reviews" />
                  <Bar dataKey="claims" fill="#82ca9d" name="Claims" />
                  <Bar dataKey="newRestaurants" fill="#ffc658" name="Nieuwe Restaurants" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Reviews Trend</CardTitle>
                <CardDescription>Aantal reviews per maand</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="reviews"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Reviews"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Status Verdeling</CardTitle>
                <CardDescription>Huidige status van alle reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reviewStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reviewStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Claims Trend</CardTitle>
                <CardDescription>Aantal claims per maand</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="claims"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Claims"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Status Verdeling</CardTitle>
                <CardDescription>Huidige status van alle claims</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={claimStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {claimStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
