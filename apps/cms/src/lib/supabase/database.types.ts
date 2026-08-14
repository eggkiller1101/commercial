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
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "article_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "articles_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "admin_users";
            referencedColumns: ["id"];
          }
        ];
      };
      admin_users: {
        Row: {
          created_at: string;
          id: number;
          is_active: boolean;
          last_login_at: string | null;
          password_hash: string;
          role_id: number | null;
          updated_at: string;
          username: string;
        };
        Insert: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["admin_users"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          }
        ];
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          name: string;
        };
        Insert: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
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
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "documents_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "document_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      inquiries: {
        Row: {
          id: number;
          name: string;
          company: string | null;
          phone: string | null;
          email: string | null;
          product_id: number | null;
          message: string | null;
          status: "new" | "contacted" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inquiries"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "inquiries_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_images: {
        Row: {
          id: number;
          product_id: number;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["product_images"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          id: number;
          model_number: string;
          name: string;
          slug: string;
          summary: string | null;
          description: string | null;
          application_notes: string | null;
          status: "published" | "unpublished";
          is_featured: boolean;
          view_count: number;
          seo_title: string | null;
          seo_keywords: string | null;
          seo_description: string | null;
          search_vector: unknown | null;
          subcategory_id: number | null;
          published_at: string | null;
          created_by: number | null;
          created_at: string;
          updated_at: string;
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
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
