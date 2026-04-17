import { LoginUserUseCase } from '@application/use-cases/auth/login-user.use-case';
import { UserRepository } from '@domain/repositories/user-repository.interface';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { JwtService } from '@infrastructure/services/jwt.service';
import { User, UserStatus } from '@domain/entities/user';
import { RefreshToken } from '@domain/entities/refresh-token';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as jest.Mocked<UserRepository>;

    mockRefreshTokenRepository = {
      save: jest.fn(),
      findByTokenHash: jest.fn(),
      revokeTokenFamily: jest.fn(),
    } as jest.Mocked<RefreshTokenRepository>;

    mockJwtService = {
      generateTokens: jest.fn(),
      verifyToken: jest.fn(),
    } as jest.Mocked<JwtService>;

    useCase = new LoginUserUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockJwtService
    );
  });

  describe('execute', () => {
    it('should login with valid credentials', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed-password';
      user.status = UserStatus.ACTIVE;
      user.roles = [];

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockJwtService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });

      const result = await useCase.execute({
        email: 'test@example.com',
        password: 'ValidP@ssw0rd123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw error for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(
        useCase.execute({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed-password';
      user.status = UserStatus.PENDING;

      mockUserRepository.findByEmail.mockResolvedValue(user);

      await expect(
        useCase.execute({
          email: 'test@example.com',
          password: 'ValidP@ssw0rd123',
        })
      ).rejects.toThrow('Account is not active');
    });
  });
});