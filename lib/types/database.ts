/**
 * ─────────────────────────────────────────────────────────────────────────
 * TypeScript types for the Supabase database.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * These types mirror the SQL migrations in supabase/migrations/0001–0003
 * exactly (table names, column names, nullability, defaults).
 *
 * They can be regenerated automatically once the Supabase CLI is set up:
 *   supabase gen types typescript --local > lib/types/database.types.ts
 * (or --project-id <ref> against the live project). Until then, any schema
 * change must be made in BOTH places — the migrations AND this file.
 *
 * Notes on the mappings used:
 *   - uuid / text / timestamptz / date / text[]  → string / string[]
 *   - numeric(10,2)  → number (PostgREST returns JSON numbers)
 *   - "Insert" columns marked optional (?) have a database default or
 *     are nullable — everything else must be provided.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: number;
          agency_name: string;
          tagline: string | null;
          logo_url: string | null;
          primary_color: string;
          primary_dark_color: string;
          accent_color: string;
          secondary_color: string;
          ink_color: string;
          paper_color: string;
          sand_color: string;
          surface_color: string;
          muted_color: string;
          border_color: string;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          address: string | null;
          city: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          tripadvisor_url: string | null;
          default_locale: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          agency_name?: string;
          tagline?: string | null;
          logo_url?: string | null;
          primary_color?: string;
          primary_dark_color?: string;
          accent_color?: string;
          secondary_color?: string;
          ink_color?: string;
          paper_color?: string;
          sand_color?: string;
          surface_color?: string;
          muted_color?: string;
          border_color?: string;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          address?: string | null;
          city?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          tripadvisor_url?: string | null;
          default_locale?: string;
          updated_at?: string;
        };
        Update: {
          [key: string]: string | number | null | undefined;
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          slug: string;
          name_fr: string;
          name_en: string | null;
          name_ar: string | null;
          description_fr: string | null;
          description_en: string | null;
          description_ar: string | null;
          image_url: string | null;
          is_published: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          slug: string;
          name_fr: string;
          name_en?: string | null;
          name_ar?: string | null;
          description_fr?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          image_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
        };
        Update: {
          [key: string]: string | number | boolean | null | undefined;
        };
        Relationships: [];
      };
      tours: {
        Row: {
          id: string;
          destination_id: string | null;
          slug: string;
          title_fr: string;
          title_en: string | null;
          title_ar: string | null;
          summary_fr: string | null;
          summary_en: string | null;
          summary_ar: string | null;
          description_fr: string | null;
          description_en: string | null;
          description_ar: string | null;
          price_mad: number;
          duration_days: number;
          group_size_max: number | null;
          difficulty: string;
          cover_image_url: string | null;
          gallery_urls: string[];
          included: string[];
          excluded: string[];
          is_published: boolean;
          is_featured: boolean;
          departure_location: string | null;
          return_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          destination_id?: string | null;
          slug: string;
          title_fr: string;
          title_en?: string | null;
          title_ar?: string | null;
          summary_fr?: string | null;
          summary_en?: string | null;
          summary_ar?: string | null;
          description_fr?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
          price_mad: number;
          duration_days?: number;
          group_size_max?: number | null;
          difficulty?: string;
          cover_image_url?: string | null;
          gallery_urls?: string[];
          included?: string[];
          excluded?: string[];
          is_published?: boolean;
          is_featured?: boolean;
          departure_location?: string | null;
          return_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          [key: string]: string | number | boolean | string[] | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "tours_destination_id_fkey";
            columns: ["destination_id"];
            isOneToOne: false;
            referencedRelation: "destinations";
            referencedColumns: ["id"];
          },
        ];
      };
      tour_itinerary: {
        Row: {
          id: string;
          tour_id: string;
          day_number: number;
          title_fr: string;
          title_en: string | null;
          title_ar: string | null;
          description_fr: string | null;
          description_en: string | null;
          description_ar: string | null;
        };
        Insert: {
          id?: string;
          tour_id: string;
          day_number: number;
          title_fr: string;
          title_en?: string | null;
          title_ar?: string | null;
          description_fr?: string | null;
          description_en?: string | null;
          description_ar?: string | null;
        };
        Update: {
          [key: string]: string | number | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "tour_itinerary_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      tour_departures: {
        Row: {
          id: string;
          tour_id: string;
          start_date: string;
          end_date: string;
          price_mad: number | null;
          max_participants: number | null;
          booked_participants: number;
        };
        Insert: {
          id?: string;
          tour_id: string;
          start_date: string;
          end_date: string;
          price_mad?: number | null;
          max_participants?: number | null;
          booked_participants?: number;
        };
        Update: {
          [key: string]: string | number | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "tour_departures_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          tour_id: string | null;
          departure_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          travel_date: string | null;
          num_adults: number;
          num_children: number;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tour_id?: string | null;
          departure_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          travel_date?: string | null;
          num_adults?: number;
          num_children?: number;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          [key: string]: string | number | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_tour_id_fkey";
            columns: ["tour_id"];
            isOneToOne: false;
            referencedRelation: "tours";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_departure_id_fkey";
            columns: ["departure_id"];
            isOneToOne: false;
            referencedRelation: "tour_departures";
            referencedColumns: ["id"];
          },
        ];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          [key: string]: string | boolean | null | undefined;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_country: string | null;
          rating: number;
          quote_fr: string;
          quote_en: string | null;
          quote_ar: string | null;
          avatar_url: string | null;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_country?: string | null;
          rating: number;
          quote_fr: string;
          quote_en?: string | null;
          quote_ar?: string | null;
          avatar_url?: string | null;
          is_published?: boolean;
        };
        Update: {
          [key: string]: string | number | boolean | null | undefined;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          slug: string;
          title_fr: string;
          title_en: string | null;
          title_ar: string | null;
          excerpt_fr: string | null;
          excerpt_en: string | null;
          excerpt_ar: string | null;
          content_fr: string | null;
          content_en: string | null;
          content_ar: string | null;
          cover_image_url: string | null;
          author_id: string | null;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_fr: string;
          title_en?: string | null;
          title_ar?: string | null;
          excerpt_fr?: string | null;
          excerpt_en?: string | null;
          excerpt_ar?: string | null;
          content_fr?: string | null;
          content_en?: string | null;
          content_ar?: string | null;
          cover_image_url?: string | null;
          author_id?: string | null;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
        };
        Update: {
          [key: string]: string | boolean | null | undefined;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      faqs: {
        Row: {
          id: string;
          question_fr: string;
          question_en: string | null;
          question_ar: string | null;
          answer_fr: string;
          answer_en: string | null;
          answer_ar: string | null;
          sort_order: number;
          is_published: boolean;
        };
        Insert: {
          id?: string;
          question_fr: string;
          question_en?: string | null;
          question_ar?: string | null;
          answer_fr: string;
          answer_en?: string | null;
          answer_ar?: string | null;
          sort_order?: number;
          is_published?: boolean;
        };
        Update: {
          [key: string]: string | number | boolean | null | undefined;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/** Convenience alias: the Row type of any public table. */
export type TableRow<K extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][K]["Row"];