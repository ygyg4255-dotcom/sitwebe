"use client";

/**
 * Blog post create/edit form (admin). Same pattern as TourForm. The
 * publication date (published_at) is handled by the action — stamped on
 * the first publication.
 */
import { useActionState } from "react";
import { createBlogPost, updateBlogPost } from "@/lib/actions/blog";
import { initialFormState, type ActionResult } from "@/lib/actions/types";
import type { TableRow } from "@/lib/types/database";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { SubmitButton } from "@/components/forms/FormBits";
import { ImageUploadField } from "@/components/admin/Controls";
import { Field, FormSection } from "./Field";

export function BlogPostForm({ post }: { post?: TableRow<"blog_posts"> }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    post ? updateBlogPost : createBlogPost,
    initialFormState
  );
  const errors = state && !state.success ? state.fieldErrors : undefined;
  const ok = state?.success === true;

  return (
    <Card className="p-6 sm:p-8">
      <form action={formAction} className="space-y-2">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}

        <FormSection title="Contenu principal">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Titre (FR) *" htmlFor="post-titleFr" error={errors?.titleFr}>
              <Input id="post-titleFr" name="titleFr" required defaultValue={post?.title_fr} maxLength={200} />
            </Field>
            <Field label="Slug *" htmlFor="post-slug" error={errors?.slug}
              hint="Identifiant URL : oueds-merzouga-en-4x4">
              <Input id="post-slug" name="slug" required defaultValue={post?.slug} maxLength={120} />
            </Field>
            <Field label="Titre (EN)" htmlFor="post-titleEn" error={errors?.titleEn}>
              <Input id="post-titleEn" name="titleEn" defaultValue={post?.title_en ?? ""} maxLength={200} />
            </Field>
            <Field label="Titre (AR)" htmlFor="post-titleAr" error={errors?.titleAr}>
              <Input id="post-titleAr" name="titleAr" defaultValue={post?.title_ar ?? ""} maxLength={200} />
            </Field>
          </div>

          <Field label="Chapeau (FR)" htmlFor="post-excerptFr" error={errors?.excerptFr}
            hint="Court résumé affiché dans les listes d'articles">
            <Textarea id="post-excerptFr" name="excerptFr" rows={2} defaultValue={post?.excerpt_fr ?? ""} maxLength={600} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Chapeau (EN)" htmlFor="post-excerptEn" error={errors?.excerptEn}>
              <Textarea id="post-excerptEn" name="excerptEn" rows={2} defaultValue={post?.excerpt_en ?? ""} maxLength={600} />
            </Field>
            <Field label="Chapeau (AR)" htmlFor="post-excerptAr" error={errors?.excerptAr}>
              <Textarea id="post-excerptAr" name="excerptAr" rows={2} defaultValue={post?.excerpt_ar ?? ""} maxLength={600} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Article">
          <Field label="Contenu (FR)" htmlFor="post-contentFr" error={errors?.contentFr}>
            <Textarea id="post-contentFr" name="contentFr" rows={10} defaultValue={post?.content_fr ?? ""} maxLength={50000} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contenu (EN)" htmlFor="post-contentEn" error={errors?.contentEn}>
              <Textarea id="post-contentEn" name="contentEn" rows={6} defaultValue={post?.content_en ?? ""} maxLength={50000} />
            </Field>
            <Field label="Contenu (AR)" htmlFor="post-contentAr" error={errors?.contentAr}>
              <Textarea id="post-contentAr" name="contentAr" rows={6} defaultValue={post?.content_ar ?? ""} maxLength={50000} />
            </Field>
          </div>

          <ImageUploadField
            name="coverImageUrl"
            folder="blog"
            currentUrl={post?.cover_image_url ?? null}
            label="Image de couverture (facultatif)"
          />
          {errors?.coverImageUrl ? (
            <p role="alert" className="text-sm font-medium text-primary">{errors.coverImageUrl}</p>
          ) : null}
        </FormSection>

        <FormSection title="Publication">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={post?.is_published ?? false}
              className="size-4 rounded border-brand-border accent-[var(--brand-primary)]"
            />
            Publié (visible sur le site)
          </label>
        </FormSection>

        {state && !state.success ? (
          <div role="alert" className="mt-6 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {state.error}
          </div>
        ) : null}
        {ok ? (
          <div role="status" className="mt-6 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm text-secondary">
            Enregistré ✓
          </div>
        ) : null}

        <div className="mt-6">
          <SubmitButton pendingLabel="Enregistrement…">
            {post ? "Enregistrer les modifications" : "Créer l'article"}
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}