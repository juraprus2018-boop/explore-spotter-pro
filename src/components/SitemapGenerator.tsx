import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadSitemap } from "@/lib/sitemap";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const SitemapGenerator = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDownload = async () => {
    try {
      await downloadSitemap();
      toast({
        title: "Sitemap gegenereerd",
        description: "De sitemap.xml is gedownload",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het genereren van de sitemap",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Download Sitemap
    </Button>
  );
};

export default SitemapGenerator;
