import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { config } from '@/lib/config';
import type { User } from '@/lib/db/schema';

export interface SessionData {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  isLoggedIn: boolean;
}

export const sessionOptions = {
  password: config.sessionSecret,
  cookieName: 'auth-session',
  cookieOptions: {
    secure: config.isProduction,
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(user: User) {
  const session = await getSession();
  session.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  session.isLoggedIn = true;
  await session.save();
  return session;
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function regenerateSession() {
  const session = await getSession();
  const user = session.user;
  session.destroy();
  
  const newSession = await getSession();
  if (user) {
    newSession.user = user;
    newSession.isLoggedIn = true;
    await newSession.save();
  }
  return newSession;
}