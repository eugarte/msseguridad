import { User, UserStatus } from '@domain/entities/user';
import { RefreshToken } from '@domain/entities/refresh-token';
import { Email } from '@domain/value-objects/email';
import { LoginUserRequest, LoginUserResponse } from '@application/dtos/auth.dto';
import { AppDataSource } from '@infrastructure/config/database';
import { JwtService } from '@infrastructure/services/jwt.service';
import { AuditLog, AuditAction, AuditStatus } from '@domain/entities/audit-log';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/services/logger';

export class LoginUserUseCase {
  private jwtService = new JwtService();
  
  async execute(request: LoginUserRequest): Promise<LoginUserResponse> {
    const userRepository = AppDataSource.getRepository(User);
    const auditLogRepository = AppDataSource.getRepository(AuditLog);
    const tokenRepository = AppDataSource.getRepository(RefreshToken);
    
    try {
      const email = new Email(request.email);
      
      const user = await userRepository.findOne({
        where: { email: email.getValue() },
        relations: ['roles', 'roles.permissions'],
      });
      
      const logAudit = async (action: AuditAction, status: AuditStatus, message?: string) => {
        const audit = auditLogRepository.create({
          userId: user?.id || null,
          action,
          resource: 'auth',
          resourceId: user?.id,
          status,
          message,
          ipAddress: request.ipAddress || null,
          userAgent: request.userAgent || null,
        });
        await auditLogRepository.save(audit);
      };
      
      if (!user) {
        await logAudit(AuditAction.LOGIN_FAILED, AuditStatus.FAILURE, 'User not found');
        throw new Error('Invalid credentials');
      }
      
      if (user.isLocked()) {
        await logAudit(AuditAction.LOGIN_FAILED, AuditStatus.FAILURE, 'Account locked');
        throw new Error('Account is locked');
      }
      
      if (user.status !== UserStatus.ACTIVE) {
        await logAudit(AuditAction.LOGIN_FAILED, AuditStatus.FAILURE, `Account status: ${user.status}`);
        throw new Error('Account is not active');
      }
      
      const isValidPassword = await argon2.verify(user.passwordHash, request.password);
      
      if (!isValidPassword) {
        user.failedAttempts += 1;
        if (user.failedAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        }
        await userRepository.save(user);
        await logAudit(AuditAction.LOGIN_FAILED, AuditStatus.FAILURE, 'Invalid password');
        throw new Error('Invalid credentials');
      }
      
      if (user.mfaEnabled) {
        await logAudit(AuditAction.LOGIN, AuditStatus.WARNING, 'MFA required');
        return {
          user: { id: user.id, email: user.email, roles: user.roles?.map(r => r.slug) || [], mfaEnabled: true },
          tokens: { accessToken: '', refreshToken: '', expiresIn: 0, tokenType: 'Bearer' },
          mfaRequired: true,
        };
      }
      
      user.failedAttempts = 0;
      user.lockedUntil = null;
      user.lastLoginAt = new Date();
      await userRepository.save(user);
      
      const tokenFamilyId = uuidv4();
      const tokens = await this.jwtService.generateTokens({
        userId: user.id,
        email: user.email,
        roles: user.roles?.map(r => r.slug) || [],
      });
      
      const refreshToken = tokenRepository.create({
        id: uuidv4(),
        userId: user.id,
        tokenHash: await argon2.hash(tokens.refreshToken),
        familyId: tokenFamilyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: request.ipAddress || null,
        userAgent: request.userAgent || null,
      });
      await tokenRepository.save(refreshToken);
      
      await logAudit(AuditAction.LOGIN, AuditStatus.SUCCESS);
      
      return {
        user: { id: user.id, email: user.email, roles: user.roles?.map(r => r.slug) || [], mfaEnabled: false },
        tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresIn: tokens.expiresIn, tokenType: tokens.tokenType },
      };
    } catch (error) {
      logger.error('Login error', { error, email: request.email });
      throw error;
    }
  }
}
