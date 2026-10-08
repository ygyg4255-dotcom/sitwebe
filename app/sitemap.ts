/**
 * Sitemap — every public page in every locale, with hreflang alternates
 * per URL. Static pages use the build-time date snapshot; dynamic pages
 * use the content's own timestamps.
 *
 * Generated at build time and served at /sitemap.xml (cached route).
 */
import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/config/site";
import { getCachedToday } from "@/lib/seo";
import { getPublishedTours } from "@/lib/queries/tours";
import { getPublishedDestinations } from "@/lib/queries/destinations";
import { getPublishedBlogPosts } from "@/lib/queries/content";

/** Static pages that exist in every locale (path after the locale prefix). */
const STATIC_PATHS = [
  "",
  "/tours",
  "/destinations",
  "/about",
  "/contact",
  "/blog",
  "/gallery",
  "/testimonials",
  "/faq",
];

/** hreflang map for one path — every locale plus the French x-default. */
function languagesFor(path: string): Record<string, string> {
  const siteUrl = getSiteUrl();
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = `${siteUrl}/${locale}${path}`;
  languages["x-default"] = `${siteUrl}/fr${path}`;
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const today = await getCachedToday();

  const [tours, destinations, posts] = await Promise.all([
    getPublishedTours(),
    getPublishedDestinations(),
    getPublishedBlogPosts(),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  // Static pages × locales
  for (const path of STATIC_PATHS) {
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: today,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  // Tour detail pages × locales
  for (const tour of tours) {
    const path = `/tours/${tour.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: tour.updated_at,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  // Destination detail pages × locales
  for (const destination of destinations) {
    const path = `/destinations/${destination.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: today,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  // Blog posts × locales
  for (const post of posts) {
    const path = `/blog/${post.slug}`;
    for (const locale of locales) {
      entries.push({
        url: `${siteUrl}/${locale}${path}`,
        lastModified: post.published_at ?? post.created_at,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}