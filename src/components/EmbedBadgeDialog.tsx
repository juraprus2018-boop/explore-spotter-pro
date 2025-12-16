import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Copy, Check, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmbedBadgeDialogProps {
  restaurantName: string;
  placeId: number;
  averageRating: number;
  reviewCount: number;
  province?: string;
  city?: string;
  lang?: string;
}

const EmbedBadgeDialog = ({
  restaurantName,
  placeId,
  averageRating,
  reviewCount,
  province,
  city,
  lang = "nl",
}: EmbedBadgeDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<"light" | "dark">("light");

  const baseUrl = "https://www.eatnavigator.com";
  const restaurantUrl = `${baseUrl}/${lang}/${province}/${city}/${placeId}`;
  
  const displayRating = averageRating > 0 ? averageRating.toFixed(1) : "–";
  const stars = averageRating > 0 ? Math.round(averageRating) : 0;

  const embedCode = `<!-- EatNavigator Badge -->
<div id="eatnavigator-badge-${placeId}" style="display:inline-block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <a href="${restaurantUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;display:block;">
    <div style="background:${selectedStyle === "light" ? "#ffffff" : "#1f2937"};border:1px solid ${selectedStyle === "light" ? "#e5e7eb" : "#374151"};border-radius:12px;padding:16px;min-width:200px;box-shadow:0 2px 8px rgba(0,0,0,0.08);transition:box-shadow 0.2s;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#26b99a"/>
          <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span style="font-size:11px;font-weight:600;color:${selectedStyle === "light" ? "#6b7280" : "#9ca3af"};text-transform:uppercase;letter-spacing:0.5px;">EatNavigator</span>
      </div>
      <div style="font-size:14px;font-weight:600;color:${selectedStyle === "light" ? "#1f2937" : "#f9fafb"};margin-bottom:8px;line-height:1.3;">${restaurantName}</div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:20px;font-weight:700;color:#26b99a;">${displayRating}</span>
        <div style="display:flex;gap:2px;">
          ${[1, 2, 3, 4, 5].map(i => `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i <= stars ? '#f59e0b' : (selectedStyle === 'light' ? '#e5e7eb' : '#374151')}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>`).join('')}
        </div>
        <span style="font-size:12px;color:${selectedStyle === "light" ? "#6b7280" : "#9ca3af"};">(${reviewCount})</span>
      </div>
      <div style="margin-top:10px;font-size:11px;color:#26b99a;display:flex;align-items:center;gap:4px;">
        <span>Bekijk op EatNavigator</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
      </div>
    </div>
  </a>
</div>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast({
        title: "Gekopieerd!",
        description: "De embed code is gekopieerd naar je klembord.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Kopiëren mislukt",
        description: "Probeer de code handmatig te selecteren en kopiëren.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Code className="h-4 w-4" />
          Badge voor website
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            EatNavigator Badge
          </DialogTitle>
          <DialogDescription>
            Plaats deze badge op je website om bezoekers te laten zien dat je op EatNavigator staat.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Style selector */}
          <div>
            <p className="text-sm font-medium mb-2">Kies een stijl:</p>
            <div className="flex gap-2">
              <Button
                variant={selectedStyle === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle("light")}
              >
                Light
              </Button>
              <Button
                variant={selectedStyle === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStyle("dark")}
              >
                Dark
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-medium mb-2">Voorbeeld:</p>
            <div className={`p-6 rounded-lg ${selectedStyle === "light" ? "bg-muted" : "bg-foreground"}`}>
              <div className="inline-block font-sans">
                <a href={restaurantUrl} target="_blank" rel="noopener noreferrer" className="no-underline block">
                  <div 
                    className="rounded-xl p-4 min-w-[200px] transition-shadow hover:shadow-lg"
                    style={{
                      background: selectedStyle === "light" ? "#ffffff" : "#1f2937",
                      border: `1px solid ${selectedStyle === "light" ? "#e5e7eb" : "#374151"}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span 
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: selectedStyle === "light" ? "#6b7280" : "#9ca3af" }}
                      >
                        EatNavigator
                      </span>
                    </div>
                    <div 
                      className="text-sm font-semibold mb-2 leading-tight"
                      style={{ color: selectedStyle === "light" ? "#1f2937" : "#f9fafb" }}
                    >
                      {restaurantName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-bold text-primary">{displayRating}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star 
                            key={i} 
                            className="w-4 h-4" 
                            fill={i <= stars ? "#f59e0b" : (selectedStyle === "light" ? "#e5e7eb" : "#374151")}
                            stroke="none"
                          />
                        ))}
                      </div>
                      <span 
                        className="text-xs"
                        style={{ color: selectedStyle === "light" ? "#6b7280" : "#9ca3af" }}
                      >
                        ({reviewCount})
                      </span>
                    </div>
                    <div className="mt-2.5 text-[11px] text-primary flex items-center gap-1">
                      <span>Bekijk op EatNavigator</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      </svg>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Embed code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Embed code:</p>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Gekopieerd
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Kopiëren
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={embedCode}
              readOnly
              className="font-mono text-xs h-[150px] resize-none"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Plak deze code in de HTML van je website waar je de badge wilt tonen. 
            De badge linkt automatisch naar je restaurantpagina op EatNavigator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedBadgeDialog;
