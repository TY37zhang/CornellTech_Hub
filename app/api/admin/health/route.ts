import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { isAdmin } from "@/lib/roles";

interface SimpleHealthStatus {
    status: string;
    timestamp: string;
    services: {
        database: {
            status: string;
            responseTime: number;
            lastChecked: string;
        };
        api: {
            status: string;
            responseTime: number;
            lastChecked: string;
        };
        auth: {
            status: string;
            responseTime: number;
            lastChecked: string;
        };
    };
    metrics: {
        uptime: number;
        memoryUsage: number;
        activeConnections: number;
        requestsPerMinute: number;
    };
}

async function checkDatabaseSimple(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    
    try {
        await prisma.$queryRaw`SELECT 1 as test`;
        const responseTime = Date.now() - start;
        
        return {
            status: responseTime > 5000 ? 'degraded' : 'healthy',
            responseTime
        };
    } catch (error) {
        console.error('Database check failed:', error);
        return {
            status: 'down',
            responseTime: Date.now() - start
        };
    }
}

async function checkAPI(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    
    try {
        // Simple API check - if we can respond, API is working
        const responseTime = Date.now() - start;
        return {
            status: 'healthy',
            responseTime
        };
    } catch (error) {
        return {
            status: 'down',
            responseTime: Date.now() - start
        };
    }
}

async function checkAuth(): Promise<{ status: string; responseTime: number }> {
    const start = Date.now();
    
    try {
        // Check if NextAuth environment variables are present
        const hasRequiredVars = !!(
            process.env.NEXTAUTH_SECRET && 
            process.env.NEXTAUTH_URL && 
            process.env.GOOGLE_CLIENT_ID && 
            process.env.GOOGLE_CLIENT_SECRET
        );
        
        const responseTime = Date.now() - start;
        
        return {
            status: hasRequiredVars ? 'healthy' : 'degraded',
            responseTime
        };
    } catch (error) {
        return {
            status: 'down',
            responseTime: Date.now() - start
        };
    }
}

function getSystemMetrics() {
    // Only return metrics that are meaningful and real
    return {
        // Remove uptime and memory as they're not useful in serverless
        // Remove mock activeConnections and requestsPerMinute
    };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        // Check admin authorization
        const session = await getServerSession(authOptions);
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date().toISOString();
        
        // Run health checks in parallel
        const [database, api, auth] = await Promise.all([
            checkDatabaseSimple(),
            checkAPI(),
            checkAuth()
        ]);
        
        const metrics = getSystemMetrics();
        
        // Determine overall status
        const allStatuses = [database.status, api.status, auth.status];
        let overallStatus = 'healthy';
        
        if (allStatuses.includes('down')) {
            overallStatus = 'down';
        } else if (allStatuses.includes('degraded')) {
            overallStatus = 'degraded';
        }
        
        const result: SimpleHealthStatus = {
            status: overallStatus,
            timestamp: now,
            services: {
                database: {
                    status: database.status,
                    responseTime: database.responseTime,
                    lastChecked: now
                },
                api: {
                    status: api.status,
                    responseTime: api.responseTime,
                    lastChecked: now
                },
                auth: {
                    status: auth.status,
                    responseTime: auth.responseTime,
                    lastChecked: now
                }
            },
            metrics
        };
        
        const response = NextResponse.json(result);
        
        // Add cache headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error) {
        console.error('Admin health check failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}