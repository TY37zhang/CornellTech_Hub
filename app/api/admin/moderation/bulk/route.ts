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
        const { action, items, reason, notes } = body;

        if (!action || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ 
                error: 'Action and items array are required' 
            }, { status: 400 });
        }

        if (!['hide', 'delete', 'restore', 'flag', 'unflag'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const results = [];
        const errors = [];

        // Process each item
        for (const item of items) {
            try {
                if (!item.type || !item.id) {
                    errors.push({ item, error: 'Item type and ID are required' });
                    continue;
                }

                const result = await applyBulkModerationAction(
                    item.type,
                    item.id,
                    action,
                    session.user.id,
                    reason || `Bulk ${action} action`,
                    notes
                );

                if (result.success) {
                    results.push({ item, success: true });
                } else {
                    errors.push({ item, error: result.error });
                }
            } catch (error) {
                console.error('Error processing item:', item, error);
                errors.push({ item, error: 'Processing failed' });
            }
        }

        return NextResponse.json({ 
            success: true,
            processed: results.length,
            errors: errors.length,
            results,
            errors
        });
    } catch (error) {
        console.error('Error in bulk moderation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function applyBulkModerationAction(
    itemType: string,
    itemId: string,
    action: string,
    moderatorId: string,
    reason: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
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
                newStatus = 'active';
                break;
            case 'flag':
                newStatus = 'flagged';
                break;
            case 'unflag':
                newStatus = 'active';
                break;
            default:
                return { success: false, error: 'Invalid action' };
        }

        // Apply moderation based on item type using updateMany to handle missing records gracefully
        let updateResult: any = null;

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
                return { success: false, error: 'Unsupported item type' };
        }

        // Check if the item was found and updated
        if (!updateResult || updateResult.count === 0) {
            console.warn(`Content not found for bulk moderation: ${itemType} ${itemId}`);
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

        return { success: true };
    } catch (error) {
        console.error('Error in applyBulkModerationAction:', error);
        return { success: false, error: 'Database operation failed' };
    }
}