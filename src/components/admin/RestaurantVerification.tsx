import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Loader2, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Restaurant {
  id: string;
  name: string;
  address_type: string | null;
  claim_status: string;
  verification_documents: string[] | null;
  verification_note: string | null;
  claimed_at: string | null;
  verified_at: string | null;
  owner_id: string | null;
}

const RestaurantVerification = () => {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRestaurants();
  }, [activeTab]);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('restaurants')
        .select('*')
        .eq('claim_status', activeTab)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Fout bij ophalen",
        description: "Kon restaurants niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (restaurantId: string, newStatus: 'approved' | 'rejected') => {
    setVerifyingId(restaurantId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from('restaurants')
        .update({
          claim_status: newStatus,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          verification_note: verificationNote || null,
        })
        .eq('id', restaurantId);

      if (error) throw error;

      toast({
        title: newStatus === 'approved' ? "Claim goedgekeurd" : "Claim afgewezen",
        description: "De status is bijgewerkt",
      });

      setVerificationNote("");
      fetchRestaurants();
    } catch (error: any) {
      console.error('Error verifying restaurant:', error);
      toast({
        title: "Fout bij verificatie",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifyingId(null);
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
        return <Badge variant="outline">Niet geclaimd</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">In behandeling</TabsTrigger>
          <TabsTrigger value="approved">Goedgekeurd</TabsTrigger>
          <TabsTrigger value="rejected">Afgewezen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : restaurants.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Geen restaurants in deze categorie
              </CardContent>
            </Card>
          ) : (
            restaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <CardDescription>
                        {restaurant.address_type || "Geen adres"}
                        {restaurant.claimed_at && (
                          <> • Geclaimd op {format(new Date(restaurant.claimed_at), 'dd MMM yyyy', { locale: nl })}</>
                        )}
                      </CardDescription>
                    </div>
                    {getStatusBadge(restaurant.claim_status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {restaurant.verification_documents && restaurant.verification_documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Verificatie documenten:</p>
                      <div className="space-y-2">
                        {restaurant.verification_documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Document {idx + 1}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pending' && (
                    <div className="space-y-3 pt-3 border-t">
                      <Textarea
                        placeholder="Optionele notitie (bijv. reden voor afwijzing)"
                        value={verificationNote}
                        onChange={(e) => setVerificationNote(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerify(restaurant.id, 'approved')}
                          disabled={verifyingId === restaurant.id}
                          className="flex-1"
                        >
                          {verifyingId === restaurant.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          Goedkeuren
                        </Button>
                        <Button
                          onClick={() => handleVerify(restaurant.id, 'rejected')}
                          disabled={verifyingId === restaurant.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          {verifyingId === restaurant.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-2" />
                          )}
                          Afwijzen
                        </Button>
                      </div>
                    </div>
                  )}

                  {restaurant.verification_note && (
                    <div className="text-sm text-muted-foreground pt-3 border-t">
                      <strong>Verificatie notitie:</strong> {restaurant.verification_note}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantVerification;
