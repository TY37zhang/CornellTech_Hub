import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db/prisma';
import { isAdmin } from '@/lib/roles';
import { user_role } from '@prisma/client';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !isAdmin(session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, role, is_admin, is_mod } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Validate role if provided
        if (role && !['student', 'faculty', 'staff'].includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Prevent admins from removing their own admin privileges
        if (userId === session.user.id && is_admin === false) {
            return NextResponse.json({ error: 'Cannot remove your own admin privileges' }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {};
        if (role !== undefined) updateData.role = role;
        if (is_admin !== undefined) updateData.is_admin = is_admin;
        if (is_mod !== undefined) updateData.is_mod = is_mod;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                is_admin: true,
                is_mod: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}