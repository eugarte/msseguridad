import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@infrastructure/services/jwt.service';
import { AppDataSource } from '@infrastructure/config/database';
import { User } from '@domain/entities/user';
import { redisClient } from '@infrastructure/config/redis';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; roles: string[] };
}

const jwtService = new JwtService();

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const payload = jwtService.verifyToken(token);
    const isBlacklisted = await redisClient.get(`blacklist:${payload.jti}`);
    if (isBlacklisted) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles'],
    });

    if (!user || user.status !== 'active') {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles?.map(r => r.slug) || [],
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    res.status(403).json({ error: 'Invalid token' });
  }
}

export function requireRoles(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const hasRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
