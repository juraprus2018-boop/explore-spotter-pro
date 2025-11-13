import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

interface Restaurant {
  name: string;
  display_name: string;
  place_id: number;
  lat: number;
  lon: number;
  cuisine?: string;
  type?: string;
}

interface CityStructuredDataProps {
  cityName: string;
  provinceName: string;
  restaurants: Restaurant[];
}

const CityStructuredData = ({ cityName, provinceName, restaurants }: CityStructuredDataProps) => {
  const { lang, province, city } = useParams();
  const currentLang = lang || 'nl';

  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Restaurants in ${cityName}`,
    "description": `Complete list of restaurants in ${cityName}, ${provinceName}`,
    "numberOfItems": restaurants.length,
    "itemListElement": restaurants.slice(0, 20).map((restaurant, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Restaurant",
        "@id": `https://www.eatnavigator.com/${currentLang}/${province}/${city}/${restaurant.place_id}`,
        "name": restaurant.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": restaurant.display_name,
          "addressLocality": cityName,
          "addressRegion": provinceName,
          "addressCountry": "NL"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": restaurant.lat,
          "longitude": restaurant.lon
        },
        "servesCuisine": restaurant.cuisine || restaurant.type || "Restaurant"
      }
    }))
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
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": provinceName,
        "item": `https://www.eatnavigator.com/${currentLang}/${province}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cityName,
        "item": `https://www.eatnavigator.com/${currentLang}/${province}/${city}`
      }
    ]
  };

  const placeData = {
    "@context": "https://schema.org",
    "@type": "City",
    "name": cityName,
    "containedInPlace": {
      "@type": "AdministrativeArea",
      "name": provinceName,
      "addressCountry": "NL"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(itemListData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(placeData)}
      </script>
    </Helmet>
  );
};

export default CityStructuredData;
