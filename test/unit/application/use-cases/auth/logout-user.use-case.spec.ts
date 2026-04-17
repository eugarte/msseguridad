import { LogoutUserUseCase } from '@application/use-cases/auth/logout-user.use-case';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { cacheClient } from '@infrastructure/config/cache';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    mockRefreshTokenRepository = {
      findByTokenHash: jest.fn(),
      save: jest.fn(),
      revokeTokenFamily: jest.fn(),
    } as jest.Mocked<RefreshTokenRepository>;

    useCase = new LogoutUserUseCase(mockRefreshTokenRepository);
  });

  describe('execute', () => {
    it('should logout current session', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        refreshToken: 'refresh-token',
        allSessions: false,
      });

      expect(result.success).toBe(true);
    });

    it('should logout all sessions when requested', async () => {
      const result = await useCase.execute({
        userId: 'user-123',
        refreshToken: 'refresh-token',
        allSessions: true,
      });

      expect(result.success).toBe(true);
    });
  });
});