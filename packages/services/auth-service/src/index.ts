import type { User, AuthToken, UserRole } from '@jarbas/types';
import { generateId } from '@jarbas/utils';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12;

export interface AuthServiceConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  apiKeySalt: string;
}

interface JWTHeader { alg: string; typ: string }
interface JWTPayload { sub: string; email: string; tenantId: string; role: UserRole; iat: number; exp: number }

export class AuthService {
  private config: AuthServiceConfig;
  private users = new Map<string, User & { passwordHash: string }>();
  private apiKeys = new Map<string, { key: string; tenantId: string; userId: string }>();
  private refreshTokens = new Map<string, { userId: string; tenantId: string; expiresAt: Date }>();

  constructor(config: AuthServiceConfig) {
    this.config = config;
  }

  async register(email: string, password: string, name: string, tenantId: string): Promise<AuthToken> {
    const existing = Array.from(this.users.values()).find((u) => u.email === email);
    if (existing) throw new Error('Email already registered');

    const id = generateId();
    const passwordHash = await this.hashPassword(password);

    const user: User & { passwordHash: string } = {
      id,
      email,
      name,
      tenantId,
      role: 'user',
      createdAt: new Date(),
      passwordHash,
    };

    this.users.set(id, user);
    return this.generateTokens(user);
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (!user) throw new Error('Invalid credentials');

    const valid = await this.verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    user.lastLoginAt = new Date();
    return this.generateTokens(user);
  }

  async validateToken(token: string): Promise<User> {
    const payload = this.verifyJWT(token);
    const user = this.users.get(payload.sub);
    if (!user) throw new Error('User not found');
    return user;
  }

  async validateApiKey(key: string): Promise<{ userId: string; tenantId: string }> {
    const record = this.apiKeys.get(key);
    if (!record) throw new Error('Invalid API key');
    return { userId: record.userId, tenantId: record.tenantId };
  }

  async createApiKey(userId: string, tenantId: string, name: string): Promise<string> {
    const key = `jb_${crypto.randomBytes(32).toString('hex')}`;
    this.apiKeys.set(key, { key, tenantId, userId });
    return key;
  }

  async refreshToken(refreshToken: string): Promise<AuthToken> {
    const record = this.refreshTokens.get(refreshToken);
    if (!record || record.expiresAt < new Date()) {
      throw new Error('Invalid refresh token');
    }

    const user = this.users.get(record.userId);
    if (!user) throw new Error('User not found');

    this.refreshTokens.delete(refreshToken);
    return this.generateTokens(user);
  }

  private generateTokens(user: User): AuthToken {
    const accessExpiresIn = 15 * 60; // 15 minutes
    const refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days

    const accessToken = this.signJWT({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessExpiresIn,
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');
    this.refreshTokens.set(refreshToken, {
      userId: user.id,
      tenantId: user.tenantId,
      expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      tokenType: 'Bearer',
    };
  }

  private signJWT(payload: JWTPayload): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  private verifyJWT(token: string): JWTPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    const sigBuf = Buffer.from(signature, 'base64url');
    const expectedBuf = Buffer.from(expectedSig, 'base64url');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error('Invalid token signature');
    }

    const payload: JWTPayload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');

    return payload;
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
