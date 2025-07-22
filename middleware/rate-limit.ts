import { NextRequest, NextResponse } from "next/server";

// In-memory store for development (use Redis/KV for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum requests per window
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

const defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10000, // Aggressive increase for campus-wide deployment (666 req/min)
    message: "Too many requests from this IP, please try again later.",
};

// Rate limit configurations for different endpoints - CAMPUS-WIDE DEPLOYMENT
// Designed for 800+ users (600 students + faculty/staff) with generous headroom
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
    "/api/contact": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // Support peak times (30 support requests/minute)
        message: "Too many contact form submissions. Please wait before submitting again.",
    },
    "/api/courses/reviews": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 2000, // High limit for course registration periods (33 req/sec)
        message: "Too many review requests. Please wait before trying again.",
    },
    // Forum endpoints with massive headroom for campus discussions
    "/api/forum/posts": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 5000, // Supports heavy campus-wide discussions (83 req/sec)
        message: "Too many forum requests. Please wait before trying again.",
    },
    "/api/forum/comments": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 3000, // High interaction limit for active discussions
        message: "Too many comment requests. Please wait before trying again.",
    },
    "/api/user/profile": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 1000, // Course selection periods, profile updates (16.7 req/sec)
        message: "Too many profile requests. Please wait before trying again.",
    },
    "/api/courses": {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 3000, // Course browsing during registration (50 req/sec)
        message: "Too many course requests. Please wait before trying again.",
    },
    "/api/feedback": {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 25, // Higher limit for campus feedback
        message: "Too many feedback submissions. Please wait before submitting again.",
    },
    // Generous default for all other endpoints
    default: defaultConfig,
};

function getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers (Vercel specific)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
    
    const ip = forwardedFor?.split(",")[0] || realIp || vercelForwardedFor || "unknown";
    
    // Include user agent for additional uniqueness
    const userAgent = request.headers.get("user-agent") || "unknown";
    
    return `${ip}:${userAgent.slice(0, 50)}`; // Limit user agent length
}

function cleanupExpiredEntries(): void {
    const now = Date.now();
    const entries = Array.from(rateLimitStore.entries());
    for (const [key, value] of entries) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

export function createRateLimit(config?: Partial<RateLimitConfig>) {
    const finalConfig = { ...defaultConfig, ...config };

    return async (request: NextRequest): Promise<NextResponse | null> => {
        // Clean up expired entries periodically
        if (Math.random() < 0.01) { // 1% chance to cleanup on each request
            cleanupExpiredEntries();
        }

        const identifier = getClientIdentifier(request);
        const now = Date.now();

        const existing = rateLimitStore.get(identifier);

        if (!existing || now > existing.resetTime) {
            // First request in window or window expired
            rateLimitStore.set(identifier, {
                count: 1,
                resetTime: now + finalConfig.windowMs,
            });
            return null; // Allow request
        }

        if (existing.count >= finalConfig.maxRequests) {
            // Rate limit exceeded
            const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
            
            return NextResponse.json(
                {
                    error: {
                        message: finalConfig.message,
                        retryAfter,
                    },
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": retryAfter.toString(),
                        "X-RateLimit-Limit": finalConfig.maxRequests.toString(),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": existing.resetTime.toString(),
                    },
                }
            );
        }

        // Increment counter
        existing.count += 1;
        rateLimitStore.set(identifier, existing);

        return null; // Allow request
    };
}

export function getRateLimitConfigForPath(pathname: string, method?: string): RateLimitConfig {
    // Check for exact matches first
    if (rateLimitConfigs[pathname]) {
        const config = rateLimitConfigs[pathname];
        
        // Apply method-specific adjustments - generous but controlled
        if (pathname === "/api/forum/posts" && method === "POST") {
            // Still generous for content creation but prevent spam
            return {
                ...config,
                maxRequests: 100, // Allow active posting during discussions
                message: "Too many forum posts created. Please wait before creating another post.",
            };
        }
        
        if (pathname === "/api/courses/reviews" && method === "POST") {
            // Allow reviewing multiple courses but prevent abuse
            return {
                ...config,
                maxRequests: 60, // Students can review many courses per minute
                message: "Too many reviews submitted. Please wait before submitting another review.",
            };
        }
        
        if (pathname === "/api/user/profile" && method === "POST") {
            // High limit for profile updates during course selection
            return {
                ...config,
                maxRequests: 150, // Frequent updates during registration
                message: "Too many profile updates. Please wait before updating again.",
            };
        }
        
        return config;
    }

    // Check for pattern matches
    for (const [pattern, config] of Object.entries(rateLimitConfigs)) {
        if (pattern !== "default" && pathname.startsWith(pattern)) {
            // Apply method-specific adjustments for write operations
            if (pattern === "/api/forum" && method === "POST") {
                return {
                    ...config,
                    maxRequests: Math.floor(config.maxRequests * 0.1), // 10% of read limit for writes
                    message: "Too many forum posts created. Please wait before creating another post.",
                };
            }
            
            if (pattern === "/api/courses" && method === "POST") {
                return {
                    ...config,
                    maxRequests: Math.floor(config.maxRequests * 0.05), // 5% of read limit for writes
                    message: "Too many course submissions. Please wait before submitting again.",
                };
            }
            
            return config;
        }
    }

    return rateLimitConfigs.default;
}

export function applyRateLimitHeaders(
    response: NextResponse,
    config: RateLimitConfig,
    remaining: number,
    resetTime: number
): void {
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", Math.max(0, remaining).toString());
    response.headers.set("X-RateLimit-Reset", resetTime.toString());
}