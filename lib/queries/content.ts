/**
 * Content queries: testimonials, FAQs and blog posts (public, read-only).
 * Each family has its own cache tag, refreshed by its admin mutations.
 */
import "server-only";
import { cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { TableRow } from "@/lib/types/database";

export type TestimonialRow = TableRow<"testimonials">;
export type FaqRow = TableRow<"faqs">;
export type BlogPostRow = TableRow<"blog_posts">;

const MAX_RESULTS = 100;

export async function getPublishedTestimonials(
  limit = MAX_RESULTS
): Promise<TestimonialRow[]> {
  "use cache";
  cacheTag("testimonials");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("rating", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedTestimonials failed:", error.message);
    return [];
  }
  return data;
}

export async function getPublishedFaqs(limit = MAX_RESULTS): Promise<FaqRow[]> {
  "use cache";
  cacheTag("faqs");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getPublishedFaqs failed:", error.message);
    return [];
  }
  return data;
}

export async function getPublishedBlogPosts(
  limit = MAX_RESULTS
): Promise<BlogPostRow[]> {
  "use cache";
  cacheTag("blog-posts");

  if (!hasSupabaseEnv()) return [];

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedBlogPosts failed:", error.message);
    return [];
  }
  return data;
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPostRow | null> {
  "use cache";
  cacheTag("blog-posts");

  if (!hasSupabaseEnv()) return null;

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedBlogPostBySlug failed:", error.message);
    return null;
  }
  return data;
}