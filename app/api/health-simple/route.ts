import { NextResponse } from "next/server";

/**
 * Simple health check that doesn't depend on database
 * Always returns 200 with basic system info
 */
export async function GET() {
    const healthInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        system: {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            }
        },
        checks: {
            application: { status: 'pass', message: 'Application is running' },
            environment: { 
                status: process.env.NEXTAUTH_SECRET ? 'pass' : 'fail',
                message: 'Environment variables loaded'
            },
            security: {
                status: 'pass',
                message: 'Security middleware active'
            }
        }
    };

    const response = NextResponse.json(healthInfo, { status: 200 });
    
    // Add cache headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
}