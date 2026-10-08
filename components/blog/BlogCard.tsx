/**
 * Blog post preview card. Title and excerpt are locale-aware with a
 * French fallback; the date is formatted per locale.
 */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { localizedText } from "@/lib/i18n/content";
import { formatDate } from "@/lib/format";
import type { BlogPostRow } from "@/lib/queries/content";
import { PhotoPlaceholder, photoVariantFor } from "@/components/ui/PhotoPlaceholder";

interface BlogCardProps {
  locale: Locale;
  post: BlogPostRow;
}

export function BlogCard({ locale, post }: BlogCardProps) {
  const title = localizedText(
    locale,
    post.title_fr,
    post.title_en,
    post.title_ar
  );
  const excerpt = localizedText(
    locale,
    post.excerpt_fr,
    post.excerpt_en,
    post.excerpt_ar
  );

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <PhotoPlaceholder
        variant={photoVariantFor(post.slug)}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <time
          dateTime={post.published_at ?? post.created_at}
          className="text-xs font-medium uppercase tracking-wide text-muted"
        >
          {formatDate(post.published_at ?? post.created_at, locale)}
        </time>
        <h3 className="mt-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-primary">
          {title}
        </h3>
        {excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm text-muted">{excerpt}</p>
        ) : null}
      </div>
    </Link>
  );
}