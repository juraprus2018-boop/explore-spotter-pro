import { supabase } from "@/integrations/supabase/client";

export const toggleFavorite = async (restaurantId: string, userId: string) => {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, restaurant_id: restaurantId });
    
    if (error) throw error;
    return true;
  }
};

export const isFavorited = async (restaurantId: string, userId: string) => {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId)
    .single();

  return !!data;
};

export const getUserFavorites = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      restaurant_id,
      restaurants (*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};
