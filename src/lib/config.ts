export const config = {
  authMode: process.env.AUTH_MODE || 'session',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  databaseUrl: process.env.DATABASE_URL || 'sqlite.db',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export const isTokenMode = config.authMode === 'token';
export const isSessionMode = config.authMode === 'session';