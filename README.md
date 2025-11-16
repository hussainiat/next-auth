# Next.js Enterprise Authentication System

A complete, production-ready authentication system for Next.js with both token-based (JWT) and session-based authentication support, featuring modern security best practices.

## 🚀 Features

### Authentication Modes
- **Token-based Authentication**: JWT access tokens + HTTP-only refresh tokens
- **Session-based Authentication**: Iron-session with secure cookies
- **Switchable**: Change authentication mode via environment variable

### Security Features
- ✅ **JWT Token Rotation**: Automatic token refresh with rotation
- ✅ **Token Blacklisting**: Revoke compromised tokens
- ✅ **Refresh Token Hashing**: Store hashed refresh tokens in database
- ✅ **CSRF Protection**: Built-in CSRF protection for session mode
- ✅ **Secure Cookies**: HTTP-only, secure, same-site strict cookies
- ✅ **Password Hashing**: bcrypt with 12 salt rounds
- ✅ **Role-based Access Control**: User and admin roles
- ✅ **Input Validation**: Zod schema validation on all inputs
- ✅ **Rate Limiting Ready**: Easy to implement rate limiting

### Technical Features
- 🎯 **Next.js App Router**: Modern Next.js architecture with proxy (formerly middleware)
- 🗄️ **Drizzle ORM**: Type-safe database operations
- 📱 **Responsive Design**: Mobile-first responsive UI
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI
- 🔄 **Real-time Token Refresh**: Automatic token renewal
- 📊 **TypeScript**: Full TypeScript support
- 🧪 **Production Ready**: Optimized for production deployment

### Recent Updates
- 🔄 **Middleware → Proxy**: Updated to use Next.js proxy convention (middleware is deprecated)

## 📁 Project Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   │   ├── register/route.ts
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── refresh/route.ts
│   │   └── me/route.ts
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   ├── dashboard/page.tsx # User dashboard (protected)
│   └── admin/page.tsx     # Admin panel (admin only)
├── lib/
│   ├── auth/
│   │   ├── types.ts       # TypeScript types
│   │   ├── api.ts         # API client
│   │   ├── context.tsx    # React context provider
│   │   ├── token-utils.ts # JWT token management
│   │   ├── session.ts     # Session management
│   │   ├── password.ts    # Password hashing utilities
│   │   └── config.ts      # Configuration
│   └── db/
│       ├── config.ts      # Database configuration
│       └── schema.ts      # Database schemas
└── proxy.ts               # Route protection proxy (formerly middleware)
```

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone <your-repo>
cd nextjs-auth
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Authentication Mode - "token" or "session"
AUTH_MODE="session"

# JWT Secrets (required for token mode)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-characters"

# Database URL
DATABASE_URL="sqlite.db"

# Session Secret (required for session mode)
SESSION_SECRET="your-super-secret-session-key-min-32-characters"

# Node Environment
NODE_ENV="development"
```

### 3. Database Setup

Generate and run database migrations:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio for database management
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## 🔐 Authentication Modes

### Token-based Authentication (JWT)

When `AUTH_MODE="token"`:

- **Access Token**: 15-minute JWT stored in memory
- **Refresh Token**: 7-day JWT stored in HTTP-only cookie
- **Token Rotation**: New refresh token issued on each access
- **Blacklist System**: Revoked tokens are blacklisted in database

**Flow:**
1. User logs in → receives access token + refresh token cookie
2. Access token sent in Authorization header for API calls
3. When access token expires → automatic refresh using refresh token
4. Refresh token rotation → old token revoked, new token issued

### Session-based Authentication

When `AUTH_MODE="session"`:

- **Secure Sessions**: Iron-session with encrypted cookies
- **CSRF Protection**: Built-in CSRF protection
- **Session Regeneration**: Session ID regenerated on login
- **Automatic Cleanup**: Sessions automatically expire

**Flow:**
1. User logs in → session created and stored in encrypted cookie
2. Session cookie automatically sent with requests
3. Session validated on each protected route
4. Session destroyed on logout

## 🛡️ Security Best Practices

### 1. Token Security

```typescript
// Access token (15 minutes)
const accessToken = await tokenManager.generateAccessToken({
  userId: user.id,
  email: user.email,
  role: user.role,
});

// Refresh token (7 days, HTTP-only cookie)
const { token: refreshToken } = await tokenManager.generateRefreshToken(user.id);
```

### 2. Password Security

```typescript
// bcrypt with 12 salt rounds
const passwordHash = await hashPassword(password);
const isValid = await verifyPassword(password, passwordHash);
```

### 3. Database Security

```typescript
// Refresh tokens are hashed before storage
const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
```

### 4. Cookie Security

```typescript
// Secure cookie configuration
response.cookies.set('refresh-token', refreshToken, {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  path: '/api/auth/refresh',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

## 🔑 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `AUTH_MODE` | ✅ | Authentication mode: "token" or "session" | "session" |
| `JWT_ACCESS_SECRET` | ✅ (token mode) | Secret for access tokens | - |
| `JWT_REFRESH_SECRET` | ✅ (token mode) | Secret for refresh tokens | - |
| `SESSION_SECRET` | ✅ (session mode) | Secret for session encryption | - |
| `DATABASE_URL` | ✅ | Database file path | "sqlite.db" |
| `NODE_ENV` | ❌ | Environment mode | "development" |

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
AUTH_MODE="session"
JWT_ACCESS_SECRET="your-production-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-production-refresh-secret-min-32-chars"
SESSION_SECRET="your-production-session-secret-min-32-chars"
DATABASE_URL="sqlite.db"
NODE_ENV="production"
```

## 🧪 Testing the System

### 1. Register a New User

Visit `/register` and create a new account:
- Name: "John Doe"
- Email: "john@example.com"
- Password: "SecurePassword123!"

### 2. Login

Visit `/login` and sign in with your credentials.

### 3. Access Protected Routes

- `/dashboard` - Available to all authenticated users
- `/admin` - Available only to admin users

### 4. Create an Admin User

To create an admin user, you'll need to manually update the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'john@example.com';
```

## 🔧 Switching Authentication Modes

To switch between authentication modes:

1. Update the `AUTH_MODE` environment variable
2. Restart your application
3. The system will automatically use the new mode

**Note:** When switching from token to session mode, users will need to log in again.

## 🛡️ Security Considerations

### Production Checklist

- [ ] Use strong, unique secrets for JWT and session encryption
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Implement rate limiting on authentication endpoints
- [ ] Set up proper logging and monitoring
- [ ] Regular security audits and dependency updates
- [ ] Database backups and disaster recovery

### Rate Limiting (Recommended)

Implement rate limiting on authentication endpoints to prevent brute force attacks:

```typescript
// Example using express-rate-limit
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
});

app.use('/api/auth/login', loginLimiter);
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

#### Refresh Token (Token Mode)
```http
POST /api/auth/refresh
Cookie: refresh-token=<refresh_token>
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check that the user exists in the database
   - Verify password is correct
   - Check database connection

2. **Token refresh failing**
   - Ensure refresh token cookie is being sent
   - Check that refresh token hasn't been revoked
   - Verify JWT secrets are configured correctly

3. **Session not persisting**
   - Check session secret is set correctly
   - Ensure cookies are enabled in browser
   - Verify session configuration in `session.ts`

4. **Proxy not working**
   - Check proxy configuration in `proxy.ts`
   - Ensure environment variables are set
   - Verify route paths match proxy config

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

**⚠️ Important**: This is a starter template. Always perform security audits and customize according to your specific requirements before deploying to production.