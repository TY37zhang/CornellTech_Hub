import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin, isMod } from '@/lib/roles';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '7'; // days
        const daysAgo = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Get report statistics
        const [
            totalReports,
            pendingReports,
            resolvedReports,
            dismissedReports,
            recentReports
        ] = await Promise.all([
            prisma.reports.count(),
            prisma.reports.count({ where: { status: 'pending' } }),
            prisma.reports.count({ where: { status: 'resolved' } }),
            prisma.reports.count({ where: { status: 'dismissed' } }),
            prisma.reports.count({ 
                where: { 
                    created_at: { gte: startDate } 
                } 
            })
        ]);

        // Get content moderation statistics
        const [
            totalModerationActions,
            recentModerationActions,
            hiddenContent,
            deletedContent,
            flaggedContent
        ] = await Promise.all([
            prisma.moderation_logs.count(),
            prisma.moderation_logs.count({ 
                where: { 
                    created_at: { gte: startDate } 
                } 
            }),
            Promise.all([
                prisma.forum_posts.count({ where: { status: 'hidden' } }),
                prisma.forum_comments.count({ where: { status: 'hidden' } }),
                prisma.course_reviews.count({ where: { status: 'hidden' } }),
                prisma.review_replies.count({ where: { status: 'hidden' } })
            ]).then(counts => counts.reduce((sum, count) => sum + count, 0)),
            Promise.all([
                prisma.forum_posts.count({ where: { status: 'deleted' } }),
                prisma.forum_comments.count({ where: { status: 'deleted' } }),
                prisma.course_reviews.count({ where: { status: 'deleted' } }),
                prisma.review_replies.count({ where: { status: 'deleted' } })
            ]).then(counts => counts.reduce((sum, count) => sum + count, 0)),
            Promise.all([
                prisma.forum_posts.count({ where: { status: 'flagged' } }),
                prisma.forum_comments.count({ where: { status: 'flagged' } }),
                prisma.course_reviews.count({ where: { status: 'flagged' } }),
                prisma.review_replies.count({ where: { status: 'flagged' } })
            ]).then(counts => counts.reduce((sum, count) => sum + count, 0))
        ]);

        // Get moderator activity statistics
        const topModerators = await prisma.moderation_logs.groupBy({
            by: ['moderator_id'],
            _count: {
                moderator_id: true
            },
            where: {
                created_at: { gte: startDate }
            },
            orderBy: {
                _count: {
                    moderator_id: 'desc'
                }
            },
            take: 5
        });

        // Enrich top moderators with user info
        const enrichedModerators = await Promise.all(
            topModerators.map(async (mod) => {
                const user = await prisma.users.findUnique({
                    where: { id: mod.moderator_id },
                    select: { name: true, email: true }
                });
                return {
                    moderator: user,
                    actionCount: mod._count.moderator_id
                };
            })
        );

        // Get action breakdown
        const actionBreakdown = await prisma.moderation_logs.groupBy({
            by: ['action'],
            _count: {
                action: true
            },
            where: {
                created_at: { gte: startDate }
            }
        });

        // Get content type breakdown for reports
        const reportTypeBreakdown = await prisma.reports.groupBy({
            by: ['reported_item_type'],
            _count: {
                reported_item_type: true
            },
            where: {
                created_at: { gte: startDate }
            }
        });

        // Get daily statistics for the chart
        const dailyStats = [];
        for (let i = daysAgo - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const [reports, actions] = await Promise.all([
                prisma.reports.count({
                    where: {
                        created_at: { gte: date, lt: nextDate }
                    }
                }),
                prisma.moderation_logs.count({
                    where: {
                        created_at: { gte: date, lt: nextDate }
                    }
                })
            ]);

            dailyStats.push({
                date: date.toISOString().split('T')[0],
                reports,
                actions
            });
        }

        const stats = {
            reports: {
                total: totalReports,
                pending: pendingReports,
                resolved: resolvedReports,
                dismissed: dismissedReports,
                recent: recentReports,
                typeBreakdown: reportTypeBreakdown.map(item => ({
                    type: item.reported_item_type,
                    count: item._count.reported_item_type
                }))
            },
            moderation: {
                totalActions: totalModerationActions,
                recentActions: recentModerationActions,
                hiddenContent,
                deletedContent,
                flaggedContent,
                actionBreakdown: actionBreakdown.map(item => ({
                    action: item.action,
                    count: item._count.action
                })),
                topModerators: enrichedModerators
            },
            timeline: dailyStats,
            period: {
                days: daysAgo,
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString()
            }
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching moderation stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}