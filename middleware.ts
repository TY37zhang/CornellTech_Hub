import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { createRateLimit, getRateLimitConfigForPath } from "./middleware/rate-limit";
import { canModerate, isAdmin } from "./lib/roles";

// Protected routes that require authentication
const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/courses/new-review",
    "/planner",
    "/settings",
    "/forum/create",
    "/my-reviews",
    "/admin",
];

// API routes that need rate limiting
const rateLimitedRoutes = [
    "/api/contact",
    "/api/courses/reviews",
    "/api/forum/posts",
    "/api/user/profile",
    "/api/feedback",
    "/api/comments",
    "/api/admin",
];

async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Apply rate limiting to API routes
    if (pathname.startsWith("/api")) {
        const shouldRateLimit = rateLimitedRoutes.some(route => 
            pathname.startsWith(route)
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
    const isProtectedRoute = protectedRoutes.some(route => 
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        return withAuth(
            function middleware(req) {
                // Check for admin/mod route access
                if (pathname.startsWith("/admin")) {
                    const userToken = req.nextauth?.token;
                    const user = {
                        role: userToken?.role as string,
                        is_admin: userToken?.is_admin as boolean,
                        is_mod: userToken?.is_mod as boolean,
                    };
                    
                    // Admin routes require admin role
                    if (pathname.startsWith("/admin/users") && !isAdmin(user)) {
                        return NextResponse.redirect(new URL("/admin", req.url));
                    }
                    
                    // Moderation routes require admin or mod role
                    if (pathname.startsWith("/admin/moderation") && !canModerate(user)) {
                        return NextResponse.redirect(new URL("/", req.url));
                    }
                    
                    // General admin access requires admin or mod role
                    if (pathname === "/admin" && !canModerate(user)) {
                        return NextResponse.redirect(new URL("/", req.url));
                    }
                }
                
                // Authentication successful, continue
                return NextResponse.next();
            },
            {
                pages: {
                    signIn: "/auth/signin",
                },
            }
        )(request);
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
        "/admin/:path*",
        // API routes for rate limiting
        "/api/:path*",
        // All routes for security headers
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
