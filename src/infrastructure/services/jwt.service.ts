import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TokenPayload, AuthTokens } from '@domain/value-objects/token';

export class JwtService {
  private privateKey: string;
  private publicKey: string;
  private issuer: string;
  private audience: string;
  private accessExpiration: string;
  private refreshExpiration: string;

  constructor() {
    this.privateKey = fs.readFileSync(
      path.resolve(process.env.JWT_PRIVATE_KEY_PATH || './keys/private.pem'),
      'utf8'
    );
    this.publicKey = fs.readFileSync(
      path.resolve(process.env.JWT_PUBLIC_KEY_PATH || './keys/public.pem'),
      'utf8'
    );
    this.issuer = process.env.JWT_ISSUER || 'msseguridad';
    this.audience = process.env.JWT_AUDIENCE || 'msseguridad-api';
    this.accessExpiration = process.env.JWT_ACCESS_EXPIRATION || '15m';
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';
  }

  async generateTokens(payload: { userId: string; email: string; roles: string[] }): Promise<AuthTokens> {
    const jti = uuidv4();
    const now = Math.floor(Date.now() / 1000);

    const tokenPayload: TokenPayload = {
      sub: payload.userId,
      email: payload.email,
      roles: payload.roles,
      iat: now,
      exp: now + this.parseExpiration(this.accessExpiration),
      iss: this.issuer,
      aud: this.audience,
      jti,
    };

    const accessToken = jwt.sign(tokenPayload, this.privateKey, { algorithm: 'RS256' });

    const refreshToken = jwt.sign(
      { sub: payload.userId, jti: uuidv4(), type: 'refresh' },
      this.privateKey,
      { algorithm: 'RS256', expiresIn: this.refreshExpiration }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiration(this.accessExpiration),
      tokenType: 'Bearer',
    };
  }

  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.publicKey, {
      algorithms: ['RS256'],
      issuer: this.issuer,
      audience: this.audience,
    }) as TokenPayload;
  }

  private parseExpiration(exp: string): number {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] || 60);
  }
}
