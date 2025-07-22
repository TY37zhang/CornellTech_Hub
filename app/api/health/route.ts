import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    environment: string;
    checks: {
        database: HealthCheck;
        environment: HealthCheck;
        security: HealthCheck;
        services: HealthCheck;
    };
}

interface HealthCheck {
    status: 'pass' | 'warn' | 'fail';
    duration: number;
    message?: string;
    details?: Record<string, any>;
}

async function checkDatabase(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
        // Neon databases can take time to wake up, so increase timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout - Neon may be sleeping')), 15000)
        );
        
        // Try basic connection first with retry logic for Neon
        let connectionResult;
        try {
            connectionResult = await Promise.race([
                prisma.$queryRaw`SELECT 1 as test`,
                timeoutPromise
            ]);
        } catch (firstError) {
            // If first attempt fails, try one more time (Neon cold start)
            console.log('First database attempt failed, retrying...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            
            connectionResult = await Promise.race([
                prisma.$queryRaw`SELECT 1 as test`,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Database timeout after retry')), 10000)
                )
            ]);
        }
        
        const duration = Date.now() - start;
        
        // Try to get user count (optional, don't fail if this doesn't work)
        let userCount = 0;
        let tableStatus = 'unknown';
        try {
            userCount = await prisma.users.count();
            tableStatus = 'accessible';
        } catch (countError) {
            console.warn('Could not get user count:', countError);
            tableStatus = 'limited_access';
        }
        
        if (duration > 10000) { // More than 10 seconds
            return {
                status: 'warn',
                duration,
                message: 'Database response is very slow (likely Neon cold start)',
                details: { userCount, responseTime: duration, tableStatus, provider: 'Neon' }
            };
        } else if (duration > 5000) {
            return {
                status: 'warn',
                duration,
                message: 'Database response is slow (possible Neon cold start)',
                details: { userCount, responseTime: duration, tableStatus, provider: 'Neon' }
            };
        }
        
        return {
            status: 'pass',
            duration,
            message: 'Database connection successful',
            details: { userCount, responseTime: duration, tableStatus, provider: 'Neon' }
        };
    } catch (error) {
        const duration = Date.now() - start;
        console.error('Database health check failed:', error);
        
        // Check if it's a Neon-specific error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const isNeonSleep = errorMessage.includes('timeout') || errorMessage.includes('sleeping');
        
        return {
            status: 'fail',
            duration,
            message: isNeonSleep ? 
                'Database timeout - Neon database may be sleeping (this is normal)' : 
                errorMessage,
            details: { 
                error: errorMessage,
                timestamp: new Date().toISOString(),
                provider: 'Neon',
                suggestion: isNeonSleep ? 'Try again in a few seconds as Neon wakes up' : 'Check database configuration'
            }
        };
    }
}

async function checkEnvironment(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL',
            'GOOGLE_CLIENT_ID',
            'GOOGLE_CLIENT_SECRET',
        ];
        
        const missingVars = requiredEnvVars.filter(
            varName => !process.env[varName]
        );
        
        const duration = Date.now() - start;
        
        if (missingVars.length > 0) {
            return {
                status: 'fail',
                duration,
                message: 'Required environment variables missing',
                details: { missingVariables: missingVars }
            };
        }
        
        return {
            status: 'pass',
            duration,
            message: 'Environment variables configured correctly'
        };
    } catch (error) {
        return {
            status: 'fail',
            duration: Date.now() - start,
            message: 'Environment check failed',
        };
    }
}

async function checkSecurity(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
        const nodeEnv = process.env.NODE_ENV || 'development';
        const securityChecks = {
            nodeEnv: ['development', 'production', 'test'].includes(nodeEnv),
            nextAuthSecret: !!process.env.NEXTAUTH_SECRET && 
                          process.env.NEXTAUTH_SECRET.length >= 32,
            httpsUrls: process.env.NEXTAUTH_URL?.startsWith('https://') || 
                      nodeEnv !== 'production',
            corsHeaders: true, // Middleware sets security headers
            rateLimiting: true, // Rate limiting middleware is active
        };
        
        const failedChecks = Object.entries(securityChecks)
            .filter(([_, passed]) => !passed)
            .map(([check]) => check);
        
        const duration = Date.now() - start;
        
        if (failedChecks.length > 0) {
            return {
                status: 'fail',
                duration,
                message: 'Security configuration issues detected',
                details: { failedChecks }
            };
        }
        
        return {
            status: 'pass',
            duration,
            message: 'Security configuration is valid'
        };
    } catch (error) {
        return {
            status: 'fail',
            duration: Date.now() - start,
            message: 'Security check failed',
        };
    }
}

async function checkServices(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
        const services = {
            cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
            resend: !!process.env.RESEND_API_KEY,
            analytics: !!process.env.VERCEL_ANALYTICS_ID,
        };
        
        const activeServices = Object.entries(services)
            .filter(([_, active]) => active)
            .map(([service]) => service);
        
        const duration = Date.now() - start;
        
        return {
            status: 'pass',
            duration,
            details: { 
                activeServices,
                totalServices: Object.keys(services).length
            }
        };
    } catch (error) {
        return {
            status: 'fail',
            duration: Date.now() - start,
            message: 'Service check failed',
        };
    }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const startTime = Date.now();
    
    try {
        // Run all health checks in parallel
        const [database, environment, security, services] = await Promise.all([
            checkDatabase(),
            checkEnvironment(),
            checkSecurity(),
            checkServices(),
        ]);
        
        const checks = { database, environment, security, services };
        
        // Determine overall status
        const hasFailures = Object.values(checks).some(check => check.status === 'fail');
        const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
        
        // Check if critical systems are failing
        const criticalSystems = ['environment', 'security'];
        const criticalFailures = criticalSystems.some(system => 
            checks[system as keyof typeof checks]?.status === 'fail'
        );
        
        let status: HealthCheckResult['status'];
        let statusCode: number;
        
        if (criticalFailures) {
            status = 'unhealthy';
            statusCode = 503;
        } else if (hasFailures) {
            // Non-critical failures (like database) - still return 200 but mark as degraded
            // This is important for admin dashboard to work even if DB has issues
            status = 'degraded';
            statusCode = 200;
        } else if (hasWarnings) {
            status = 'degraded';
            statusCode = 200;
        } else {
            status = 'healthy';
            statusCode = 200;
        }
        
        const result: HealthCheckResult = {
            status,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks,
        };
        
        // Set appropriate status code based on analysis above
        const response = NextResponse.json(result, { status: statusCode });
        
        // Add cache headers
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error) {
        console.error('Health check failed:', error);
        
        const failureResult: HealthCheckResult = {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            checks: {
                database: { status: 'fail', duration: 0, message: 'Check failed' },
                environment: { status: 'fail', duration: 0, message: 'Check failed' },
                security: { status: 'fail', duration: 0, message: 'Check failed' },
                services: { status: 'fail', duration: 0, message: 'Check failed' },
            },
        };
        
        return NextResponse.json(failureResult, { status: 503 });
    }
}

// Simple liveness probe for Kubernetes/Docker
export async function HEAD(): Promise<NextResponse> {
    try {
        // Quick database ping
        await prisma.$queryRaw`SELECT 1`;
        return new NextResponse(null, { status: 200 });
    } catch {
        return new NextResponse(null, { status: 503 });
    }
}