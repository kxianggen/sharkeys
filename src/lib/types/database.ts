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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
