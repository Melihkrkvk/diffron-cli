import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 replaces middleware.ts with proxy.ts.
 * This function runs before matched routes.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * Protect dashboard routes.
   * This example checks if an Auth.js session cookie exists.
   * In production, server-side `auth()` checks inside protected pages
   * are more reliable and recommended.
   */
  if (pathname.startsWith("/dashboard")) {
    const hasSession =
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("authjs.session-token");

    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/**
 * Define which routes this proxy should apply to.
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};