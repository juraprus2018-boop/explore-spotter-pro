import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClaimRestaurantDialogProps {
  restaurantId: string;
  restaurantName: string;
  onClaimed: () => void;
}

const ClaimRestaurantDialog = ({ restaurantId, restaurantName, onClaimed }: ClaimRestaurantDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments(Array.from(files).slice(0, 3));
    }
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      toast({
        title: "Documenten vereist",
        description: "Upload minimaal één verificatie document",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Je moet ingelogd zijn om een restaurant te claimen");
      }

      // Create verification-documents bucket if it doesn't exist
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(b => b.name === 'verification-documents');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('verification-documents', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
      }

      // Upload documents
      const documentUrls: string[] = [];
      for (const file of documents) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${restaurantId}/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('verification-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('verification-documents')
          .getPublicUrl(fileName);

        documentUrls.push(publicUrl);
      }

      // Update restaurant with claim
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          owner_id: user.id,
          claimed_at: new Date().toISOString(),
          claim_status: 'pending',
          verification_documents: documentUrls,
        })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      toast({
        title: "Claim ingediend",
        description: "Je claim wordt beoordeeld door een administrator",
      });

      setOpen(false);
      onClaimed();
    } catch (error: any) {
      console.error('Error claiming restaurant:', error);
      toast({
        title: "Fout bij claimen",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Restaurant claimen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim {restaurantName}</DialogTitle>
          <DialogDescription>
            Upload officiële documenten om te bewijzen dat je de eigenaar bent van dit restaurant
            (bijv. KVK uittreksel, zakelijke vergunning)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documents">
              Verificatie documenten (max 3, PDF/JPG/PNG)
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('documents')?.click()}
                className="w-full"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Selecteer documenten
              </Button>
              <input
                id="documents"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {documents.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {documents.length} document(en) geselecteerd
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || documents.length === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Bezig met uploaden...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Claim indienen
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimRestaurantDialog;
