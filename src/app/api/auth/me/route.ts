import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { tokenManager } from '@/lib/auth/token-utils';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { isTokenMode } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    let userId: string | null = null;

    if (isTokenMode) {
      // Get access token from Authorization header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'No access token provided' },
          { status: 401 }
        );
      }

      const accessToken = authHeader.substring(7);
      const payload = await tokenManager.verifyAccessToken(accessToken);
      
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired access token' },
          { status: 401 }
        );
      }

      userId = payload.userId;
    } else {
      // Get user from session
      const session = await getSession();
      if (!session.isLoggedIn || !session.user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      userId = session.user.id;
    }

    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId!));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data (excluding password)
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}