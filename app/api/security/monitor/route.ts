import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSecureErrorResponse } from "@/lib/error-handling";

interface SecurityEvent {
    type: 'rate_limit_exceeded' | 'csrf_violation' | 'suspicious_request' | 'authentication_failure' | 'content_violation';
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, any>;
    timestamp: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    endpoint: string;
}

interface MonitoringStats {
    totalEvents: number;
    last24Hours: {
        total: number;
        byType: Record<string, number>;
        bySeverity: Record<string, number>;
    };
    topEndpoints: Array<{ endpoint: string; count: number }>;
    suspiciousIPs: Array<{ ip: string; events: number; lastSeen: string }>;
}

// In-memory storage for demo (use Redis/database in production)
const securityEvents: SecurityEvent[] = [];
const suspiciousActivity = new Map<string, { count: number; lastSeen: Date }>();

/**
 * POST /api/security/monitor
 * 
 * Endpoint for reporting security events from the application
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { type, severity, details, endpoint } = await request.json();

        if (!type || !severity || !endpoint) {
            return createSecureErrorResponse('VALIDATION_FAILED', 400);
        }

        const clientIP = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown';
        
        const userAgent = request.headers.get('user-agent') || 'unknown';
        
        // Get user ID if authenticated
        const session = await getServerSession(authOptions);
        
        const event: SecurityEvent = {
            type,
            severity,
            details,
            endpoint,
            timestamp: new Date().toISOString(),
            userId: session?.user?.id,
            ip: clientIP,
            userAgent,
        };

        // Store the event
        securityEvents.push(event);
        
        // Update suspicious activity tracking
        if (severity === 'high' || severity === 'critical') {
            const existing = suspiciousActivity.get(clientIP) || { count: 0, lastSeen: new Date() };
            existing.count += 1;
            existing.lastSeen = new Date();
            suspiciousActivity.set(clientIP, existing);
        }

        // Keep only last 1000 events in memory
        if (securityEvents.length > 1000) {
            securityEvents.splice(0, securityEvents.length - 1000);
        }

        // Log critical events immediately
        if (severity === 'critical') {
            console.error('CRITICAL SECURITY EVENT:', JSON.stringify(event, null, 2));
            
            // In production, send to monitoring service
            // await sendToMonitoringService(event);
        }

        return NextResponse.json({ 
            success: true, 
            eventId: securityEvents.length,
            message: 'Security event recorded'
        });
    } catch (error) {
        console.error('Error recording security event:', error);
        return createSecureErrorResponse('INTERNAL_ERROR', 500);
    }
}

/**
 * GET /api/security/monitor
 * 
 * Get security monitoring statistics (admin only)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return createSecureErrorResponse('UNAUTHORIZED', 401);
        }

        // Check if user is admin - only tz445@cornell.edu
        const isAdmin = session.user.email === 'tz445@cornell.edu';
        
        if (!isAdmin) {
            return createSecureErrorResponse('FORBIDDEN', 403);
        }

        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Filter events from last 24 hours
        const recentEvents = securityEvents.filter(
            event => new Date(event.timestamp) > last24Hours
        );

        // Calculate statistics
        const stats: MonitoringStats = {
            totalEvents: securityEvents.length,
            last24Hours: {
                total: recentEvents.length,
                byType: recentEvents.reduce((acc, event) => {
                    acc[event.type] = (acc[event.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                bySeverity: recentEvents.reduce((acc, event) => {
                    acc[event.severity] = (acc[event.severity] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
            },
            topEndpoints: Object.entries(
                recentEvents.reduce((acc, event) => {
                    acc[event.endpoint] = (acc[event.endpoint] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>)
            )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([endpoint, count]) => ({ endpoint, count })),
            suspiciousIPs: Array.from(suspiciousActivity.entries())
                .filter(([, data]) => data.count >= 5) // 5+ suspicious events
                .sort(([, a], [, b]) => b.count - a.count)
                .slice(0, 20)
                .map(([ip, data]) => ({
                    ip: ip === 'unknown' ? 'Unknown IP' : ip.substring(0, 12) + '...', // Partial IP for privacy
                    events: data.count,
                    lastSeen: data.lastSeen.toISOString(),
                })),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching security stats:', error);
        return createSecureErrorResponse('INTERNAL_ERROR', 500);
    }
}

/**
 * DELETE /api/security/monitor
 * 
 * Clear security event logs (admin only)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return createSecureErrorResponse('UNAUTHORIZED', 401);
        }

        // Check if user is admin - only tz445@cornell.edu
        const isAdmin = session.user.email === 'tz445@cornell.edu';
        
        if (!isAdmin) {
            return createSecureErrorResponse('FORBIDDEN', 403);
        }

        const clearedCount = securityEvents.length;
        securityEvents.length = 0; // Clear array
        suspiciousActivity.clear(); // Clear suspicious activity

        console.log(`Security logs cleared by admin: ${session.user.email}`);

        return NextResponse.json({ 
            success: true, 
            message: `Cleared ${clearedCount} security events`,
            clearedCount
        });
    } catch (error) {
        console.error('Error clearing security logs:', error);
        return createSecureErrorResponse('INTERNAL_ERROR', 500);
    }
}