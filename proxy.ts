/**
 * Locale routing (Next.js 16 "proxy" convention — the renamed middleware).
 *
 * Every visit starts at the default locale (French):
 *   /            →  /fr
 *   /tours       →  /fr/tours
 *
 * When real English and Arabic content is added, this is the single place
 * to upgrade — e.g. pick the locale from the Accept-Language header.
 * The matcher excludes API routes, Next.js internals and static assets.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (pathnameHasLocale) return NextResponse.next();

  // No locale prefix: redirect to the same path under the default locale.
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Run on all pages, but skip API routes, Next.js internals and files
  // (anything containing a dot, e.g. favicon.ico, images, …).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};