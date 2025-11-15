import { useEffect } from "react";
import { generateSitemap } from "@/lib/sitemap";

const Sitemap = () => {
  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const sitemapXml = await generateSitemap();
        
        // Create a blob with the XML content
        const blob = new Blob([sitemapXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Replace current page with XML content
        window.location.replace(url);
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };
    
    loadSitemap();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Generating Sitemap...</h1>
        <p>Please wait while we generate your sitemap.xml</p>
      </div>
    </div>
  );
};

export default Sitemap;
