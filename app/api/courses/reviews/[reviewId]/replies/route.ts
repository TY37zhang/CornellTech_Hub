import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isFaculty } from '@/lib/roles';
import { sanitizeContent } from '@/lib/sanitization';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params;

    const replies = await prisma.review_replies.findMany({
      where: {
        review_id: reviewId,
        status: 'active', // Only show active replies
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
      orderBy: {
        created_at: 'asc',
      },
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching review replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reviewId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reply content is required' },
        { status: 400 }
      );
    }

    // Get user data including role
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, role: true, is_admin: true, is_mod: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has faculty role
    if (!isFaculty(user.role)) {
      return NextResponse.json(
        { 
          error: 'Only faculty members can reply to course reviews',
          message: 'Faculty permission required to reply to reviews'
        },
        { status: 403 }
      );
    }

    // Verify the review exists
    const review = await prisma.course_reviews.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
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

    // Create the reply
    const reply = await prisma.review_replies.create({
      data: {
        review_id: reviewId,
        author_id: user.id,
        content: sanitizationResult.sanitized,
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

    return NextResponse.json(
      { 
        reply,
        message: 'Reply created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}