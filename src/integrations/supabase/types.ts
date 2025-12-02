export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          province_id: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          province_id: string
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          province_id?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      foodwall_posts: {
        Row: {
          author: string
          created_at: string
          description: string | null
          id: string
          image_urls: string[] | null
          likes: number | null
          location: string
          tags: string[] | null
        }
        Insert: {
          author: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          location: string
          tags?: string[] | null
        }
        Update: {
          author?: string
          created_at?: string
          description?: string | null
          id?: string
          image_urls?: string[] | null
          likes?: number | null
          location?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city_name: string | null
          country_code: string | null
          created_at: string
          id: string
          ip_address: string | null
          page_url: string
          user_agent: string | null
        }
        Insert: {
          city_name?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          page_url: string
          user_agent?: string | null
        }
        Update: {
          city_name?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          page_url?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      provinces: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "provinces_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_suggestions: {
        Row: {
          created_at: string | null
          current_value: string | null
          description: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          photos: string[] | null
          restaurant_id: string
          status: string | null
          suggested_value: string | null
          suggestion_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          photos?: string[] | null
          restaurant_id: string
          status?: string | null
          suggested_value?: string | null
          suggestion_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: string | null
          description?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          photos?: string[] | null
          restaurant_id?: string
          status?: string | null
          suggested_value?: string | null
          suggestion_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_suggestions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          accepts_reservations: string | null
          accessibility_details: Json | null
          address_type: string | null
          air_conditioning: string | null
          amenity: string | null
          brand: string | null
          building: string | null
          capacity: number | null
          city_id: string | null
          claim_status: string | null
          claimed_at: string | null
          contact_info: Json | null
          created_at: string | null
          cuisine: string | null
          cuisine_details: Json | null
          delivery: string | null
          description: string | null
          diet_options: Json | null
          display_name: string
          extratags: Json | null
          id: string
          internet_access: string | null
          lat: number
          lon: number
          name: string
          opening_hours: Json | null
          operator: string | null
          osm_id: number | null
          osm_type: string | null
          outdoor_seating: string | null
          outdoor_seating_details: string | null
          owner_email: string | null
          owner_id: string | null
          parking: string | null
          payment_options: Json | null
          phone: string | null
          photos: string[] | null
          place_id: number
          price_range: number | null
          reservation: string | null
          search_count: number | null
          smoking: string | null
          stars: string | null
          start_date: string | null
          status: string | null
          takeaway: string | null
          type: string | null
          updated_at: string | null
          user_submitted: boolean | null
          verification_documents: string[] | null
          verification_note: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
          wheelchair: string | null
        }
        Insert: {
          accepts_reservations?: string | null
          accessibility_details?: Json | null
          address_type?: string | null
          air_conditioning?: string | null
          amenity?: string | null
          brand?: string | null
          building?: string | null
          capacity?: number | null
          city_id?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          contact_info?: Json | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_details?: Json | null
          delivery?: string | null
          description?: string | null
          diet_options?: Json | null
          display_name: string
          extratags?: Json | null
          id?: string
          internet_access?: string | null
          lat: number
          lon: number
          name: string
          opening_hours?: Json | null
          operator?: string | null
          osm_id?: number | null
          osm_type?: string | null
          outdoor_seating?: string | null
          outdoor_seating_details?: string | null
          owner_email?: string | null
          owner_id?: string | null
          parking?: string | null
          payment_options?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id: number
          price_range?: number | null
          reservation?: string | null
          search_count?: number | null
          smoking?: string | null
          stars?: string | null
          start_date?: string | null
          status?: string | null
          takeaway?: string | null
          type?: string | null
          updated_at?: string | null
          user_submitted?: boolean | null
          verification_documents?: string[] | null
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          wheelchair?: string | null
        }
        Update: {
          accepts_reservations?: string | null
          accessibility_details?: Json | null
          address_type?: string | null
          air_conditioning?: string | null
          amenity?: string | null
          brand?: string | null
          building?: string | null
          capacity?: number | null
          city_id?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          contact_info?: Json | null
          created_at?: string | null
          cuisine?: string | null
          cuisine_details?: Json | null
          delivery?: string | null
          description?: string | null
          diet_options?: Json | null
          display_name?: string
          extratags?: Json | null
          id?: string
          internet_access?: string | null
          lat?: number
          lon?: number
          name?: string
          opening_hours?: Json | null
          operator?: string | null
          osm_id?: number | null
          osm_type?: string | null
          outdoor_seating?: string | null
          outdoor_seating_details?: string | null
          owner_email?: string | null
          owner_id?: string | null
          parking?: string | null
          payment_options?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id?: number
          price_range?: number | null
          reservation?: string | null
          search_count?: number | null
          smoking?: string | null
          stars?: string | null
          start_date?: string | null
          status?: string | null
          takeaway?: string | null
          type?: string | null
          updated_at?: string | null
          user_submitted?: boolean | null
          verification_documents?: string[] | null
          verification_note?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          wheelchair?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          ip_address: string | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          photos: string[] | null
          rating: number
          restaurant_id: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          photos?: string[] | null
          rating: number
          restaurant_id: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          photos?: string[] | null
          rating?: number
          restaurant_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
