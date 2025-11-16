import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

const rejectUserSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = rejectUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId, reason } = validation.data;

    // Get current user from session
    const currentUser = await getCurrentUser();
    
    if (!currentUser?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin privileges
    if (currentUser.user.role !== 'admin' && currentUser.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Check if target user exists and is pending
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

    if (targetUser.approvalStatus !== 'pending') {
      return NextResponse.json(
        { error: 'User is not pending approval' },
        { status: 400 }
      );
    }

    // Reject the user
    await db
      .update(users)
      .set({
        approvalStatus: 'rejected',
        approvedBy: currentUser.user.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ 
      message: 'User rejected successfully',
      reason 
    });
  } catch (error) {
    console.error('Reject user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}