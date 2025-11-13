import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, ExternalLink } from "lucide-react";

interface Suggestion {
  id: string;
  restaurant_id: string;
  suggestion_type: string;
  current_value: string | null;
  suggested_value: string | null;
  description: string | null;
  photos: string[];
  status: string;
  created_at: string;
  moderation_note: string | null;
  restaurants: {
    name: string;
  };
}

const SuggestionModeration = () => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSuggestions();
  }, [activeTab]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('restaurant_suggestions')
        .select(`
          *,
          restaurants (
            name
          )
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: "Fout",
        description: "Kon suggesties niet laden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerate = async (suggestionId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from('restaurant_suggestions')
        .update({
          status: newStatus,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_note: moderationNotes[suggestionId] || null,
        })
        .eq('id', suggestionId);

      if (error) throw error;

      toast({
        title: newStatus === 'approved' ? "Goedgekeurd" : "Afgewezen",
        description: `Suggestie is ${newStatus === 'approved' ? 'goedgekeurd' : 'afgewezen'}`,
      });

      fetchSuggestions();
    } catch (error) {
      console.error('Error moderating suggestion:', error);
      toast({
        title: "Fout",
        description: "Kon suggestie niet modereren",
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      address: 'bg-blue-500',
      phone: 'bg-green-500',
      website: 'bg-purple-500',
      hours: 'bg-orange-500',
      photos: 'bg-pink-500',
      other: 'bg-gray-500',
    };
    return <Badge className={colors[type] || colors.other}>{type}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Te beoordelen</TabsTrigger>
          <TabsTrigger value="approved">Goedgekeurd</TabsTrigger>
          <TabsTrigger value="rejected">Afgewezen</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Geen suggesties gevonden
              </CardContent>
            </Card>
          ) : (
            suggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {suggestion.restaurants?.name || 'Onbekend restaurant'}
                      </CardTitle>
                      <CardDescription>
                        {getTypeBadge(suggestion.suggestion_type)} •{' '}
                        {new Date(suggestion.created_at).toLocaleDateString('nl-NL')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestion.current_value && (
                    <div>
                      <p className="text-sm font-medium">Huidige waarde:</p>
                      <p className="text-sm text-muted-foreground">{suggestion.current_value}</p>
                    </div>
                  )}
                  
                  {suggestion.suggested_value && (
                    <div>
                      <p className="text-sm font-medium">Voorgestelde waarde:</p>
                      <p className="text-sm">{suggestion.suggested_value}</p>
                    </div>
                  )}

                  {suggestion.description && (
                    <div>
                      <p className="text-sm font-medium">Toelichting:</p>
                      <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                    </div>
                  )}

                  {suggestion.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Foto's:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.photos.map((photo, index) => (
                          <a
                            key={index}
                            href={photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative group"
                          >
                            <img
                              src={photo}
                              alt={`Foto ${index + 1}`}
                              className="h-24 w-24 object-cover rounded border"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                              <ExternalLink className="h-6 w-6 text-white" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pending' && (
                    <div className="space-y-3 pt-4 border-t">
                      <Textarea
                        placeholder="Moderatie notitie (optioneel)"
                        value={moderationNotes[suggestion.id] || ''}
                        onChange={(e) =>
                          setModerationNotes({
                            ...moderationNotes,
                            [suggestion.id]: e.target.value,
                          })
                        }
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModerate(suggestion.id, 'approved')}
                          className="flex-1"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Goedkeuren
                        </Button>
                        <Button
                          onClick={() => handleModerate(suggestion.id, 'rejected')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Afwijzen
                        </Button>
                      </div>
                    </div>
                  )}

                  {suggestion.moderation_note && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium">Moderatie notitie:</p>
                      <p className="text-sm text-muted-foreground">{suggestion.moderation_note}</p>
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

export default SuggestionModeration;
