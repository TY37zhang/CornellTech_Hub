import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Security-focused error handling that prevents information disclosure

export interface SecurityError {
    code: string;
    message: string;
    statusCode: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
    userId?: string;
    endpoint: string;
    userAgent?: string;
    ip?: string;
    timestamp: string;
}

// Safe error messages that don't leak sensitive information
const SAFE_ERROR_MESSAGES = {
    // Authentication & Authorization
    UNAUTHORIZED: "Access denied. Please sign in to continue.",
    FORBIDDEN: "You don't have permission to access this resource.",
    INVALID_SESSION: "Your session has expired. Please sign in again.",
    
    // Validation & Input
    VALIDATION_FAILED: "The provided data is invalid.",
    INVALID_INPUT: "Please check your input and try again.",
    CONTENT_POLICY_VIOLATION: "Content violates our community guidelines.",
    
    // Rate Limiting
    RATE_LIMITED: "Too many requests. Please wait before trying again.",
    
    // Database & Infrastructure
    SERVICE_UNAVAILABLE: "Service is temporarily unavailable. Please try again later.",
    INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
    
    // Resource Management
    NOT_FOUND: "The requested resource was not found.",
    ALREADY_EXISTS: "This resource already exists.",
    
    // File Operations
    FILE_TOO_LARGE: "File size exceeds the allowed limit.",
    INVALID_FILE_TYPE: "File type is not supported.",
    UPLOAD_FAILED: "File upload failed. Please try again.",
    
    // Security
    SECURITY_VIOLATION: "Security policy violation detected.",
    SUSPICIOUS_ACTIVITY: "Suspicious activity detected. Request blocked.",
} as const;

export type SafeErrorCode = keyof typeof SAFE_ERROR_MESSAGES;

// Production-safe error handler
export function createSecureErrorResponse(
    errorCode: SafeErrorCode,
    statusCode: number = 500,
    context?: Partial<ErrorContext>,
    additionalData?: Record<string, any>
): NextResponse {
    const message = SAFE_ERROR_MESSAGES[errorCode];
    
    // Log security-relevant errors
    if (statusCode >= 400) {
        logSecurityEvent({
            code: errorCode,
            message,
            statusCode,
            severity: getSeverityLevel(statusCode),
        }, context);
    }

    const response = {
        error: {
            code: errorCode,
            message,
            timestamp: new Date().toISOString(),
        },
        ...(additionalData && { ...additionalData }),
    };

    // Remove sensitive headers and set security headers
    const nextResponse = NextResponse.json(response, { status: statusCode });
    nextResponse.headers.set('X-Content-Type-Options', 'nosniff');
    nextResponse.headers.set('Cache-Control', 'no-store');
    
    return nextResponse;
}

// Handle different types of errors securely
export function handleError(
    error: unknown,
    context?: Partial<ErrorContext>
): NextResponse {
    // Log the actual error for debugging (server-side only)
    console.error('Error occurred:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context,
        timestamp: new Date().toISOString(),
    });

    // Return safe error responses based on error type
    if (error instanceof ZodError) {
        return createSecureErrorResponse('VALIDATION_FAILED', 400, context, {
            validationErrors: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        });
    }

    if (error instanceof Error) {
        // Check for specific error patterns
        if (error.message.toLowerCase().includes('unauthorized')) {
            return createSecureErrorResponse('UNAUTHORIZED', 401, context);
        }
        
        if (error.message.toLowerCase().includes('forbidden')) {
            return createSecureErrorResponse('FORBIDDEN', 403, context);
        }
        
        if (error.message.toLowerCase().includes('not found')) {
            return createSecureErrorResponse('NOT_FOUND', 404, context);
        }
        
        if (error.message.toLowerCase().includes('database')) {
            return createSecureErrorResponse('SERVICE_UNAVAILABLE', 503, context);
        }
        
        if (error.message.toLowerCase().includes('rate limit')) {
            return createSecureErrorResponse('RATE_LIMITED', 429, context);
        }
        
        if (error.message.toLowerCase().includes('violates community guidelines')) {
            return createSecureErrorResponse('CONTENT_POLICY_VIOLATION', 400, context);
        }
    }

    // Default to internal server error with no details
    return createSecureErrorResponse('INTERNAL_ERROR', 500, context);
}

// Determine severity level based on status code
function getSeverityLevel(statusCode: number): SecurityError['severity'] {
    if (statusCode >= 500) return 'critical';
    if (statusCode === 429) return 'high'; // Rate limiting
    if (statusCode === 403 || statusCode === 401) return 'medium'; // Auth issues
    return 'low';
}

// Security event logging
function logSecurityEvent(
    error: SecurityError,
    context?: Partial<ErrorContext>
): void {
    const securityEvent = {
        ...error,
        context: {
            timestamp: new Date().toISOString(),
            endpoint: context?.endpoint || 'unknown',
            userId: context?.userId || 'anonymous',
            ip: context?.ip || 'unknown',
            userAgent: context?.userAgent || 'unknown',
        },
    };

    // Log to console (in production, send to monitoring service)
    console.warn('Security Event:', JSON.stringify(securityEvent, null, 2));

    // In production, you would send this to your monitoring service
    // Examples: Sentry, DataDog, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
        // sendToMonitoringService(securityEvent);
    }
}

// Validation helper for API endpoints
export function createApiErrorHandler(endpoint: string) {
    return (error: unknown, request?: Request): NextResponse => {
        const context: Partial<ErrorContext> = {
            endpoint,
            timestamp: new Date().toISOString(),
        };

        if (request) {
            context.userAgent = request.headers.get('user-agent') || undefined;
            context.ip = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || undefined;
        }

        return handleError(error, context);
    };
}

// Request validation wrapper
export async function withErrorHandling<T>(
    handler: () => Promise<T>,
    context?: Partial<ErrorContext>
): Promise<T | NextResponse> {
    try {
        return await handler();
    } catch (error) {
        return handleError(error, context);
    }
}

// Rate limiting error
export function createRateLimitError(retryAfter: number): NextResponse {
    const response = createSecureErrorResponse('RATE_LIMITED', 429);
    response.headers.set('Retry-After', retryAfter.toString());
    return response;
}

// Content policy violation error
export function createContentPolicyError(violations: string[]): NextResponse {
    return createSecureErrorResponse('CONTENT_POLICY_VIOLATION', 400, undefined, {
        violations: violations.slice(0, 3), // Limit to first 3 violations
    });
}