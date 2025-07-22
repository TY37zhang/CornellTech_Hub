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
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }

        const [reports, totalCount] = await Promise.all([
            prisma.reports.findMany({
                where: whereClause,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.reports.count({ where: whereClause })
        ]);

        // Enrich reports with reported content preview
        const enrichedReports = await Promise.all(
            reports.map(async (report) => {
                let contentPreview = null;
                let reportedUser = null;

                try {
                    switch (report.reported_item_type) {
                        case 'post':
                            const post = await prisma.forum_posts.findUnique({
                                where: { id: report.reported_item_id },
                                select: { title: true, content: true, author_id: true },
                            });
                            if (post) {
                                const author = await prisma.users.findUnique({
                                    where: { id: post.author_id },
                                    select: { name: true, email: true }
                                });
                                contentPreview = { title: post.title, content: post.content.substring(0, 200) + '...' };
                                reportedUser = author;
                            }
                            break;
                        case 'comment':
                            const comment = await prisma.forum_comments.findUnique({
                                where: { id: report.reported_item_id },
                                select: { content: true, author_id: true },
                            });
                            if (comment) {
                                const author = await prisma.users.findUnique({
                                    where: { id: comment.author_id },
                                    select: { name: true, email: true }
                                });
                                contentPreview = { content: comment.content.substring(0, 200) + '...' };
                                reportedUser = author;
                            }
                            break;
                        case 'review':
                            const review = await prisma.course_reviews.findUnique({
                                where: { id: report.reported_item_id },
                                select: { content: true, author_id: true },
                            });
                            if (review) {
                                const author = await prisma.users.findUnique({
                                    where: { id: review.author_id },
                                    select: { name: true, email: true }
                                });
                                contentPreview = { content: review.content.substring(0, 200) + '...' };
                                reportedUser = author;
                            }
                            break;
                        case 'reply':
                            const reply = await prisma.review_replies.findUnique({
                                where: { id: report.reported_item_id },
                                select: { content: true, author_id: true },
                            });
                            if (reply) {
                                const author = await prisma.users.findUnique({
                                    where: { id: reply.author_id },
                                    select: { name: true, email: true }
                                });
                                contentPreview = { content: reply.content.substring(0, 200) + '...' };
                                reportedUser = author;
                            }
                            break;
                        case 'user':
                            reportedUser = await prisma.users.findUnique({
                                where: { id: report.reported_item_id },
                                select: { name: true, email: true }
                            });
                            break;
                    }
                } catch (error) {
                    console.error('Error fetching reported content:', error);
                }

                // Get moderation history for this report
                const moderationHistory = await prisma.moderation_logs.findMany({
                    where: {
                        OR: [
                            { target_type: 'report', target_id: report.id },
                            { target_type: report.reported_item_type, target_id: report.reported_item_id }
                        ]
                    },
                    include: {
                        users: {
                            select: { name: true, email: true, role: true }
                        }
                    },
                    orderBy: { created_at: 'desc' }
                });

                return {
                    ...report,
                    contentPreview,
                    reportedUser,
                    moderationHistory,
                };
            })
        );

        return NextResponse.json({
            reports: enrichedReports,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        });
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { reportId, status, adminNotes } = body;

        if (!reportId || !status) {
            return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
        }

        if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const updatedReport = await prisma.reports.update({
            where: { id: reportId },
            data: {
                status,
                admin_notes: adminNotes || null,
                updated_at: new Date(),
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // Log moderation action
        await prisma.moderation_logs.create({
            data: {
                moderator_id: session.user.id,
                action: status === 'resolved' ? 'resolve_report' : status === 'dismissed' ? 'dismiss_report' : 'review_report',
                target_type: 'report',
                target_id: reportId,
                reason: `Report ${status}`,
                notes: adminNotes,
            }
        });

        return NextResponse.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}