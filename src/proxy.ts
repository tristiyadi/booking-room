import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ["/login", "/register", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie && (pathname.startsWith("/dashboard") || pathname.startsWith("/roombook"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // if (!sessionCookie && pathname === "/") {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/roombook/:path*"],
};
