import { RefreshTokenUseCase } from '../../../../src/application/use-cases/auth/refresh-token.use-case';
import { TokenRepository } from '../../../../src/domain/repositories/token-repository.interface';
import { UserRepository } from '../../../../src/domain/repositories/user-repository.interface';
import { JwtService } from '../../../../src/infrastructure/services/jwt.service';
import { RefreshToken } from '../../../../src/domain/entities/refresh-token';
import { User, UserStatus } from '../../../../src/domain/entities/user';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let tokenRepository: jest.Mocked<TokenRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    tokenRepository = {
      findByToken: jest.fn(),
      save: jest.fn(),
      revoke: jest.fn(),
      revokeFamily: jest.fn(),
    } as unknown as jest.Mocked<TokenRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new RefreshTokenUseCase(tokenRepository, userRepository, jwtService);
  });

  describe('execute', () => {
    const validToken = 'valid-refresh-token-uuid';

    it('should successfully refresh tokens', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.tokenHash = 'hashed-token';
      refreshToken.userId = 'user-123';
      refreshToken.familyId = 'family-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000); // 1 day
      refreshToken.usedAt = null;

      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.status = UserStatus.ACTIVE;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);
      userRepository.findById.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('new-access-token');
      tokenRepository.save.mockImplementation((token: RefreshToken) => Promise.resolve(token));

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toHaveProperty('accessToken');
      expect(result.getValue()).toHaveProperty('refreshToken');
    });

    it('should fail when token not found', async () => {
      tokenRepository.findByToken.mockResolvedValue(null);

      const result = await useCase.execute({ refreshToken: 'invalid-token' });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Invalid refresh token');
    });

    it('should fail when token is revoked', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.isRevoked = true;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Token has been revoked');
    });

    it('should fail when token is expired', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() - 86400000); // Expired 1 day ago

      tokenRepository.findByToken.mockResolvedValue(refreshToken);

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Token has expired');
    });

    it('should detect token reuse and revoke entire family', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.userId = 'user-123';
      refreshToken.familyId = 'family-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      refreshToken.usedAt = new Date(); // Already used!

      tokenRepository.findByToken.mockResolvedValue(refreshToken);

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isFailure()).toBe(true);
      expect(tokenRepository.revokeFamily).toHaveBeenCalledWith('family-123');
    });

    it('should rotate refresh token (generate new one)', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.tokenHash = 'hashed-token';
      refreshToken.userId = 'user-123';
      refreshToken.familyId = 'family-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      refreshToken.usedAt = null;

      const user = new User();
      user.id = 'user-123';
      user.status = UserStatus.ACTIVE;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);
      userRepository.findById.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('new-access-token');

      await useCase.execute({ refreshToken: validToken });

      // Should mark old token as used
      expect(tokenRepository.save).toHaveBeenCalled();
      // Should create new token
      expect(tokenRepository.save).toHaveBeenCalledTimes(2);
    });

    it('should fail when user not found', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.userId = 'user-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      refreshToken.usedAt = null;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isFailure()).toBe(true);
    });

    it('should fail when user is inactive', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.userId = 'user-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      refreshToken.usedAt = null;

      const user = new User();
      user.id = 'user-123';
      user.status = UserStatus.INACTIVE;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);
      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ refreshToken: validToken });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toContain('User account is not active');
    });

    it('should include user info in access token', async () => {
      const refreshToken = new RefreshToken();
      refreshToken.id = 'token-id';
      refreshToken.userId = 'user-123';
      refreshToken.familyId = 'family-123';
      refreshToken.isRevoked = false;
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      refreshToken.usedAt = null;

      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.status = UserStatus.ACTIVE;

      tokenRepository.findByToken.mockResolvedValue(refreshToken);
      userRepository.findById.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('new-access-token');

      const result = await useCase.execute({ refreshToken: validToken });

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-123',
          email: 'user@example.com',
        }),
        expect.any(Object)
      );
    });
  });
});
