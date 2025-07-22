import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin } from '@/lib/roles';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all feedback with user information
        const feedback = await prisma.feedback.findMany({
            include: {
                users: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        return NextResponse.json({ 
            feedback: feedback,
            total: feedback.length,
            pending: feedback.filter(f => f.status === 'pending').length,
            in_progress: feedback.filter(f => f.status === 'in_progress').length,
            resolved: feedback.filter(f => f.status === 'resolved').length,
            unread: feedback.filter(f => !f.read).length,
            read: feedback.filter(f => f.read).length,
        });
    } catch (error) {
        console.error('Error fetching admin feedback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, status, admin_notes, read } = body;

        if (!id) {
            return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
        }

        // Update feedback status, admin notes, and read status
        const updatedFeedback = await prisma.feedback.update({
            where: { id: parseInt(id) },
            data: {
                status: status !== undefined ? status : undefined,
                admin_notes: admin_notes !== undefined ? admin_notes : undefined,
                read: read !== undefined ? read : undefined,
            },
            include: {
                users: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        return NextResponse.json({ 
            success: true,
            feedback: updatedFeedback
        });
    } catch (error) {
        console.error('Error updating feedback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}