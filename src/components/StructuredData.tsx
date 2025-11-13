import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

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
    cuisine?: string;
    phone?: string;
    website?: string;
    opening_hours?: any;
    description?: string;
    photos?: string[];
    wheelchair?: string;
    outdoor_seating?: string;
    takeaway?: string;
    delivery?: string;
    payment_options?: any;
    diet_options?: any;
  };
  reviews: Review[];
  averageRating: number;
}

const StructuredData = ({ restaurant, reviews, averageRating }: StructuredDataProps) => {
  const { lang } = useParams();
  
  // Parse opening hours if available
  const openingHours = restaurant.opening_hours 
    ? (typeof restaurant.opening_hours === 'string' 
        ? (restaurant.opening_hours.trim().startsWith('{') || restaurant.opening_hours.trim().startsWith('[')
            ? JSON.parse(restaurant.opening_hours)
            : null) // Plain text opening hours string, skip structured data
        : restaurant.opening_hours)
    : null;

  // Build opening hours specification for schema.org
  const openingHoursSpecification = openingHours ? Object.entries(openingHours).map(([day, hours]: [string, any]) => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": day.charAt(0).toUpperCase() + day.slice(1),
    "opens": hours.open || "09:00",
    "closes": hours.close || "22:00",
  })) : [];

  // Determine price range based on cuisine or default
  const priceRange = "€€";

  // Build payment methods
  const paymentMethods: string[] = [];
  if (restaurant.payment_options) {
    const paymentOptions = typeof restaurant.payment_options === 'string' 
      ? JSON.parse(restaurant.payment_options) 
      : restaurant.payment_options;
    
    if (paymentOptions.cash) paymentMethods.push("Cash");
    if (paymentOptions.credit_card) paymentMethods.push("Credit Card");
    if (paymentOptions.debit_card) paymentMethods.push("Debit Card");
  }

  // Build features list
  const amenityFeatures: any[] = [];
  if (restaurant.wheelchair === "yes") {
    amenityFeatures.push({
      "@type": "LocationFeatureSpecification",
      "name": "Wheelchair Accessible",
      "value": true
    });
  }
  if (restaurant.outdoor_seating === "yes") {
    amenityFeatures.push({
      "@type": "LocationFeatureSpecification",
      "name": "Outdoor Seating",
      "value": true
    });
  }
  if (restaurant.takeaway === "yes") {
    amenityFeatures.push({
      "@type": "LocationFeatureSpecification",
      "name": "Takeaway Available",
      "value": true
    });
  }
  if (restaurant.delivery === "yes") {
    amenityFeatures.push({
      "@type": "LocationFeatureSpecification",
      "name": "Delivery Available",
      "value": true
    });
  }

  // Build menu information from diet options
  const menuItems: any[] = [];
  if (restaurant.diet_options) {
    const dietOptions = typeof restaurant.diet_options === 'string' 
      ? JSON.parse(restaurant.diet_options) 
      : restaurant.diet_options;
    
    if (dietOptions.vegetarian === "yes") {
      menuItems.push({
        "@type": "MenuItem",
        "name": "Vegetarian Options",
        "description": "Vegetarian dishes available"
      });
    }
    if (dietOptions.vegan === "yes") {
      menuItems.push({
        "@type": "MenuItem",
        "name": "Vegan Options",
        "description": "Vegan dishes available"
      });
    }
    if (dietOptions.gluten_free === "yes") {
      menuItems.push({
        "@type": "MenuItem",
        "name": "Gluten-Free Options",
        "description": "Gluten-free dishes available"
      });
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `https://www.eatnavigator.com/${lang}/${restaurant.name.toLowerCase().replace(/\s+/g, '-')}`,
    "name": restaurant.name,
    "description": restaurant.description || `${restaurant.name} - Restaurant in ${restaurant.display_name}`,
    "image": restaurant.photos && restaurant.photos.length > 0 
      ? restaurant.photos 
      : ["https://www.eatnavigator.com/favicon.png"],
    "logo": "https://www.eatnavigator.com/favicon.png",
    "url": typeof window !== 'undefined' ? window.location.href : `https://www.eatnavigator.com/${lang}`,
    "telephone": restaurant.phone || undefined,
    "priceRange": priceRange,
    "servesCuisine": restaurant.cuisine || restaurant.type || "International",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": restaurant.display_name,
      "addressCountry": "NL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": restaurant.lat,
      "longitude": restaurant.lon,
    },
    ...(restaurant.website && { "url": restaurant.website }),
    ...(openingHoursSpecification.length > 0 && { "openingHoursSpecification": openingHoursSpecification }),
    ...(paymentMethods.length > 0 && { "paymentAccepted": paymentMethods.join(", ") }),
    ...(amenityFeatures.length > 0 && { "amenityFeature": amenityFeatures }),
    ...(menuItems.length > 0 && { 
      "hasMenu": {
        "@type": "Menu",
        "hasMenuItem": menuItems
      }
    }),
    ...(reviews.length > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": averageRating.toFixed(1),
        "reviewCount": reviews.length,
        "bestRating": "5",
        "worstRating": "1",
      },
      "review": reviews.slice(0, 10).map((review) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1",
        },
        "author": {
          "@type": "Person",
          "name": review.user_email?.split('@')[0] || "Anonymous User",
        },
        "datePublished": review.created_at,
        ...(review.comment && { "reviewBody": review.comment }),
        ...(review.photos && review.photos.length > 0 && { "image": review.photos }),
      })),
    }),
  };

  // Add organization/provider info
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EatNavigator",
    "url": "https://www.eatnavigator.com",
    "logo": "https://www.eatnavigator.com/favicon.png",
    "description": "Find the best restaurants worldwide with EatNavigator",
    "sameAs": [
      "https://www.facebook.com/eatnavigator",
      "https://www.instagram.com/eatnavigator",
      "https://twitter.com/eatnavigator"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;
