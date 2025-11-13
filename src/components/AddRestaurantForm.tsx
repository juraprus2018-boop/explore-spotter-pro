import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createSlug } from "@/lib/database";

const restaurantSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn").max(100),
  address: z.string().min(5, "Adres moet minimaal 5 karakters zijn").max(255),
  city: z.string().min(2, "Stad moet minimaal 2 karakters zijn").max(100),
  phone: z.string().optional(),
  website: z.string().url("Ongeldig website adres").optional().or(z.literal("")),
  description: z.string().max(1000, "Beschrijving mag maximaal 1000 karakters zijn").optional(),
});

interface AddRestaurantFormProps {
  onSuccess?: () => void;
}

const AddRestaurantForm = ({ onSuccess }: AddRestaurantFormProps) => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    website: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    try {
      restaurantSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validatie fout",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
      return;
    }

    setIsLoading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Je moet ingelogd zijn om een restaurant toe te voegen.",
          variant: "destructive",
        });
        navigate(`/${lang}/auth`);
        return;
      }

      // For user-submitted restaurants, we create a simplified entry
      // We use a negative place_id to distinguish from Nominatim results
      const newRestaurant = {
        name: formData.name,
        display_name: `${formData.name}, ${formData.address}, ${formData.city}`,
        place_id: Date.now() * -1, // Negative ID for user-submitted
        lat: 0, // Will be geocoded later or manually set
        lon: 0,
        type: "restaurant",
        user_submitted: true,
        owner_id: user.id,
        phone: formData.phone || null,
        website: formData.website || null,
        description: formData.description || null,
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert(newRestaurant)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Restaurant toegevoegd!",
        description: "Je restaurant is succesvol toegevoegd.",
      });

      // Navigate to restaurant detail page
      if (data) {
        const citySlug = createSlug(formData.city);
        navigate(`/${lang}/${citySlug}/${Math.abs(data.place_id)}`);
      }

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error adding restaurant:", error);
      toast({
        title: "Fout bij toevoegen",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Restaurant Toevoegen</CardTitle>
        <CardDescription>
          Voeg je restaurant toe aan het platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Naam *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Bijvoorbeeld: Café De Vriendschap"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adres *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Bijvoorbeeld: Hoofdstraat 123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Stad *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Bijvoorbeeld: Amsterdam"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Bijvoorbeeld: +31 20 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Bijvoorbeeld: https://www.restaurant.nl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Vertel iets over je restaurant..."
              rows={4}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Toevoegen...
              </>
            ) : (
              "Restaurant Toevoegen"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddRestaurantForm;
