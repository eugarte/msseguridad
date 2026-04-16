import { createClient } from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../services/logger';

dotenv.config();

export const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  
  // Connection settings
  connectTimeout: 10000,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  
  // Retry strategy
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  
  // Reconnect on error
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNREFUSED', 'ETIMEDOUT'];
    return targetErrors.some(e => err.message.includes(e));
  },
});

// Event handlers
redisClient.on('connect', () => {
  logger.info('Redis connected');
});

redisClient.on('ready', () => {
  logger.info('Redis ready');
});

redisClient.on('error', (err) => {
  logger.error('Redis error', { error: err });
});

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});

// Helper functions for session management
export async function getSession(sessionId: string): Promise<any> {
  const data = await redisClient.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function setSession(sessionId: string, data: any, ttl: number = 86400): Promise<void> {
  await redisClient.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redisClient.del(`session:${sessionId}`);
}

// Rate limiting helpers
export async function incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
  const multi = redisClient.multi();
  multi.incr(key);
  multi.expire(key, windowSeconds);
  const results = await multi.exec();
  return results?.[0]?.[1] as number || 0;
}

export async function getRateLimitCount(key: string): Promise<number> {
  const count = await redisClient.get(key);
  return count ? parseInt(count, 10) : 0;
}

// Token blacklist
export async function blacklistToken(tokenId: string, expiresIn: number): Promise<void> {
  await redisClient.setex(`blacklist:${tokenId}`, expiresIn, '1');
}

export async function isTokenBlacklisted(tokenId: string): Promise<boolean> {
  const result = await redisClient.get(`blacklist:${tokenId}`);
  return result !== null;
}
