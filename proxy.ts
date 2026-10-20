/**
 * Locale routing + admin gate (Next.js 16 "proxy" convention — the
 * renamed middleware).
 *
 * Locale routing — every visit starts at the default locale (French):
 *   /            →  /fr
 *   /tours       →  /fr/tours
 *
 * When real English and Arabic content is added, this is the single place
 * to upgrade — e.g. pick the locale from the Accept-Language header.
 *
 * Admin gate — a CHEAP cookie-presence check: a request to /admin
 * without any Supabase auth cookie is redirected to /admin/login before
 * rendering even starts (without it, PPR would stream the admin shell
 * with a 200 and redirect only mid-stream). This is NOT the security
 * boundary: the (protected) layout guard verifies the actual session
 * and role, and RLS remains the data boundary.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

/** Matches @supabase/ssr auth cookies: sb-<project-ref>-auth-token(.n)? */
function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token")
    );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: French-only paths with no locale prefix — never run the
  // locale redirect on them.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login" && !hasAuthCookie(request)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

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
  // (anything containing a dot, e.g. favicon.ico, images, …). Admin is
  // included on purpose: the admin gate above needs it.
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};