import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
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

    // Get pending users
    const pendingUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        approvalStatus: users.approvalStatus,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.approvalStatus, 'pending'))
      .orderBy(users.createdAt);

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error('Get pending users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}