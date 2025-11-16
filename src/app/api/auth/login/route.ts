import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { tokenManager } from '@/lib/auth/token-utils';
import { createSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import { config, isTokenMode } from '@/lib/config';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { passwordHash: _, ...userWithoutPassword } = user;

    if (isTokenMode) {
      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = await tokenManager.generateAccessToken(tokenPayload);
      const { token: refreshToken } = await tokenManager.generateRefreshToken(user.id);

      // Set refresh token as httpOnly cookie
      const response = NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
        accessToken,
      });

      response.cookies.set('refresh-token', refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    } else {
      // Create session
      await createSession(user);

      return NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}