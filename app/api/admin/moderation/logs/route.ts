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
        const moderatorId = searchParams.get('moderatorId');
        const action = searchParams.get('action');
        const targetType = searchParams.get('targetType');
        const targetId = searchParams.get('targetId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Build where clause for filtering
        const whereClause: any = {};
        if (moderatorId) whereClause.moderator_id = moderatorId;
        if (action) whereClause.action = action;
        if (targetType) whereClause.target_type = targetType;
        if (targetId) whereClause.target_id = targetId;

        const [logs, totalCount] = await Promise.all([
            prisma.moderation_logs.findMany({
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
            prisma.moderation_logs.count({ where: whereClause })
        ]);

        // Enrich logs with target content information
        const enrichedLogs = await Promise.all(
            logs.map(async (log) => {
                let targetInfo = null;

                try {
                    switch (log.target_type) {
                        case 'post':
                            const post = await prisma.forum_posts.findUnique({
                                where: { id: log.target_id },
                                select: { 
                                    title: true, 
                                    author_id: true,
                                    status: true 
                                },
                            });
                            if (post) {
                                const author = await prisma.users.findUnique({
                                    where: { id: post.author_id },
                                    select: { name: true }
                                });
                                targetInfo = { 
                                    title: post.title, 
                                    author: author?.name || 'Unknown',
                                    status: post.status
                                };
                            }
                            break;
                        case 'comment':
                            const comment = await prisma.forum_comments.findUnique({
                                where: { id: log.target_id },
                                select: { 
                                    content: true, 
                                    author_id: true,
                                    status: true
                                },
                            });
                            if (comment) {
                                const author = await prisma.users.findUnique({
                                    where: { id: comment.author_id },
                                    select: { name: true }
                                });
                                targetInfo = { 
                                    content: comment.content.substring(0, 100) + '...', 
                                    author: author?.name || 'Unknown',
                                    status: comment.status
                                };
                            }
                            break;
                        case 'review':
                            const review = await prisma.course_reviews.findUnique({
                                where: { id: log.target_id },
                                select: { 
                                    content: true, 
                                    author_id: true,
                                    status: true,
                                    course_id: true
                                },
                            });
                            if (review) {
                                const [author, course] = await Promise.all([
                                    prisma.users.findUnique({
                                        where: { id: review.author_id },
                                        select: { name: true }
                                    }),
                                    prisma.courses.findUnique({
                                        where: { id: review.course_id },
                                        select: { name: true, code: true }
                                    })
                                ]);
                                targetInfo = { 
                                    content: review.content.substring(0, 100) + '...', 
                                    author: author?.name || 'Unknown',
                                    course: course ? `${course.code}: ${course.name}` : 'Unknown Course',
                                    status: review.status
                                };
                            }
                            break;
                        case 'reply':
                            const reply = await prisma.review_replies.findUnique({
                                where: { id: log.target_id },
                                select: { 
                                    content: true, 
                                    author_id: true,
                                    status: true
                                },
                            });
                            if (reply) {
                                const author = await prisma.users.findUnique({
                                    where: { id: reply.author_id },
                                    select: { name: true }
                                });
                                targetInfo = { 
                                    content: reply.content.substring(0, 100) + '...', 
                                    author: author?.name || 'Unknown',
                                    status: reply.status
                                };
                            }
                            break;
                    }
                } catch (error) {
                    console.error('Error fetching target info:', error);
                    targetInfo = { error: 'Failed to load target information' };
                }

                return {
                    ...log,
                    targetInfo
                };
            })
        );

        return NextResponse.json({
            logs: enrichedLogs,
            pagination: {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            }
        });
    } catch (error) {
        console.error('Error fetching moderation logs:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}