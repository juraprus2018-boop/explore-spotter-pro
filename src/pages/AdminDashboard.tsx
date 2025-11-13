import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, AlertCircle, Loader2, BarChart3 } from "lucide-react";
import ReviewModeration from "@/components/admin/ReviewModeration";
import RestaurantVerification from "@/components/admin/RestaurantVerification";
import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, isLoading, isAdmin, isModerator } = useUserRole();

  useEffect(() => {
    if (!isLoading && !isModerator) {
      navigate('/');
    }
  }, [isLoading, isModerator, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Geen toegang
            </CardTitle>
            <CardDescription>
              Je hebt geen toestemming om deze pagina te bekijken.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Beheer reviews en restaurant verificaties
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistieken
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Review Moderatie
            </TabsTrigger>
            <TabsTrigger value="verification" disabled={!isAdmin}>
              Restaurant Verificatie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <ReviewModeration />
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {isAdmin ? (
              <RestaurantVerification />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Alleen voor administrators</CardTitle>
                  <CardDescription>
                    Je hebt admin rechten nodig om restaurant verificaties te beheren.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
