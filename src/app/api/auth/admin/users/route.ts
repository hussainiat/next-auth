import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
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

    // Get all users with basic info (excluding password)
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        approvalStatus: users.approvalStatus,
        approvedBy: users.approvedBy,
        approvedAt: users.approvedAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}