import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HreflangAlternates from "@/components/HreflangAlternates";

interface Restaurant {
  id: string;
  name: string;
  display_name: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  claim_status: string;
  opening_hours: any;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    website: "",
    description: "",
    opening_hours: "",
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Log in om je dashboard te bekijken",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Fetch restaurant owned by this user
      const { data, error } = await (supabase as any)
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No restaurant found
          toast({
            title: "Geen restaurant",
            description: "Je hebt nog geen restaurant geclaimd",
          });
        } else {
          throw error;
        }
      } else {
        setRestaurant(data);
        setFormData({
          phone: data.phone || "",
          website: data.website || "",
          description: data.description || "",
          opening_hours: typeof data.opening_hours === 'object' 
            ? JSON.stringify(data.opening_hours, null, 2) 
            : data.opening_hours || "",
        });
      }
    } catch (error: any) {
      console.error('Error checking authentication:', error);
      toast({
        title: "Fout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurant) return;

    setIsSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('restaurants')
        .update({
          phone: formData.phone || null,
          website: formData.website || null,
          description: formData.description || null,
          opening_hours: formData.opening_hours || null,
        })
        .eq('id', restaurant.id);

      if (error) throw error;

      toast({
        title: "Gegevens opgeslagen",
        description: "Je restaurant informatie is bijgewerkt",
      });

      checkAuthentication(); // Refresh data
    } catch (error: any) {
      console.error('Error saving restaurant:', error);
      toast({
        title: "Fout bij opslaan",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Goedgekeurd</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Afgewezen</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In behandeling</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Geen restaurant
              </CardTitle>
              <CardDescription>
                Je hebt nog geen restaurant geclaimd. Zoek een restaurant en claim het om deze pagina te gebruiken.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/')}>
                Ga naar homepage
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HreflangAlternates />
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Store className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Mijn Restaurant</h1>
            </div>
            <p className="text-muted-foreground">
              Beheer de gegevens van je restaurant
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{restaurant.name}</CardTitle>
                  <CardDescription className="mt-1">{restaurant.display_name}</CardDescription>
                </div>
                {getStatusBadge(restaurant.claim_status)}
              </div>
            </CardHeader>
          </Card>

          {restaurant.claim_status === 'pending' && (
            <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-yellow-700 dark:text-yellow-500">In afwachting van goedkeuring</CardTitle>
                <CardDescription>
                  Je claim wordt momenteel beoordeeld door een administrator. Je kunt de gegevens pas bewerken nadat je claim is goedgekeurd.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {restaurant.claim_status === 'rejected' && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive">Claim afgewezen</CardTitle>
                <CardDescription>
                  Je claim is helaas afgewezen. Neem contact op met de administrator voor meer informatie.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Restaurant informatie</CardTitle>
              <CardDescription>
                {restaurant.claim_status === 'approved' 
                  ? "Bewerk de gegevens van je restaurant" 
                  : "Je kunt deze gegevens bewerken na goedkeuring van je claim"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoonnummer</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+31 6 12345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={restaurant.claim_status !== 'approved'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.mijnrestaurant.nl"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  disabled={restaurant.claim_status !== 'approved'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_hours">Openingstijden</Label>
                <Textarea
                  id="opening_hours"
                  placeholder="Ma-Vr: 12:00-22:00&#10;Za-Zo: 14:00-23:00"
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  disabled={restaurant.claim_status !== 'approved'}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  placeholder="Vertel over je restaurant..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={restaurant.claim_status !== 'approved'}
                  rows={6}
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving || restaurant.claim_status !== 'approved'}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Bezig met opslaan...
                  </>
                ) : (
                  "Opslaan"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerDashboard;
