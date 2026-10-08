/**
 * Blog — published articles from Supabase, newest first.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPublishedBlogPosts } from "@/lib/queries/content";
import { localeAlternates } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  const dict = getDictionary(locale);
  return {
    title: dict.pages.blog.title,
    description: dict.pages.blog.subtitle,
    alternates: localeAlternates(locale, "/blog"),
    openGraph: {
      title: dict.pages.blog.title,
      description: dict.pages.blog.subtitle,
      url: `/${locale}/blog`,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale: Locale = raw;
  const dict = getDictionary(locale);
  const posts = await getPublishedBlogPosts();

  return (
    <Container className="py-16 sm:py-20">
      <SectionHeading
        title={dict.pages.blog.title}
        subtitle={dict.pages.blog.subtitle}
      />

      {posts.length === 0 ? (
        <p className="mt-10 text-center text-muted">{dict.pages.blog.empty}</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} locale={locale} post={post} />
          ))}
        </div>
      )}
    </Container>
  );
}