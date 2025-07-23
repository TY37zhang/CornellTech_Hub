import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin, isMod } from '@/lib/roles';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportId } = await params;

        const report = await prisma.reports.findUnique({
            where: { id: reportId },
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

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Get detailed reported content
        let reportedContent = null;
        let reportedUser = null;

        try {
            switch (report.reported_item_type) {
                case 'post':
                    reportedContent = await prisma.forum_posts.findUnique({
                        where: { id: report.reported_item_id },
                        include: {
                            users: {
                                select: { name: true, email: true, id: true }
                            },
                            forum_categories: {
                                select: { name: true }
                            }
                        }
                    });
                    if (reportedContent) {
                        reportedUser = reportedContent.users;
                    }
                    break;
                case 'comment':
                    reportedContent = await prisma.forum_comments.findUnique({
                        where: { id: report.reported_item_id },
                        include: {
                            users: {
                                select: { name: true, email: true, id: true }
                            },
                            forum_posts: {
                                select: { title: true }
                            }
                        }
                    });
                    if (reportedContent) {
                        reportedUser = reportedContent.users;
                    }
                    break;
                case 'review':
                    reportedContent = await prisma.course_reviews.findUnique({
                        where: { id: report.reported_item_id },
                        include: {
                            users: {
                                select: { name: true, email: true, id: true }
                            },
                            courses: {
                                select: { name: true, code: true }
                            }
                        }
                    });
                    if (reportedContent) {
                        reportedUser = reportedContent.users;
                    }
                    break;
                case 'reply':
                    reportedContent = await prisma.review_replies.findUnique({
                        where: { id: report.reported_item_id },
                        include: {
                            users: {
                                select: { name: true, email: true, id: true }
                            },
                            course_reviews: {
                                include: {
                                    courses: {
                                        select: { name: true, code: true }
                                    }
                                }
                            }
                        }
                    });
                    if (reportedContent) {
                        reportedUser = reportedContent.users;
                    }
                    break;
                case 'user':
                    reportedUser = await prisma.users.findUnique({
                        where: { id: report.reported_item_id },
                        select: { 
                            id: true,
                            name: true, 
                            email: true, 
                            role: true,
                            program: true,
                            created_at: true
                        }
                    });
                    break;
            }
        } catch (error) {
            console.error('Error fetching reported content:', error);
        }

        // Get moderation history
        const moderationLogs = await prisma.moderation_logs.findMany({
            where: {
                OR: [
                    { target_type: 'report', target_id: reportId },
                    { target_type: report.reported_item_type, target_id: report.reported_item_id }
                ]
            },
            include: {
                users: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({
            ...report,
            reportedContent,
            reportedUser,
            moderationLogs
        });
    } catch (error) {
        console.error('Error fetching report details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || (!isAdmin(session.user) && !isMod(session.user))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { reportId } = await params;
        const body = await request.json();
        const { status, adminNotes, moderationAction } = body;

        if (!reportId) {
            return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
        }

        // First get the report to know what we're dealing with
        const report = await prisma.reports.findUnique({
            where: { id: reportId }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        // Update report status if provided
        let updatedReport = report;
        if (status) {
            if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
            }

            updatedReport = await prisma.reports.update({
                where: { id: reportId },
                data: {
                    status,
                    admin_notes: adminNotes || updatedReport.admin_notes,
                    updated_at: new Date(),
                }
            });

            // Log the report status change
            await prisma.moderation_logs.create({
                data: {
                    moderator_id: session.user.id,
                    action: `report_${status}`,
                    target_type: 'report',
                    target_id: reportId,
                    reason: `Report marked as ${status}`,
                    notes: adminNotes,
                }
            });
        }

        // Apply moderation action to the reported content if specified
        if (moderationAction && ['hide', 'delete', 'restore', 'approve', 'dismiss'].includes(moderationAction)) {
            try {
                await applyModerationAction(
                    report.reported_item_type,
                    report.reported_item_id,
                    moderationAction,
                    session.user.id,
                    `Applied via report ${reportId}: ${adminNotes || 'No additional notes'}`
                );
            } catch (error) {
                console.error('Error applying moderation action:', error);
                
                // Check if it's a "content not found" error
                if (error instanceof Error && error.message.includes('content not found')) {
                    // Still update the report status but warn about missing content
                    return NextResponse.json({ 
                        ...updatedReport,
                        warning: 'Report processed, but the reported content was not found (may have been deleted)' 
                    });
                }
                
                return NextResponse.json({ error: 'Failed to apply moderation action' }, { status: 500 });
            }
        } else if (status && (status === 'resolved' || status === 'dismissed')) {
            // If report is being resolved or dismissed without specific moderation action,
            // automatically restore content to active if it's currently hidden
            try {
                // First check the current status of the content
                let currentContent = null;
                switch (report.reported_item_type) {
                    case 'post':
                        currentContent = await prisma.forum_posts.findUnique({
                            where: { id: report.reported_item_id },
                            select: { status: true }
                        });
                        break;
                    case 'comment':
                        currentContent = await prisma.forum_comments.findUnique({
                            where: { id: report.reported_item_id },
                            select: { status: true }
                        });
                        break;
                    case 'review':
                        currentContent = await prisma.course_reviews.findUnique({
                            where: { id: report.reported_item_id },
                            select: { status: true }
                        });
                        break;
                    case 'reply':
                        currentContent = await prisma.review_replies.findUnique({
                            where: { id: report.reported_item_id },
                            select: { status: true }
                        });
                        break;
                }

                // If content is currently hidden, restore it to active
                if (currentContent && currentContent.status === 'hidden') {
                    await applyModerationAction(
                        report.reported_item_type,
                        report.reported_item_id,
                        'restore',
                        session.user.id,
                        `Content restored automatically when report ${reportId} was ${status}: ${adminNotes || 'No additional notes'}`
                    );
                }
            } catch (error) {
                console.error('Error auto-restoring content:', error);
                // Don't fail the entire request if auto-restore fails
            }
        }

        return NextResponse.json(updatedReport);
    } catch (error) {
        console.error('Error updating report:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function applyModerationAction(
    itemType: string,
    itemId: string,
    action: string,
    moderatorId: string,
    reason: string
) {
    const now = new Date();
    // Determine the new status based on action
    let newStatus: string;
    switch (action) {
        case 'restore':
        case 'approve':
        case 'dismiss':
            newStatus = 'active';
            break;
        case 'delete':
            newStatus = 'deleted';
            break;
        case 'hide':
            newStatus = 'hidden';
            break;
        default:
            newStatus = 'hidden';
    }

    let updateResult: any = null;

    try {
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
                    notes: 'Content permanently deleted from database via report moderation',
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
                    throw new Error(`Unsupported item type: ${itemType}`);
            }

            // Check if the item was found and deleted
            if (updateResult && updateResult.count === 0) {
                console.warn(`Content not found for deletion: ${itemType} ${itemId}`);
                await prisma.moderation_logs.create({
                    data: {
                        moderator_id: moderatorId,
                        action,
                        target_type: itemType,
                        target_id: itemId,
                        reason: `${reason} (Content not found - possibly already deleted)`,
                        notes: 'Content was not found in database',
                    }
                });
                throw new Error(`${itemType} content not found - it may have been already deleted`);
            }

            return;
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
                break;
            default:
                throw new Error(`Unsupported item type: ${itemType}`);
        }

        // Check if the item was found and updated
        if (updateResult && updateResult.count === 0) {
            console.warn(`Content not found for moderation: ${itemType} ${itemId}`);
            // Still log the action attempt for audit purposes
            await prisma.moderation_logs.create({
                data: {
                    moderator_id: moderatorId,
                    action,
                    target_type: itemType,
                    target_id: itemId,
                    reason: `${reason} (Content not found - possibly already deleted)`,
                    notes: 'Content was not found in database',
                }
            });
            throw new Error(`${itemType} content not found - it may have been already deleted`);
        }

        // Log the successful moderation action
        await prisma.moderation_logs.create({
            data: {
                moderator_id: moderatorId,
                action,
                target_type: itemType,
                target_id: itemId,
                reason,
            }
        });

    } catch (error) {
        console.error(`Error applying moderation action to ${itemType} ${itemId}:`, error);
        throw error;
    }
}