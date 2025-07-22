import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin, isMod } from '@/lib/roles';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, targetType, targetId, reason, notes } = body;

        if (!action || !targetType || !targetId) {
            return NextResponse.json({ 
                error: 'Action, target type, and target ID are required' 
            }, { status: 400 });
        }

        if (!['hide', 'delete', 'restore', 'approve', 'flag', 'unflag', 'dismiss'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (!['post', 'comment', 'review', 'reply'].includes(targetType)) {
            return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
        }

        // Apply the moderation action
        const result = await applyModerationAction(
            targetType,
            targetId,
            action,
            session.user.id,
            reason || 'Direct moderation action',
            notes
        );

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully applied ${action} to ${targetType}`,
            item: result.item
        });
    } catch (error) {
        console.error('Error applying moderation action:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'flagged';
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Get flagged content based on status and type
        const results: any = {
            posts: [],
            comments: [],
            reviews: [],
            replies: []
        };

        if (!type || type === 'post') {
            results.posts = await prisma.forum_posts.findMany({
                where: { 
                    status: status === 'all' ? undefined : status 
                },
                include: {
                    users: { select: { name: true, email: true } },
                    forum_categories: { select: { name: true } },
                    _count: { select: { forum_comments: true } }
                },
                orderBy: { created_at: 'desc' },
                skip: type === 'post' ? skip : 0,
                take: type === 'post' ? limit : 10,
            });
        }

        if (!type || type === 'comment') {
            results.comments = await prisma.forum_comments.findMany({
                where: { 
                    status: status === 'all' ? undefined : status 
                },
                include: {
                    users: { select: { name: true, email: true } },
                    forum_posts: { select: { title: true } },
                },
                orderBy: { created_at: 'desc' },
                skip: type === 'comment' ? skip : 0,
                take: type === 'comment' ? limit : 10,
            });
        }

        if (!type || type === 'review') {
            results.reviews = await prisma.course_reviews.findMany({
                where: { 
                    status: status === 'all' ? undefined : status 
                },
                include: {
                    users: { select: { name: true, email: true } },
                    courses: { select: { name: true, code: true } },
                },
                orderBy: { created_at: 'desc' },
                skip: type === 'review' ? skip : 0,
                take: type === 'review' ? limit : 10,
            });
        }

        if (!type || type === 'reply') {
            results.replies = await prisma.review_replies.findMany({
                where: { 
                    status: status === 'all' ? undefined : status 
                },
                include: {
                    users: { select: { name: true, email: true } },
                    course_reviews: {
                        include: {
                            courses: { select: { name: true, code: true } }
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                skip: type === 'reply' ? skip : 0,
                take: type === 'reply' ? limit : 10,
            });
        }

        // Get total counts for pagination
        const counts = await Promise.all([
            type === 'post' ? prisma.forum_posts.count({ where: { status: status === 'all' ? undefined : status } }) : 0,
            type === 'comment' ? prisma.forum_comments.count({ where: { status: status === 'all' ? undefined : status } }) : 0,
            type === 'review' ? prisma.course_reviews.count({ where: { status: status === 'all' ? undefined : status } }) : 0,
            type === 'reply' ? prisma.review_replies.count({ where: { status: status === 'all' ? undefined : status } }) : 0,
        ]);

        const totalCount = type ? counts[['post', 'comment', 'review', 'reply'].indexOf(type)] : 0;

        return NextResponse.json({
            ...results,
            pagination: type ? {
                page,
                limit,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit),
            } : null
        });
    } catch (error) {
        console.error('Error fetching flagged content:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function applyModerationAction(
    itemType: string,
    itemId: string,
    action: string,
    moderatorId: string,
    reason: string,
    notes?: string
): Promise<{ success: boolean; error?: string; item?: any }> {
    try {
        const now = new Date();
        let newStatus: string;
        
        switch (action) {
            case 'hide':
                newStatus = 'hidden';
                break;
            case 'delete':
                newStatus = 'deleted';
                break;
            case 'restore':
            case 'approve':
                newStatus = 'active';
                break;
            case 'flag':
                newStatus = 'flagged';
                break;
            case 'unflag':
            case 'dismiss':
                newStatus = 'active';
                break;
            default:
                return { success: false, error: 'Invalid action' };
        }

        let updatedItem: any = null;
        let updateResult: any = null;

        // Handle deletion separately - actually remove from database
        if (action === 'delete') {
            // Log the moderation action before deletion for audit trail
            await prisma.moderation_logs.create({
                data: {
                    moderator_id: moderatorId,
                    action,
                    target_type: itemType,
                    target_id: itemId,
                    reason,
                    notes: 'Content permanently deleted from database',
                }
            });

            // Actually delete the record from the database
            switch (itemType) {
                case 'post':
                    updateResult = await prisma.forum_posts.deleteMany({
                        where: { id: itemId }
                    });
                    break;
                case 'comment':
                    updateResult = await prisma.forum_comments.deleteMany({
                        where: { id: itemId }
                    });
                    break;
                case 'review':
                    updateResult = await prisma.course_reviews.deleteMany({
                        where: { id: itemId }
                    });
                    break;
                case 'reply':
                    updateResult = await prisma.review_replies.deleteMany({
                        where: { id: itemId }
                    });
                    break;
                default:
                    return { success: false, error: 'Invalid action' };
            }

            // Check if the item was found and deleted
            if (!updateResult || updateResult.count === 0) {
                console.warn(`Content not found for deletion: ${itemType} ${itemId}`);
                return { success: false, error: `${itemType} content not found - it may have been already deleted` };
            }

            return { success: true, item: { id: itemId, status: 'deleted', deletedPermanently: true } };
        }

        // For non-delete actions, update status as before
        switch (itemType) {
            case 'post':
                updateResult = await prisma.forum_posts.updateMany({
                    where: { id: itemId },
                    data: {
                        status: newStatus,
                        moderated_by: moderatorId,
                        moderated_at: now,
                        moderation_reason: reason,
                    }
                });
                
                if (updateResult.count > 0) {
                    // Fetch the updated item with relations for response
                    updatedItem = await prisma.forum_posts.findUnique({
                        where: { id: itemId },
                        include: {
                            users: { select: { name: true, email: true } },
                            forum_categories: { select: { name: true } }
                        }
                    });
                }
                break;
                
            case 'comment':
                updateResult = await prisma.forum_comments.updateMany({
                    where: { id: itemId },
                    data: {
                        status: newStatus,
                        is_deleted: action === 'delete',
                        moderated_by: moderatorId,
                        moderated_at: now,
                        moderation_reason: reason,
                    }
                });
                
                if (updateResult.count > 0) {
                    updatedItem = await prisma.forum_comments.findUnique({
                        where: { id: itemId },
                        include: {
                            users: { select: { name: true, email: true } },
                            forum_posts: { select: { title: true } }
                        }
                    });
                }
                break;
                
            case 'review':
                updateResult = await prisma.course_reviews.updateMany({
                    where: { id: itemId },
                    data: {
                        status: newStatus,
                        moderated_by: moderatorId,
                        moderated_at: now,
                        moderation_reason: reason,
                    }
                });
                
                if (updateResult.count > 0) {
                    updatedItem = await prisma.course_reviews.findUnique({
                        where: { id: itemId },
                        include: {
                            users: { select: { name: true, email: true } },
                            courses: { select: { name: true, code: true } }
                        }
                    });
                }
                break;
                
            case 'reply':
                updateResult = await prisma.review_replies.updateMany({
                    where: { id: itemId },
                    data: {
                        status: newStatus,
                        moderated_by: moderatorId,
                        moderated_at: now,
                        moderation_reason: reason,
                    }
                });
                
                if (updateResult.count > 0) {
                    updatedItem = await prisma.review_replies.findUnique({
                        where: { id: itemId },
                        include: {
                            users: { select: { name: true, email: true } },
                            course_reviews: {
                                include: {
                                    courses: { select: { name: true, code: true } }
                                }
                            }
                        }
                    });
                }
                break;
                
            default:
                return { success: false, error: 'Unsupported item type' };
        }

        // Check if the item was found and updated
        if (!updateResult || updateResult.count === 0) {
            console.warn(`Content not found for moderation: ${itemType} ${itemId}`);
            return { success: false, error: `${itemType} content not found - it may have been already deleted` };
        }

        // Log the moderation action
        await prisma.moderation_logs.create({
            data: {
                moderator_id: moderatorId,
                action,
                target_type: itemType,
                target_id: itemId,
                reason,
                notes,
            }
        });

        return { success: true, item: updatedItem };
    } catch (error) {
        console.error('Error in applyModerationAction:', error);
        return { success: false, error: 'Database operation failed' };
    }
}