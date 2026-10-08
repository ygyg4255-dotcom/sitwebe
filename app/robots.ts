/**
 * robots.txt — every public page may be crawled (there is nothing to
 * hide: staff/admin routes only arrive in Phase 4 and will be listed
 * here when they exist). Served at /robots.txt.
 */
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}