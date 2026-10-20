"use server";

/**
 * Blog post mutations (staff CRUD). `published_at` is derived: it is
 * stamped the first time a post is published (the public RLS policy
 * requires published_at <= now(), so a future-dated post stays hidden
 * until its date arrives). The creating author is recorded from the
 * session — never from the form.
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { blogPostSchema } from "@/lib/validation";
import { formBool, formStr } from "@/lib/form";
import { zodFailure, type ActionResult } from "./types";

function parseBlogForm(formData: FormData) {
  return blogPostSchema.safeParse({
    slug: formStr(formData, "slug"),
    titleFr: formStr(formData, "titleFr"),
    titleEn: formStr(formData, "titleEn"),
    titleAr: formStr(formData, "titleAr"),
    excerptFr: formStr(formData, "excerptFr"),
    excerptEn: formStr(formData, "excerptEn"),
    excerptAr: formStr(formData, "excerptAr"),
    contentFr: formStr(formData, "contentFr"),
    contentEn: formStr(formData, "contentEn"),
    contentAr: formStr(formData, "contentAr"),
    coverImageUrl: formStr(formData, "coverImageUrl"),
    isPublished: formBool(formData, "isPublished"),
  });
}

function postColumns(data: z.infer<typeof blogPostSchema>, currentlyPublished: boolean) {
  return {
    slug: data.slug,
    title_fr: data.titleFr,
    title_en: data.titleEn,
    title_ar: data.titleAr,
    excerpt_fr: data.excerptFr,
    excerpt_en: data.excerptEn,
    excerpt_ar: data.excerptAr,
    content_fr: data.contentFr,
    content_en: data.contentEn,
    content_ar: data.contentAr,
    cover_image_url: data.coverImageUrl,
    is_published: data.isPublished,
    // Stamp the publication date on the new→published transition only;
    // un-publishing then re-publishing keeps the original date.
    ...(data.isPublished && !currentlyPublished
      ? { published_at: new Date().toISOString() }
      : {}),
  };
}

export async function createBlogPost(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const profile = await requireStaff();

  const parsed = parseBlogForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blog_posts").insert({
    ...postColumns(parsed.data, false),
    author_id: profile.id,
  });

  if (error) {
    console.error("createBlogPost failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("blog-posts");
  // redirect() throws: it must come after the cache refresh (see tours.ts).
  redirect("/admin/blog");
}

export async function updateBlogPost(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'article invalide." };
  }

  const parsed = parseBlogForm(formData);
  if (!parsed.success) return zodFailure(parsed.error);

  const supabase = await createSupabaseServerClient();

  // Read the current row to decide whether this save is the first
  // publication (→ stamp published_at). RLS scopes the read to staff.
  const { data: current } = await supabase
    .from("blog_posts")
    .select("is_published")
    .eq("id", id.data)
    .maybeSingle();

  if (!current) {
    return { success: false, error: "Article introuvable." };
  }

  const { error } = await supabase
    .from("blog_posts")
    .update(postColumns(parsed.data, current.is_published))
    .eq("id", id.data);

  if (error) {
    console.error("updateBlogPost failed:", error.message);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce slug est déjà utilisé.",
        fieldErrors: { slug: "Ce slug est déjà utilisé." },
      };
    }
    return { success: false, error: "Enregistrement impossible." };
  }

  updateTag("blog-posts");
  return { success: true };
}

export async function deleteBlogPost(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(formStr(formData, "id"));
  if (!id.success) {
    return { success: false, error: "Identifiant d'article invalide." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id.data);

  if (error) {
    console.error("deleteBlogPost failed:", error.message);
    return { success: false, error: "Suppression impossible." };
  }

  updateTag("blog-posts");
  return { success: true };
}

export async function setBlogPostPublished(
  postId: string,
  isPublished: boolean
): Promise<ActionResult> {
  await requireStaff();

  const id = z.uuid().safeParse(postId);
  if (!id.success) {
    return { success: false, error: "Identifiant d'article invalide." };
  }

  const supabase = await createSupabaseServerClient();

  // First publication stamps published_at (see postColumns).
  const { data: current } = await supabase
    .from("blog_posts")
    .select("is_published, published_at")
    .eq("id", postId)
    .maybeSingle();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      is_published: isPublished,
      ...(isPublished && current && !current.is_published && !current.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
    })
    .eq("id", postId);

  if (error) {
    console.error("setBlogPostPublished failed:", error.message);
    return { success: false, error: "Mise à jour impossible." };
  }

  updateTag("blog-posts");
  return { success: true };
}