import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClaimRestaurantDialogProps {
  restaurantId: string;
  restaurantName: string;
  onClaimed: () => void;
}

const ClaimRestaurantDialog = ({ restaurantId, restaurantName, onClaimed }: ClaimRestaurantDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Niet ingelogd",
          description: "Log in om een restaurant te claimen",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // Check if user already has a claimed restaurant
      const { data: existingClaim } = await (supabase as any)
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (existingClaim) {
        toast({
          title: "Fout bij claimen",
          description: "Je hebt al een restaurant geclaimd",
          variant: "destructive",
        });
        setOpen(false);
        return;
      }

      const { error: updateError } = await (supabase as any)
        .from('restaurants')
        .update({
          owner_id: user.id,
          claimed_at: new Date().toISOString(),
          claim_status: 'pending',
        })
        .eq('id', restaurantId);

      if (updateError) throw updateError;

      toast({
        title: "Claim ingediend",
        description: "Je claim wordt beoordeeld door een administrator. Je ontvangt bericht zodra deze is goedgekeurd.",
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <CheckCircle className="h-4 w-4 mr-2" />
          Restaurant claimen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Claim {restaurantName}</AlertDialogTitle>
          <AlertDialogDescription>
            Wil je dit restaurant claimen? Je claim wordt door een administrator beoordeeld. 
            Na goedkeuring kun je restaurant gegevens wijzigen in je dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Annuleren</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Bezig...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Claim indienen
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ClaimRestaurantDialog;
