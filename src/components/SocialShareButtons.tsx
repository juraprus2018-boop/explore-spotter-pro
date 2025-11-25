import { Share2, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SocialShareButtonsProps {
  restaurantName: string;
  restaurantUrl: string;
}

export const SocialShareButtons = ({ restaurantName, restaurantUrl }: SocialShareButtonsProps) => {
  const shareText = `Bekijk ${restaurantName} op EatNavigator`;
  const fullUrl = `${window.location.origin}${restaurantUrl}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: restaurantName,
          text: shareText,
          url: fullUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link gekopieerd",
      description: "De link is naar je klembord gekopieerd",
    });
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Delen
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="mr-2 h-4 w-4" />
          Link kopiëren
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn}>
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
