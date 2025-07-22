import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin } from '@/lib/roles';

interface DatabaseStats {
    tables: {
        users: number;
        forum_posts: number;
        forum_comments: number;
        course_reviews: number;
        course_planner: number;
        course_schedules: number;
        feedback: number;
        reports: number;
        review_replies: number;
        courses: number;
    };
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get table counts with error handling
        const [
            usersCount,
            forumPostsCount,
            forumCommentsCount,
            courseReviewsCount,
            coursePlannerCount,
            courseSchedulesCount,
            feedbackCount,
            reportsCount,
            reviewRepliesCount,
            coursesCount
        ] = await Promise.all([
            prisma.users.count(),
            prisma.forum_posts.count(),
            prisma.forum_comments.count(),
            prisma.course_reviews.count(),
            prisma.course_planner.count().catch((e: any) => { console.log('course_planner error:', e); return 0; }),
            prisma.course_schedules.count().catch((e: any) => { console.log('course_schedules error:', e); return 0; }),
            prisma.feedback.count().catch((e: any) => { console.log('feedback error:', e); return 0; }),
            prisma.reports.count().catch((e: any) => { console.log('reports error:', e); return 0; }),
            prisma.review_replies.count().catch((e: any) => { console.log('review_replies error:', e); return 0; }),
            prisma.courses.count()
        ]);


        // Only return real database table counts
        const stats: DatabaseStats = {
            tables: {
                users: usersCount,
                forum_posts: forumPostsCount,
                forum_comments: forumCommentsCount,
                course_reviews: courseReviewsCount,
                course_planner: coursePlannerCount || 0,
                course_schedules: courseSchedulesCount || 0,
                feedback: feedbackCount || 0,
                reports: reportsCount,
                review_replies: reviewRepliesCount || 0,
                courses: coursesCount,
            },
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching database stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}