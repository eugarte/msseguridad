import { GetUserProfileUseCase } from '../../../../src/application/use-cases/auth/get-user-profile.use-case';
import { UserRepository } from '../../../../src/domain/repositories/user-repository.interface';
import { User, UserStatus } from '../../../../src/domain/entities/user';
import { Role } from '../../../../src/domain/entities/role';
import { Permission } from '../../../../src/domain/entities/permission';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    useCase = new GetUserProfileUseCase(userRepository);
  });

  describe('execute', () => {
    it('should return user profile successfully', async () => {
      const role = new Role();
      role.id = 'role-1';
      role.name = 'User';
      role.slug = 'user';

      const permission = new Permission();
      permission.id = 'perm-1';
      permission.resource = 'users';
      permission.action = 'read';
      role.permissions = [permission];

      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = true;
      user.roles = [role];
      user.lastLoginAt = new Date();
      user.createdAt = new Date();

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        mfaEnabled: true,
        roles: ['user'],
        permissions: ['users:read'],
        lastLoginAt: expect.any(Date),
        createdAt: expect.any(Date),
      });
    });

    it('should return empty roles and permissions if user has none', async () => {
      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.roles = [];

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.getValue().roles).toEqual([]);
      expect(result.getValue().permissions).toEqual([]);
    });

    it('should fail when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute({ userId: 'non-existent' });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('User not found');
    });

    it('should fail when user is inactive', async () => {
      const user = new User();
      user.id = 'user-123';
      user.status = UserStatus.INACTIVE;

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('User account is not active');
    });

    it('should aggregate permissions from multiple roles', async () => {
      const adminRole = new Role();
      adminRole.name = 'admin';
      adminRole.permissions = [
        Object.assign(new Permission(), { resource: 'users', action: 'read' }),
        Object.assign(new Permission(), { resource: 'users', action: 'write' }),
      ];

      const moderatorRole = new Role();
      moderatorRole.name = 'moderator';
      moderatorRole.permissions = [
        Object.assign(new Permission(), { resource: 'posts', action: 'delete' }),
      ];

      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.status = UserStatus.ACTIVE;
      user.mfaEnabled = false;
      user.roles = [adminRole, moderatorRole];

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.getValue().permissions).toContain('users:read');
      expect(result.getValue().permissions).toContain('users:write');
      expect(result.getValue().permissions).toContain('posts:delete');
    });

    it('should handle database errors', async () => {
      userRepository.findById.mockRejectedValue(new Error('Connection lost'));

      const result = await useCase.execute({ userId: 'user-123' });

      expect(result.isFailure()).toBe(true);
      expect(result.getError()?.message).toBe('Failed to retrieve user profile');
    });

    it('should deduplicate permissions', async () => {
      const role1 = new Role();
      role1.name = 'role1';
      role1.permissions = [
        Object.assign(new Permission(), { resource: 'users', action: 'read' }),
      ];

      const role2 = new Role();
      role2.name = 'role2';
      role2.permissions = [
        Object.assign(new Permission(), { resource: 'users', action: 'read' }),
      ];

      const user = new User();
      user.id = 'user-123';
      user.email = 'test@example.com';
      user.status = UserStatus.ACTIVE;
      user.roles = [role1, role2];

      userRepository.findById.mockResolvedValue(user);

      const result = await useCase.execute({ userId: 'user-123' });

      // Should only have one 'users:read' even though both roles have it
      const permissions = result.getValue().permissions;
      const readCount = permissions.filter((p: string) => p === 'users:read').length;
      expect(readCount).toBe(1);
    });
  });
});
