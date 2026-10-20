"use server";

/**
 * Media upload (admin) — the ONLY entry point for images into the
 * public "media" Storage bucket. Storage RLS (migration 0005) allows
 * writes for staff only; this action additionally validates the file
 * type and size before uploading.
 *
 * The upload itself carries the user's session, so the database (not
 * this code) enforces who may write to the bucket.
 */
import { requireStaff } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/validation";
import { formStr } from "@/lib/form";

/** Whitelisted first-level folders inside the media bucket. */
const FOLDERS = ["tours", "destinations", "blog", "branding", "misc"] as const;

export type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireStaff();

  const folder = formStr(formData, "folder");
  if (!(FOLDERS as readonly string[]).includes(folder)) {
    return { success: false, error: "Dossier invalide." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Aucun fichier sélectionné." };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { success: false, error: "Format non supporté (JPG, PNG, WebP, GIF ou SVG)." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Fichier trop lourd (maximum 5 Mo)." };
  }

  // Stable, collision-free path: folder/timestamp-safe-name
  const safeName = file.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
  const path = `${folder}/${Date.now()}-${safeName}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("uploadMedia failed:", error.message);
    return { success: false, error: "Envoi impossible pour le moment." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("media").getPublicUrl(path);

  return { success: true, url: publicUrl };
}