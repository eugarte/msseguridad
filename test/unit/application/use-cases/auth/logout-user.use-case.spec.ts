import { LogoutUserUseCase } from '../../../../src/application/use-cases/auth/logout-user.use-case';
import { TokenRepository } from '../../../../src/domain/repositories/token-repository.interface';
import { RefreshToken } from '../../../../src/domain/entities/refresh-token';

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;
  let tokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    tokenRepository = {
      findByUserId: jest.fn(),
      revoke: jest.fn(),
      revokeFamily: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<TokenRepository>;

    useCase = new LogoutUserUseCase(tokenRepository);
  });

  describe('execute', () => {
    it('should logout current session successfully', async () => {
      const input = {
        userId: 'user-123',
        refreshToken: 'current-token',
        allSessions: false,
      };

      const token = new RefreshToken();
      token.id = 'token-1';
      token.tokenHash = 'hashed-token';
      token.isRevoked = false;

      tokenRepository.findByUserId.mockResolvedValue([token]);
      tokenRepository.revoke.mockResolvedValue(undefined);

      const result = await useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(tokenRepository.revoke).toHaveBeenCalledWith('token-1');
    });

    it('should logout all sessions when allSessions is true', async () => {
      const input = {
        userId: 'user-123',
        allSessions: true,
      };

      const token1 = new RefreshToken();
      token1.id = 'token-1';
      token1.familyId = 'family-1';

      const token2 = new RefreshToken();
      token2.id = 'token-2';
      token2.familyId = 'family-2';

      tokenRepository.findByUserId.mockResolvedValue([token1, token2]);
      tokenRepository.revokeFamily.mockResolvedValue(undefined);

      const result = await useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      expect(tokenRepository.revokeFamily).toHaveBeenCalledTimes(2);
    });

    it('should handle logout when no active sessions exist', async () => {
      const input = {
        userId: 'user-123',
        refreshToken: 'token',
        allSessions: false,
      };

      tokenRepository.findByUserId.mockResolvedValue([]);

      const result = await useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
    });

    it('should fail when token does not belong to user', async () => {
      const input = {
        userId: 'user-123',
        refreshToken: 'other-user-token',
        allSessions: false,
      };

      const token = new RefreshToken();
      token.id = 'token-1';
      token.userId = 'user-456'; // Different user
      token.tokenHash = 'hashed-other-token';

      tokenRepository.findByUserId.mockResolvedValue([token]);

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toContain('Token not found');
    });

    it('should handle repository errors gracefully', async () => {
      const input = {
        userId: 'user-123',
        allSessions: true,
      };

      tokenRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Logout failed');
    });
  });
});
