import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/config';
import { users } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { config } from '@/lib/config';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Check if this is the super admin (first user with super admin email)
    const isSuperAdmin = email === config.superAdminEmail;
    const [userCount] = await db.select({ count: db.fn.count() }).from(users);
    const isFirstUser = userCount.count === 0;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = crypto.randomUUID();
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name,
        email,
        passwordHash,
        role: isSuperAdmin || isFirstUser ? 'super_admin' : 'user',
        approvalStatus: isSuperAdmin || isFirstUser ? 'approved' : 'pending',
        approvedAt: isSuperAdmin || isFirstUser ? new Date() : undefined,
      })
      .returning();

    // Return user data (excluding password)
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { 
        message: isSuperAdmin || isFirstUser 
          ? 'User registered successfully. Your account is approved.' 
          : 'User registered successfully. Please wait for admin approval.',
        user: userWithoutPassword
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}