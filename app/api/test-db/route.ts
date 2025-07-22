import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
    try {
        console.log('Testing database connection...');
        
        // Test 1: Basic query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('Basic query result:', result);
        
        // Test 2: Check if users table exists
        try {
            const userCount = await prisma.users.count();
            console.log('User count:', userCount);
            
            return NextResponse.json({
                success: true,
                message: 'Database connection successful',
                details: {
                    basicQuery: result,
                    userCount,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (tableError) {
            console.error('Users table error:', tableError);
            
            return NextResponse.json({
                success: false,
                message: 'Database connected but users table issue',
                details: {
                    basicQuery: result,
                    tableError: tableError instanceof Error ? tableError.message : 'Unknown table error',
                    timestamp: new Date().toISOString()
                }
            }, { status: 200 }); // Still return 200 since basic connection works
        }
        
    } catch (error) {
        console.error('Database connection failed:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Database connection failed',
            details: {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString()
            }
        }, { status: 503 });
    }
}