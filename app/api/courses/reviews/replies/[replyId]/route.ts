import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isFaculty, canModerate } from '@/lib/roles';
import { sanitizeContent } from '@/lib/sanitization';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { replyId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    // Get the existing reply
    const existingReply = await prisma.review_replies.findUnique({
      where: { id: replyId },
      include: {
        users: {
          select: { id: true, role: true, is_admin: true, is_mod: true },
        },
      },
    });

    if (!existingReply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Get current user data
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, is_admin: true, is_mod: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user can edit this reply (author or moderator)
    const isAuthor = existingReply.author_id === user.id;
    const canMod = canModerate(user);

    if (!isAuthor && !canMod) {
      return NextResponse.json(
        { error: 'You can only edit your own replies' },
        { status: 403 }
      );
    }

    // Sanitize content
    const sanitizationResult = sanitizeContent(content);
    
    if (!sanitizationResult.isValid) {
      return NextResponse.json(
        { 
          error: 'Content violates community guidelines',
          violations: sanitizationResult.violations
        },
        { status: 400 }
      );
    }

    // Update the reply
    const updatedReply = await prisma.review_replies.update({
      where: { id: replyId },
      data: {
        content: sanitizationResult.sanitized,
        updated_at: new Date(),
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            role: true,
            is_admin: true,
            is_mod: true,
          },
        },
      },
    });

    return NextResponse.json({
      reply: updatedReply,
      message: 'Reply updated successfully'
    });
  } catch (error) {
    console.error('Error updating review reply:', error);
    return NextResponse.json(
      { error: 'Failed to update reply' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ replyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { replyId } = await params;

    // Get the existing reply
    const existingReply = await prisma.review_replies.findUnique({
      where: { id: replyId },
    });

    if (!existingReply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Get current user data
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, is_admin: true, is_mod: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user can delete this reply (author or moderator)
    const isAuthor = existingReply.author_id === user.id;
    const canMod = canModerate(user);

    if (!isAuthor && !canMod) {
      return NextResponse.json(
        { error: 'You can only delete your own replies' },
        { status: 403 }
      );
    }

    // Delete the reply
    await prisma.review_replies.delete({
      where: { id: replyId },
    });

    return NextResponse.json({
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
}