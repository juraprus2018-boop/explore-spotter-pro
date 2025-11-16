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
        title: "Sitemap gegenereerd",
        description: "De volledige sitemap.xml met alle restaurants, cities en provinces is gedownload. Upload deze naar je server als public/sitemap.xml",
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
          Genereer een volledige sitemap.xml met alle restaurants, cities, provinces en hreflang tags voor alle 20 talen.
          Download het bestand en upload het naar je server als public/sitemap.xml
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
              Download Sitemap.xml
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SitemapGenerator;
