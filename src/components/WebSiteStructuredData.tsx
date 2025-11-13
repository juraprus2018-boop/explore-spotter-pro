import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

const WebSiteStructuredData = () => {
  const { lang } = useParams();
  const currentLang = lang || 'nl';

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://www.eatnavigator.com/#website",
    "name": "EatNavigator",
    "alternateName": "Eat Navigator",
    "url": `https://www.eatnavigator.com/${currentLang}`,
    "description": "Find and discover the best restaurants worldwide with interactive maps, reviews, and detailed information",
    "publisher": {
      "@type": "Organization",
      "@id": "https://www.eatnavigator.com/#organization",
      "name": "EatNavigator",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.eatnavigator.com/favicon.png",
        "width": 512,
        "height": 512
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://www.eatnavigator.com/${currentLang}?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": [
      "nl", "en", "de", "fr", "es", "it", "pt", "pl", "hr", "ru",
      "ja", "zh", "ar", "tr", "sv", "da", "no", "fi", "cs", "ro"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.eatnavigator.com/#organization",
    "name": "EatNavigator",
    "url": "https://www.eatnavigator.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.eatnavigator.com/favicon.png",
      "width": 512,
      "height": 512
    },
    "description": "Your global guide to discovering the best restaurants",
    "foundingDate": "2024",
    "sameAs": [
      "https://www.facebook.com/eatnavigator",
      "https://www.instagram.com/eatnavigator",
      "https://twitter.com/eatnavigator"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": [
        "Dutch", "English", "German", "French", "Spanish", "Italian",
        "Portuguese", "Polish", "Croatian", "Russian", "Japanese",
        "Chinese", "Arabic", "Turkish", "Swedish", "Danish", "Norwegian",
        "Finnish", "Czech", "Romanian"
      ]
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://www.eatnavigator.com/${currentLang}`
      }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
    </Helmet>
  );
};

export default WebSiteStructuredData;
