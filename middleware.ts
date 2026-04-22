import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import {
  createRateLimit,
  getRateLimitConfigForPath,
} from "./middleware/rate-limit";

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/courses/new-review",
  "/planner",
  "/settings",
  "/forum/create",
  "/my-reviews",
];

// API routes that need rate limiting
const rateLimitedRoutes = [
  "/api/contact",
  "/api/courses/reviews",
  "/api/forum/posts",
  "/api/user/profile",
  "/api/feedback",
  "/api/comments",
];

const authMiddleware = withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

async function middleware(request: NextRequest, event: any) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api")) {
    const shouldRateLimit = rateLimitedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    if (shouldRateLimit) {
      const config = getRateLimitConfigForPath(pathname, request.method);
      const rateLimit = createRateLimit(config);
      const rateLimitResponse = await rateLimit(request);

      if (rateLimitResponse) {
        return rateLimitResponse; // Rate limit exceeded
      }
    }

    // CSRF protection is handled by NextAuth.js for authenticated routes
  }

  // Apply authentication to protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute) {
    return (authMiddleware as any)(request, event);
  }

  // Minimal security headers (most handled by Vercel)
  const response = NextResponse.next();

  // Only set headers that Vercel doesn't provide by default or need customization
  response.headers.set("X-Frame-Options", "DENY");

  return response;
}

export default middleware;

export const config = {
  matcher: [
    // Protected routes requiring authentication
    "/dashboard/:path*",
    "/profile/:path*",
    "/courses/new-review",
    "/courses/:path*/new-review",
    "/planner/:path*",
    "/settings/:path*",
    "/forum/create/:path*",
    "/my-reviews/:path*",
    // API routes for rate limiting
    "/api/:path*",
    // All routes for security headers
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
