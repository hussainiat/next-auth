import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['super_admin', 'admin', 'user']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = assignRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, role } = validation.data;

    // Get current user from session
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check permissions
    if (currentUser.user.role === 'admin' && role === 'super_admin') {
      return NextResponse.json(
        { error: 'Admin cannot assign super_admin role' },
        { status: 403 }
      );
    }

    if (currentUser.user.role !== 'admin' && currentUser.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Check if target user exists
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Cannot change role of super admin unless you're super admin
    if (targetUser.role === 'super_admin' && currentUser.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot change role of super admin' },
        { status: 403 }
      );
    }

    // Assign the role
    await db
      .update(users)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ 
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Assign role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}