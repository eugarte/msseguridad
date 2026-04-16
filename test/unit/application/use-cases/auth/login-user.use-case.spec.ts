import { LoginUserUseCase } from '../../../../src/application/use-cases/auth/login-user.use-case';
import { UserRepository } from '../../../../src/domain/repositories/user-repository.interface';
import { TokenRepository } from '../../../../src/domain/repositories/token-repository.interface';
import { JwtService } from '../../../../src/infrastructure/services/jwt.service';
import { User, UserStatus } from '../../../../src/domain/entities/user';
import { RefreshToken } from '../../../../src/domain/entities/refresh-token';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<TokenRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    tokenRepository = {
      save: jest.fn(),
      revokeFamily: jest.fn(),
    } as unknown as jest.Mocked<TokenRepository>;

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    useCase = new LoginUserUseCase(userRepository, tokenRepository, jwtService);
  });

  describe('execute', () => {
    const validInput = {
      email: 'user@example.com',
      password: 'SecureP@ssw0rd123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    };

    it('should successfully login with valid credentials', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.passwordHash = 'hashedpassword';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.lockedUntil = null;
      user.failedAttempts = 0;

      userRepository.findByEmail.mockResolvedValue(user);
      jest.spyOn(require('../../../../src/domain/value-objects/password'), 'Password')
        .mockImplementation(() => ({
          verify: jest.fn().mockResolvedValue(true),
        }));
      jwtService.sign.mockReturnValue('access-token');

      const result = await useCase.execute(validInput);

      expect(result.isSuccess()).toBe(true);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('should fail when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      const result = await useCase.execute(validInput);

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Invalid credentials');
    });

    it('should fail when user is locked', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.status = UserStatus.ACTIVE;
      user.lockedUntil = new Date(Date.now() + 3600000); // Locked for 1 hour

      userRepository.findByEmail.mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toContain('Account is locked');
    });

    it('should fail when user is not active', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.status = UserStatus.PENDING;
      user.lockedUntil = null;

      userRepository.findByEmail.mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      expect(result.isFailure()).toBe(true);
    });

    it('should fail with invalid password', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.passwordHash = 'hashedpassword';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.lockedUntil = null;
      user.failedAttempts = 0;

      userRepository.findByEmail.mockResolvedValue(user);

      const result = await useCase.execute({
        ...validInput,
        password: 'WrongPassword123!',
      });

      expect(result.isFailure()).toBe(true);
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('should increment failed attempts on wrong password', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.passwordHash = 'hashedpassword';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.lockedUntil = null;
      user.failedAttempts = 2;

      userRepository.findByEmail.mockResolvedValue(user);

      await useCase.execute({
        ...validInput,
        password: 'WrongPassword123!',
      });

      expect(user.failedAttempts).toBe(3);
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.passwordHash = 'hashedpassword';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.lockedUntil = null;
      user.failedAttempts = 4;

      userRepository.findByEmail.mockResolvedValue(user);

      const result = await useCase.execute({
        ...validInput,
        password: 'WrongPassword123!',
      });

      expect(result.isFailure()).toBe(true);
      expect(user.lockedUntil).toBeDefined();
    });

    it('should require MFA when enabled', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'user@example.com';
      user.passwordHash = 'hashedpassword';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = true;
      user.mfaSecret = 'secret-key';
      user.lockedUntil = null;
      user.failedAttempts = 0;

      userRepository.findByEmail.mockResolvedValue(user);

      const result = await useCase.execute(validInput);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toHaveProperty('requiresMfa', true);
    });
  });
});
