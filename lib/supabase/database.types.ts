export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          created_at: string;
          id: string;
          organization_id: string;
          role: "designer" | "admin" | "owner";
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          organization_id: string;
          role?: "designer" | "admin" | "owner";
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          organization_id?: string;
          role?: "designer" | "admin" | "owner";
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          default_organization_id: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_organization_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_organization_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          client_name: string | null;
          created_at: string;
          designer_name: string | null;
          id: string;
          name: string;
          organization_id: string;
          owner_id: string;
          room_name: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          client_name?: string | null;
          created_at?: string;
          designer_name?: string | null;
          id?: string;
          name: string;
          organization_id: string;
          owner_id: string;
          room_name?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          client_name?: string | null;
          created_at?: string;
          designer_name?: string | null;
          id?: string;
          name?: string;
          organization_id?: string;
          owner_id?: string;
          room_name?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moodboards: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          project_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id?: string;
          project_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          project_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      moodboard_pages: {
        Row: {
          canvas_json: Json;
          created_at: string;
          fixed: boolean;
          id: string;
          moodboard_id: string;
          page_type: string;
          schema_version: number;
          sort_order: number;
          title: string;
          updated_at: string;
          version: number;
        };
        Insert: {
          canvas_json?: Json;
          created_at?: string;
          fixed?: boolean;
          id?: string;
          moodboard_id: string;
          page_type: string;
          schema_version?: number;
          sort_order: number;
          title: string;
          updated_at?: string;
          version?: number;
        };
        Update: {
          canvas_json?: Json;
          created_at?: string;
          fixed?: boolean;
          id?: string;
          moodboard_id?: string;
          page_type?: string;
          schema_version?: number;
          sort_order?: number;
          title?: string;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      products: {
        Row: {
          category: string | null;
          color: string | null;
          created_at: string;
          created_by: string | null;
          dimensions_text: string | null;
          id: string;
          image_storage_path: string | null;
          image_url: string | null;
          is_active: boolean;
          name: string;
          organization_id: string;
          price_text: string | null;
          product_url: string | null;
          source: "csv" | "manual" | "feed";
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          dimensions_text?: string | null;
          id?: string;
          image_storage_path?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          organization_id: string;
          price_text?: string | null;
          product_url?: string | null;
          source?: "csv" | "manual" | "feed";
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          color?: string | null;
          created_at?: string;
          created_by?: string | null;
          dimensions_text?: string | null;
          id?: string;
          image_storage_path?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          organization_id?: string;
          price_text?: string | null;
          product_url?: string | null;
          source?: "csv" | "manual" | "feed";
          updated_at?: string;
        };
        Relationships: [];
      };
      paint_colors: {
        Row: {
          code: string;
          created_at: string;
          hex: string | null;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          hex?: string | null;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          hex?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
