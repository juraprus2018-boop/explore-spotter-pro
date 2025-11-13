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
  email: z.string().email("Ongeldig e-mailadres"),
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
    email: "",
    phone: "",
    website: "",
    description: "",
  });
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    display_name: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLocationSearch = async (query: string) => {
    setLocationQuery(query);
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `addressdetails=1&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleSelectLocation = (location: any) => {
    setSelectedLocation({
      display_name: location.display_name,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
    });
    setLocationQuery(location.display_name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate location selection
    if (!selectedLocation) {
      toast({
        title: "Locatie vereist",
        description: "Selecteer een locatie uit de suggesties.",
        variant: "destructive",
      });
      return;
    }

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

      // For user-submitted restaurants, we create an entry with proper location data
      const newRestaurant = {
        name: formData.name,
        display_name: selectedLocation.display_name,
        place_id: Date.now() * -1, // Negative ID for user-submitted
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        type: "restaurant",
        user_submitted: true,
        owner_id: user.id,
        owner_email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        description: formData.description || null,
        status: 'pending',
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert(newRestaurant)
        .select()
        .single();

      if (error) throw error;

      // Send notification email
      try {
        await supabase.functions.invoke('notify-restaurant-added', {
          body: {
            email: formData.email,
            restaurantName: formData.name,
            address: selectedLocation.display_name,
          },
        });
      } catch (emailError) {
        console.error("Error sending notification email:", emailError);
        // Don't fail the whole operation if email fails
      }

      toast({
        title: "Restaurant toegevoegd!",
        description: "Je ontvangt een e-mail met verdere instructies. Het restaurant wordt zichtbaar na goedkeuring.",
      });

      // Clear form and navigate
      setFormData({
        name: "",
        email: "",
        phone: "",
        website: "",
        description: "",
      });
      setSelectedLocation(null);
      setLocationQuery("");
      
      navigate(`/${lang}`);

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
            <Label htmlFor="name">Restaurant naam *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Bijv. De Gouden Leeuw"
              required
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="location">Adres en stad *</Label>
            <Input
              id="location"
              value={locationQuery}
              onChange={(e) => handleLocationSearch(e.target.value)}
              onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Zoek adres of stad..."
              required
              className={selectedLocation ? "border-green-500" : ""}
            />
            {showSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                {locationSuggestions.map((location, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectLocation(location)}
                    className="w-full text-left px-4 py-2 hover:bg-accent text-sm"
                  >
                    {location.display_name}
                  </button>
                ))}
              </div>
            )}
            {selectedLocation && (
              <p className="text-xs text-green-600">✓ Locatie geselecteerd</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jouw@email.nl"
              required
            />
            <p className="text-xs text-muted-foreground">
              Je ontvangt een bevestiging op dit adres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Bijv. +31 20 1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Bijv. https://www.restaurant.nl"
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
