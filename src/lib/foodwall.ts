import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface FoodwallPost {
  id: string;
  images: string[];
  description: string;
  tags: string[];
  likes: number;
  author: string;
  location: string;
  createdAt: string;
}

export interface CreateFoodwallPostInput {
  description: string;
  tags: string[];
  files: File[];
  author: string;
  location: string;
}

type FoodwallRow = Database["public"]["Tables"]["foodwall_posts"]["Row"];

const FOODWALL_BUCKET = "foodwall-uploads";

const mapRowToPost = (row: FoodwallRow): FoodwallPost => ({
  id: row.id,
  images: row.image_urls ?? [],
  description: row.description ?? "",
  tags: row.tags ?? [],
  likes: row.likes ?? 0,
  author: row.author ?? "",
  location: row.location ?? "",
  createdAt: row.created_at ?? new Date().toISOString(),
});

const uploadFoodwallImage = async (file: File) => {
  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueSegment = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now();
  const filePath = `uploads/${timestamp}-${uniqueSegment}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(FOODWALL_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(FOODWALL_BUCKET).getPublicUrl(filePath);

  return publicUrl;
};

const uploadImages = async (files: File[]) => {
  if (!files.length) return [] as string[];
  const uploads = await Promise.all(files.map(uploadFoodwallImage));
  return uploads.filter(Boolean);
};

export const fetchFoodwallPosts = async (): Promise<FoodwallPost[]> => {
  const { data, error } = await supabase
    .from("foodwall_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(mapRowToPost);
};

export const createFoodwallPost = async (
  payload: CreateFoodwallPostInput,
): Promise<FoodwallPost> => {
  const imageUrls = await uploadImages(payload.files);

  const { data, error } = await supabase
    .from("foodwall_posts")
    .insert({
      description: payload.description || null,
      tags: payload.tags,
      likes: 0,
      author: payload.author,
      location: payload.location,
      image_urls: imageUrls,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error || new Error("Unable to create Foodwall post");
  }

  return mapRowToPost(data);
};

export const updateFoodwallLikes = async (
  postId: string,
  likes: number,
): Promise<FoodwallPost> => {
  const { data, error } = await supabase
    .from("foodwall_posts")
    .update({ likes })
    .eq("id", postId)
    .select("*")
    .single();

  if (error || !data) {
    throw error || new Error("Unable to update Foodwall post");
  }

  return mapRowToPost(data);
};
