import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin } from '@/lib/roles';

// Cornell Tech timezone handling
const getEstTime = () => {
    return new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
};

const getAcademicMultiplier = (estTime: Date) => {
    const hour = estTime.getHours();
    const dayOfWeek = estTime.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Academic schedule patterns
    if (isWeekend) {
        // Weekends: lower activity, peak in afternoons
        if (hour >= 14 && hour <= 22) return 1.2; // 2 PM - 10 PM
        if (hour >= 10 && hour <= 13) return 0.8; // 10 AM - 1 PM
        return 0.4; // Night/early morning
    } else {
        // Weekdays: higher activity around class times and evening study
        if (hour >= 18 && hour <= 23) return 1.5; // Evening study time (6 PM - 11 PM)
        if (hour >= 9 && hour <= 17) return 1.3; // Class hours (9 AM - 5 PM)
        if (hour >= 7 && hour <= 8) return 0.9; // Early morning
        if (hour >= 0 && hour <= 6) return 0.3; // Late night/early morning
        return 0.7; // Other times
    }
};

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only provide sophisticated tracking in production
        if (process.env.NODE_ENV !== 'production') {
            return NextResponse.json({
                onlineUsers: Math.floor(Math.random() * 5) + 2,
                lastUpdated: new Date().toISOString(),
                method: 'development_mock',
                environment: 'development'
            });
        }

        const estTime = getEstTime();
        const now = new Date();
        
        // Multiple time thresholds for different activity types
        const thresholds = {
            veryRecent: new Date(now.getTime() - 3 * 60 * 1000), // 3 minutes - highly active
            recent: new Date(now.getTime() - 8 * 60 * 1000), // 8 minutes - active
            moderatelyRecent: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes - somewhat active
        };

        try {
            // Parallel tracking of multiple activity sources
            const activityPromises = [
                // High-value activities (recent engagement)
                prisma.forum_posts.count({
                    where: { created_at: { gte: thresholds.veryRecent } }
                }),
                prisma.forum_comments.count({
                    where: { created_at: { gte: thresholds.recent } }
                }),
                
                // Medium-value activities  
                prisma.course_reviews.count({
                    where: { created_at: { gte: thresholds.moderatelyRecent } }
                }),
                
                // Background activities (profile views, updates)
                prisma.users.count({
                    where: { updated_at: { gte: thresholds.moderatelyRecent } }
                }),
                
                // Chat/messaging activity (if available)
                prisma.chat_messages.count({
                    where: { 
                        created_at: { gte: thresholds.recent },
                        user_id: { not: null }
                    }
                }).catch(() => 0),
                
                // Get total user count for percentage calculations
                prisma.users.count(),
            ];

            const [
                recentPosts,
                recentComments, 
                recentReviews,
                recentUserUpdates,
                recentChatMessages,
                totalUsers
            ] = await Promise.all(activityPromises);

            // Calculate activity score with weighted importance
            const activityScore = {
                posts: recentPosts * 3.0,        // High weight - creating content
                comments: recentComments * 2.5,  // High weight - engaging
                reviews: recentReviews * 2.0,    // Medium weight - longer session
                updates: recentUserUpdates * 1.5, // Medium weight - profile activity
                chat: recentChatMessages * 2.0,   // High weight - real-time engagement
            };

            const totalActivityScore = Object.values(activityScore).reduce((sum, score) => sum + score, 0);

            // Estimate unique active users based on activity patterns
            // Assumption: Each active user generates 2-4 activity points on average
            let estimatedActiveUsers = Math.floor(totalActivityScore / 2.5);

            // Apply Cornell Tech academic schedule multiplier
            const academicMultiplier = getAcademicMultiplier(estTime);
            estimatedActiveUsers = Math.floor(estimatedActiveUsers * academicMultiplier);

            // If low activity detected, use intelligent baseline
            if (estimatedActiveUsers < 3) {
                const baselinePercentage = academicMultiplier > 1.2 ? 0.08 : 0.04; // 8% peak, 4% off-peak
                const randomVariance = 0.7 + (Math.random() * 0.6); // 70% to 130%
                estimatedActiveUsers = Math.max(2, Math.floor(totalUsers * baselinePercentage * randomVariance));
            }

            // Account for passive browsers (lurkers) - multiply by 1.8-2.5x
            const lurkerMultiplier = 1.8 + (Math.random() * 0.7);
            const finalOnlineCount = Math.floor(estimatedActiveUsers * lurkerMultiplier);

            // Apply realistic caps based on user base size
            const maxOnlineUsers = Math.min(Math.floor(totalUsers * 0.25), 80); // Cap at 25% of users or 80
            const cappedCount = Math.min(finalOnlineCount, maxOnlineUsers);

            return NextResponse.json({
                onlineUsers: Math.max(cappedCount, 3), // Minimum of 3 users
                lastUpdated: now.toISOString(),
                method: 'production_activity_tracking',
                environment: 'production',
                debug: {
                    estTime: estTime.toISOString(),
                    hour: estTime.getHours(),
                    academicMultiplier: Math.round(academicMultiplier * 100) / 100,
                    activityScore: totalActivityScore,
                    totalUsers,
                    estimatedActive: estimatedActiveUsers,
                    lurkerMultiplier: Math.round(lurkerMultiplier * 100) / 100
                }
            });

        } catch (dbError) {
            console.error('Database error in production online tracking:', dbError);
            
            // Sophisticated fallback using time-based estimation
            const academicMultiplier = getAcademicMultiplier(estTime);
            const hour = estTime.getHours();
            
            // Time-based realistic estimates for Cornell Tech
            let baseCount: number;
            if (hour >= 18 && hour <= 23) {
                baseCount = 12; // Evening study peak
            } else if (hour >= 9 && hour <= 17) {
                baseCount = 8; // Class hours
            } else if (hour >= 7 && hour <= 8) {
                baseCount = 4; // Morning
            } else {
                baseCount = 2; // Off hours
            }
            
            const variance = Math.floor(Math.random() * 6); // 0-5 additional
            const fallbackCount = Math.floor((baseCount + variance) * academicMultiplier);
            
            return NextResponse.json({
                onlineUsers: Math.max(fallbackCount, 2),
                lastUpdated: now.toISOString(),
                method: 'fallback_time_based',
                environment: 'production'
            });
        }

    } catch (error) {
        console.error('Error in online users tracking:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}