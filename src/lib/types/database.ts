export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      keyboard_components: {
        Row: {
          id: string;
          category: string;
          name: string;
          brand: string;
          description: string | null;
          beginner_friendly: boolean;
          layouts: string[] | null;
          switch_technology: string | null;
          switch_technology_support: string[] | null;
          case_mount_support: string[] | null;
          pcb_mount_support: string[] | null;
          plate_mount_support: string[] | null;
          keycap_profile: string | null;
          keycap_layout_support: string[] | null;
          compatible_switch_technologies: string[] | null;
          stabilizer_type: string | null;
          stabilizer_type_support: string[] | null;
          supported_layouts: string[] | null;
          supported_stabilizer_sizes: string[] | null;
          connection: string | null;
          hotswap: boolean | null;
          pin_count: number | null;
          actuation_force_g: number | null;
          sound_profile: string | null;
          price: number | null;
          price_currency: string | null;
          vendor_url: string | null;
          image_url: string | null;
          sound_url: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          embedding: number[] | null;
        };
        Insert: {
          id: string;
          category: string;
          name: string;
          brand: string;
          description?: string | null;
          beginner_friendly?: boolean;
          layouts?: string[] | null;
          switch_technology?: string | null;
          switch_technology_support?: string[] | null;
          case_mount_support?: string[] | null;
          pcb_mount_support?: string[] | null;
          plate_mount_support?: string[] | null;
          keycap_profile?: string | null;
          keycap_layout_support?: string[] | null;
          compatible_switch_technologies?: string[] | null;
          stabilizer_type?: string | null;
          stabilizer_type_support?: string[] | null;
          supported_layouts?: string[] | null;
          supported_stabilizer_sizes?: string[] | null;
          connection?: string | null;
          hotswap?: boolean | null;
          pin_count?: number | null;
          actuation_force_g?: number | null;
          sound_profile?: string | null;
          price?: number | null;
          price_currency?: string | null;
          vendor_url?: string | null;
          image_url?: string | null;
          sound_url?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          embedding?: number[] | null;
        };
        Update: Partial<Database["public"]["Tables"]["keyboard_components"]["Insert"]>;
        Relationships: [];
      };
      component_sound_samples: {
        Row: {
          id: string;
          component_id: string;
          sound_profile: string;
          sound_url: string;
          source_name: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          component_id: string;
          sound_profile: string;
          sound_url: string;
          source_name?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["component_sound_samples"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "component_sound_samples_component_id_fkey";
            columns: ["component_id"];
            referencedRelation: "keyboard_components";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      build_posts: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string | null;
          component_ids: Json;
          validation_snapshot: Json | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description?: string | null;
          component_ids?: Json;
          validation_snapshot?: Json | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["build_posts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "build_posts_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string | null;
          body: string;
          is_keybot: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id?: string | null;
          body: string;
          is_keybot?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_comments"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey";
            columns: ["post_id"];
            referencedRelation: "build_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_components: {
        Args: {
          query_embedding: number[];
          match_count?: number;
          filter_category?: string | null;
        };
        Returns: Array<{
          id: string;
          similarity: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
