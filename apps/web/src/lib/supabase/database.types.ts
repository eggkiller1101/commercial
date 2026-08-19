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
      article_categories: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          slug: string;
          sort_order: number;
          type: string;
        };
        Insert: Partial<Database["public"]["Tables"]["article_categories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["article_categories"]["Row"]>;
        Relationships: [];
      };
      articles: {
        Row: {
          author: string | null;
          category_id: number | null;
          content: string | null;
          cover_image_url: string | null;
          created_at: string;
          created_by: number | null;
          id: number;
          published_at: string | null;
          search_vector: unknown | null;
          seo_description: string | null;
          seo_title: string | null;
          slug: string;
          status: "draft" | "published" | "archived";
          summary: string | null;
          title: string;
          updated_at: string;
          view_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
        Relationships: [];
      };
      attribute_definitions: {
        Row: {
          category_id: number | null;
          code: string;
          created_at: string;
          data_type: "text" | "number" | "enum";
          id: number;
          is_filterable: boolean;
          name: string;
          sort_order: number;
          unit: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["attribute_definitions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["attribute_definitions"]["Row"]>;
        Relationships: [];
      };
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
      subcategories: {
        Row: {
          category_id: number;
          created_at: string;
          id: number;
          is_active: boolean;
          name: string;
          slug: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subcategories"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["subcategories"]["Row"]>;
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
          quote_file_url: string | null;
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
      product_attribute_values: {
        Row: {
          attribute_definition_id: number;
          id: number;
          product_id: number;
          value_number: number | null;
          value_text: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["product_attribute_values"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_attribute_values"]["Row"]>;
        Relationships: [];
      };
      products: {
        Row: {
          application_notes: string | null;
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
          status: "published" | "unpublished";
          subcategory_id: number | null;
          summary: string | null;
          updated_at: string;
          view_count: number;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          created_at: string;
          extra_attributes: Json | null;
          id: number;
          is_active: boolean;
          product_id: number;
          sku: string;
          sort_order: number;
          variant_name: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
        Relationships: [];
      };
      product_documents: {
        Row: {
          document_id: number;
          product_id: number;
        };
        Insert: Partial<Database["public"]["Tables"]["product_documents"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_documents"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
