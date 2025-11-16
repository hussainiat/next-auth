import { NextRequest, NextResponse } from 'next/server';
import { tokenManager } from '@/lib/auth/token-utils';
import { destroySession } from '@/lib/auth/session';
import { config, isTokenMode } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    if (isTokenMode) {
      // Get refresh token from cookie
      const refreshToken = request.cookies.get('refresh-token')?.value;
      
      if (refreshToken) {
        // Verify and revoke refresh token
        const payload = await tokenManager.verifyRefreshToken(refreshToken);
        if (payload) {
          await tokenManager.revokeRefreshToken(payload.tokenId);
        }
      }

      // Clear refresh token cookie
      const response = NextResponse.json({ message: 'Logout successful' });
      response.cookies.set('refresh-token', '', {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 0,
      });

      return response;
    } else {
      // Destroy session
      await destroySession();
      
      return NextResponse.json({ message: 'Logout successful' });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}