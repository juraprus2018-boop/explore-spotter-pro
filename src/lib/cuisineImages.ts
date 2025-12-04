// Cuisine-based placeholder images using Unsplash
const cuisineImageMap: Record<string, string> = {
  // Italian
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  italian: 'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=800&q=80',
  pasta: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
  
  // Asian
  chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80',
  japanese: 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800&q=80',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
  thai: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
  vietnamese: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
  korean: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&q=80',
  indian: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
  
  // Middle Eastern / Mediterranean
  kebab: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  turkish: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  greek: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  lebanese: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80',
  mediterranean: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  
  // American / Fast Food
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
  american: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
  fast_food: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
  
  // Mexican
  mexican: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  
  // French
  french: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  
  // Seafood
  seafood: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  
  // Steakhouse / BBQ
  steak: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
  barbecue: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80',
  grill: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
  
  // Cafe / Breakfast
  cafe: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  coffee: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  
  // Dutch / Regional
  dutch: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  indonesian: 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=800&q=80',
  surinamese: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80',
  
  // Ice Cream / Dessert
  ice_cream: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  
  // Regional European
  spanish: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&q=80',
  german: 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=800&q=80',
  polish: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&q=80',
};

// Default placeholder for unknown cuisines
const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

export const getCuisineImage = (cuisine: string | null | undefined): string => {
  if (!cuisine) return defaultImage;
  
  const normalizedCuisine = cuisine.toLowerCase().replace(/[_\s-]+/g, '_');
  
  // Direct match
  if (cuisineImageMap[normalizedCuisine]) {
    return cuisineImageMap[normalizedCuisine];
  }
  
  // Partial match - check if cuisine contains any known key
  for (const [key, url] of Object.entries(cuisineImageMap)) {
    if (normalizedCuisine.includes(key) || key.includes(normalizedCuisine)) {
      return url;
    }
  }
  
  return defaultImage;
};

export const getDefaultRestaurantImage = (): string => defaultImage;
