import { SignJWT, jwtVerify } from 'jose';
import { config } from '@/lib/config';
import { db } from '@/lib/db/config';
import { refreshTokens } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export class TokenManager {
  private static instance: TokenManager;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    const secret = new TextEncoder().encode(config.jwtAccessSecret);
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRY)
      .sign(secret);
  }

  async generateRefreshToken(userId: string): Promise<{ token: string; tokenId: string }> {
    const tokenId = crypto.randomUUID();
    const payload: RefreshTokenPayload = { userId, tokenId };
    
    const secret = new TextEncoder().encode(config.jwtRefreshSecret);
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .sign(secret);

    // Store refresh token in database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(refreshTokens).values({
      id: tokenId,
      tokenHash,
      userId,
      expiresAt,
    });

    return { token, tokenId };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const secret = new TextEncoder().encode(config.jwtAccessSecret);
      const { payload } = await jwtVerify(token, secret);
      return payload as TokenPayload;
    } catch {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const secret = new TextEncoder().encode(config.jwtRefreshSecret);
      const { payload } = await jwtVerify(token, secret);
      
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Check if token exists and is not revoked
      const [storedToken] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.tokenHash, tokenHash),
            eq(refreshTokens.isRevoked, false),
            gt(refreshTokens.expiresAt, new Date())
          )
        );

      if (!storedToken) {
        return null;
      }

      return payload as RefreshTokenPayload;
    } catch {
      return null;
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, tokenId));
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.userId, userId));
  }

  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(gt(refreshTokens.expiresAt, new Date()));
  }
}

export const tokenManager = TokenManager.getInstance();