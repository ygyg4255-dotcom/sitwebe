/**
 * Blog post — the article content is Markdown from the database, rendered
 * by the safe whitelist renderer (components/blog/Markdown.tsx) with a
 * BlogPosting JSON-LD block. Unknown slugs render on demand and 404.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { localizedText } from "@/lib/i18n/content";
import { formatDate } from "@/lib/format";
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/queries/content";
import { getBranding, getSiteUrl } from "@/lib/config/site";
import { blogPostJsonLd, localeAlternates } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { renderMarkdown } from "@/components/blog/Markdown";

interface BlogPostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/** Pre-render every published post × locale at build time. */
export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  if (posts.length === 0) {
    // Cache Components requires at least one param (see notFound below).
    return [{ slug: "__placeholder__" }];
  }
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: dict.pages.blog.title,
      description: dict.pages.blog.subtitle,
    };
  }

  const title = localizedText(
    locale,
    post.title_fr,
    post.title_en,
    post.title_ar
  );
  const description = localizedText(
    locale,
    post.excerpt_fr,
    post.excerpt_en,
    post.excerpt_ar
  );

  return {
    title,
    description,
    alternates: localeAlternates(locale, `/blog/${slug}`),
    openGraph: {
      type: "article",
      title,
      description,
      url: `/${locale}/blog/${slug}`,
      publishedTime: post.published_at ?? post.created_at,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);

  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const branding = await getBranding();
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
  const content = localizedText(
    locale,
    post.content_fr,
    post.content_en,
    post.content_ar
  );
  const publishedAt = post.published_at ?? post.created_at;

  return (
    <>
      <JsonLd
        data={blogPostJsonLd(post, locale, getSiteUrl(), branding.agencyName)}
      />

      <Container className="py-16 sm:py-20">
        <article className="mx-auto max-w-3xl">
          <time
            dateTime={publishedAt}
            className="text-sm font-medium uppercase tracking-wide text-primary"
          >
            {formatDate(publishedAt, locale)}
          </time>
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">
            {title}
          </h1>
          {excerpt ? (
            <p className="mt-4 text-lg leading-relaxed text-muted">{excerpt}</p>
          ) : null}

          <div className="mt-8">{renderMarkdown(content)}</div>

          <Link
            href={`/${locale}/blog`}
            className="mt-12 inline-block text-sm font-medium text-primary hover:text-primary-dark"
          >
            <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
              ←{" "}
            </span>
            {dict.pages.blog.backToBlog}
          </Link>
        </article>
      </Container>
    </>
  );
}