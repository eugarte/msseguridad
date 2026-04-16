/**
 * Repository interface for User aggregate
 */
import { User } from '../entities/user';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithRoles(email: string): Promise<User | null>;
  findAll(options: { page: number; limit: number }): Promise<{ users: User[]; total: number }>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  exists(email: string): Promise<boolean>;
  incrementFailedAttempts(userId: string): Promise<void>;
  resetFailedAttempts(userId: string): Promise<void>;
  lockUser(userId: string, until: Date): Promise<void>;
  unlockUser(userId: string): Promise<void>;
}