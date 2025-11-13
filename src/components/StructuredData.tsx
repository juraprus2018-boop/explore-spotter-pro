import { Helmet } from "react-helmet";

interface Review {
  rating: number;
  comment: string | null;
  created_at: string;
  photos: string[] | null;
  user_email?: string;
}

interface StructuredDataProps {
  restaurant: {
    name: string;
    display_name: string;
    lat: number;
    lon: number;
    type?: string;
  };
  reviews: Review[];
  averageRating: number;
}

const StructuredData = ({ restaurant, reviews, averageRating }: StructuredDataProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.display_name,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": restaurant.lat,
      "longitude": restaurant.lon,
    },
    "servesCuisine": restaurant.type || "Restaurant",
    ...(reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": reviews.length,
        "bestRating": "5",
        "worstRating": "1",
      },
      "review": reviews.map((review) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1",
        },
        "author": {
          "@type": "Person",
          "name": review.user_email?.split('@')[0] || "Anonieme gebruiker",
        },
        "datePublished": review.created_at,
        ...(review.comment && { "reviewBody": review.comment }),
        ...(review.photos && review.photos.length > 0 && { "image": review.photos }),
      })),
    }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
