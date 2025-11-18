import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { downloadSitemap } from "@/lib/sitemap";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SitemapGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await downloadSitemap();
      toast({
        title: "Sitemaps gegenereerd",
        description:
          "Er is een sitemap-index plus meerdere gesplitste sitemap-bestanden gedownload. Upload alle bestanden naar je server zodat de verwijzingen kloppen.",
      });
    } catch (error) {
      console.error('Sitemap generation error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het genereren van de sitemap: " + (error instanceof Error ? error.message : 'Onbekende fout'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sitemap Generator</CardTitle>
        <CardDescription>
          Genereer een sitemap-index met verwijzingen naar automatisch opgesplitste sitemap-bestanden (maximaal 45.000 URLs per
          bestand) inclusief alle hreflang tags voor 20 talen. Alle bestanden worden direct gedownload zodat je ze stuk voor
          stuk naar je server kunt uploaden.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleDownload} disabled={isGenerating} size="lg">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Genereren...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download sitemaps
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SitemapGenerator;
