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
      categories: {
        Row: {
          banner_image_url: string | null;
          created_at: string;
          description: string | null;
          icon_url: string | null;
          id: number;
          is_active: boolean;
          name: string;
          parent_id: number | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["categories"]["Row"]>;
        Relationships: [];
      };
      documents: {
        Row: {
          category_id: number | null;
          created_at: string;
          download_count: number;
          file_size_bytes: number | null;
          file_type: string;
          file_url: string;
          id: number;
          language: string;
          published_at: string | null;
          title: string;
          updated_at: string;
          version: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["documents"]["Row"]>;
        Relationships: [];
      };
      inquiries: {
        Row: {
          company: string | null;
          created_at: string;
          email: string | null;
          id: number;
          message: string | null;
          name: string;
          phone: string | null;
          product_id: number | null;
          status: "new" | "contacted" | "closed";
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inquiries"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Row"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          id: number;
          image_url: string;
          is_primary: boolean;
          product_id: number;
          sort_order: number;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          application_notes: string | null;
          category_id: number | null;
          created_at: string;
          created_by: number | null;
          description: string | null;
          id: number;
          is_featured: boolean;
          model_number: string;
          name: string;
          published_at: string | null;
          search_vector: unknown | null;
          seo_description: string | null;
          seo_keywords: string | null;
          seo_title: string | null;
          slug: string;
          status: "draft" | "published" | "archived";
          summary: string | null;
          updated_at: string;
          view_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
