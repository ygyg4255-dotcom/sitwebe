/**
 * robots.txt — every public page may be crawled. The staff admin area
 * (/admin, French-only paths with no locale prefix — gated in proxy.ts)
 * is disallowed so the dashboard never lands in search indexes.
 * Served at /robots.txt.
 */
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}