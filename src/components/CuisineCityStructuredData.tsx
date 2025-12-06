import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

interface Restaurant {
  name: string;
  display_name: string;
  place_id: number;
  lat: number;
  lon: number;
  cuisine?: string | null;
  type?: string | null;
}

interface CuisineCityStructuredDataProps {
  cuisineName: string;
  cityName: string;
  provinceName: string;
  restaurants: Restaurant[];
}

const CuisineCityStructuredData = ({
  cuisineName,
  cityName,
  provinceName,
  restaurants,
}: CuisineCityStructuredDataProps) => {
  const { lang, province, city, cuisine } = useParams();
  const currentLang = lang || "nl";

  const itemListData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cuisineName} restaurants in ${cityName}`,
    description: `Complete list of ${cuisineName} restaurants in ${cityName}, ${provinceName}`,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.slice(0, 20).map((restaurant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Restaurant",
        "@id": `https://www.eatnavigator.com/${currentLang}/${province}/${city}/${restaurant.place_id}`,
        name: restaurant.name,
        servesCuisine: cuisineName,
        address: {
          "@type": "PostalAddress",
          streetAddress: restaurant.display_name,
          addressLocality: cityName,
          addressRegion: provinceName,
          addressCountry: "NL",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: restaurant.lat,
          longitude: restaurant.lon,
        },
      },
    })),
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://www.eatnavigator.com/${currentLang}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: provinceName,
        item: `https://www.eatnavigator.com/${currentLang}/${province}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cityName,
        item: `https://www.eatnavigator.com/${currentLang}/${province}/${city}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${cuisineName} restaurants`,
        item: `https://www.eatnavigator.com/${currentLang}/${province}/${city}/cuisine/${cuisine}`,
      },
    ],
  };

  const foodEstablishmentData = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: `${cuisineName} restaurants in ${cityName}`,
    description: `Find the best ${cuisineName} restaurants in ${cityName}, ${provinceName}`,
    servesCuisine: cuisineName,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressRegion: provinceName,
      addressCountry: "NL",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(itemListData)}</script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(foodEstablishmentData)}
      </script>
    </Helmet>
  );
};

export default CuisineCityStructuredData;
