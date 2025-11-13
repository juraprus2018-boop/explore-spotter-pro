import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit, Loader2, Upload, X } from "lucide-react";

interface SuggestChangeDialogProps {
  restaurantId: string;
  restaurantName: string;
}

type SuggestionType = 'address' | 'phone' | 'website' | 'hours' | 'photos' | 'other';

const SuggestChangeDialog = ({ restaurantId, restaurantName }: SuggestChangeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('other');
  const [currentValue, setCurrentValue] = useState('');
  const [suggestedValue, setSuggestedValue] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 5) {
      toast({
        title: t('error'),
        description: "Maximum 5 foto's toegestaan",
        variant: "destructive",
      });
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!suggestedValue && photos.length === 0) {
      toast({
        title: t('error'),
        description: "Vul een suggestie in of upload foto's",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedPhotoUrls: string[] = [];

      // Upload photos
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${restaurantId}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('suggestion-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('suggestion-photos')
          .getPublicUrl(fileName);
        
        uploadedPhotoUrls.push(publicUrl);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Save suggestion
      const { error } = await (supabase as any)
        .from('restaurant_suggestions')
        .insert({
          restaurant_id: restaurantId,
          user_id: user?.id,
          suggestion_type: suggestionType,
          current_value: currentValue,
          suggested_value: suggestedValue,
          description: description,
          photos: uploadedPhotoUrls,
        });

      if (error) throw error;

      toast({
        title: "Suggestie verstuurd",
        description: "Bedankt voor je suggestie! Deze wordt beoordeeld door onze moderators.",
      });

      // Reset form
      setOpen(false);
      setSuggestionType('other');
      setCurrentValue('');
      setSuggestedValue('');
      setDescription('');
      setPhotos([]);
      setPhotoUrls([]);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: t('error'),
        description: "Er ging iets mis bij het versturen van je suggestie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Wijziging voorstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Wijziging voorstellen voor {restaurantName}</DialogTitle>
          <DialogDescription>
            Heb je een verkeerd adres gezien of wil je foto's toevoegen? Laat het ons weten!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="type">Type wijziging</Label>
            <Select value={suggestionType} onValueChange={(value) => setSuggestionType(value as SuggestionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="address">Adres</SelectItem>
                <SelectItem value="phone">Telefoonnummer</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="hours">Openingstijden</SelectItem>
                <SelectItem value="photos">Foto's toevoegen</SelectItem>
                <SelectItem value="other">Anders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {suggestionType !== 'photos' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="current">Huidige waarde (optioneel)</Label>
                <Input
                  id="current"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="Bijv. het huidige adres"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="suggested">Voorgestelde waarde</Label>
                <Input
                  id="suggested"
                  value={suggestedValue}
                  onChange={(e) => setSuggestedValue(e.target.value)}
                  placeholder="Bijv. het correcte adres"
                />
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="description">Toelichting (optioneel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Extra uitleg over je suggestie"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Foto's (max 5)</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="h-20 w-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-accent">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Versturen...
              </>
            ) : (
              'Versturen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuggestChangeDialog;
