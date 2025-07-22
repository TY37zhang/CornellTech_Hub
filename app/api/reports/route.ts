import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';

interface ReportRequest {
  reported_item_type: string;
  reported_item_id: string;
  reason: string;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: ReportRequest = await request.json();
    const { reported_item_type, reported_item_id, reason, description } = body;

    // Validation
    if (!reported_item_type || !reported_item_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate reported_item_type
    const validTypes = ['post', 'comment', 'review', 'user'];
    if (!validTypes.includes(reported_item_type)) {
      return NextResponse.json(
        { error: 'Invalid item type' },
        { status: 400 }
      );
    }

    // Validate reason
    const validReasons = [
      'spam',
      'harassment', 
      'inappropriate',
      'misinformation',
      'off-topic',
      'academic_integrity',
      'hate_speech',
      'personal_info',
      'copyright',
      'other'
    ];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      );
    }

    // Check if user has already reported this item
    const existingReport = await prisma.reports.findFirst({
      where: {
        reporter_id: session.user.id,
        reported_item_type: reported_item_type,
        reported_item_id: reported_item_id,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this content' },
        { status: 409 }
      );
    }

    // Optional: Verify the reported item exists based on type
    let itemExists = false;
    try {
      switch (reported_item_type) {
        case 'post':
          const post = await prisma.forum_posts.findUnique({
            where: { id: reported_item_id }
          });
          itemExists = !!post;
          break;
        case 'comment':
          const comment = await prisma.forum_comments.findUnique({
            where: { id: reported_item_id }
          });
          itemExists = !!comment;
          break;
        case 'review':
          const review = await prisma.course_reviews.findUnique({
            where: { id: reported_item_id }
          });
          itemExists = !!review;
          break;
        case 'user':
          const user = await prisma.users.findUnique({
            where: { id: reported_item_id }
          });
          itemExists = !!user;
          break;
      }
    } catch (error) {
      // If verification fails, we'll still allow the report to be created
      // This prevents DB errors from blocking legitimate reports
      console.warn('Could not verify reported item exists:', error);
      itemExists = true; // Assume it exists to allow report
    }

    if (!itemExists) {
      return NextResponse.json(
        { error: 'The reported content no longer exists' },
        { status: 404 }
      );
    }

    // Create the report
    const report = await prisma.reports.create({
      data: {
        reporter_id: session.user.id,
        reported_item_type,
        reported_item_id,
        reason,
        description: description || null,
        status: 'pending',
      },
    });

    // Optional: Log the report creation for monitoring
    console.log(`New report created: ${report.id} by user ${session.user.id} for ${reported_item_type} ${reported_item_id}`);

    return NextResponse.json({ 
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully'
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}