import { Role } from '../../../src/domain/entities/role';
import { Permission } from '../../../src/domain/entities/permission';

describe('Role Entity', () => {
  let role: Role;

  beforeEach(() => {
    role = new Role();
    role.id = 'role-1';
    role.name = 'Administrator';
    role.slug = 'admin';
    role.description = 'System administrator with full access';
    role.hierarchyLevel = 100;
    role.isSystem = true;
    role.createdAt = new Date();
    role.updatedAt = new Date();
    role.permissions = [];
    role.users = [];
  });

  describe('basic properties', () => {
    it('should have id property', () => {
      expect(role.id).toBe('role-1');
    });

    it('should have name property', () => {
      expect(role.name).toBe('Administrator');
    });

    it('should have slug property', () => {
      expect(role.slug).toBe('admin');
    });

    it('should have description property', () => {
      expect(role.description).toBe('System administrator with full access');
    });

    it('should have hierarchy level', () => {
      expect(role.hierarchyLevel).toBe(100);
    });

    it('should track if system role', () => {
      expect(role.isSystem).toBe(true);
    });
  });

  describe('permissions', () => {
    it('should have empty permissions array by default', () => {
      expect(role.permissions).toEqual([]);
    });

    it('should accept permissions', () => {
      const permission = new Permission();
      permission.id = 'perm-1';
      permission.resource = 'users';
      permission.action = 'read';

      role.permissions = [permission];

      expect(role.permissions).toHaveLength(1);
      expect(role.permissions[0].resource).toBe('users');
    });

    it('should have multiple permissions', () => {
      const readUsers = new Permission();
      readUsers.resource = 'users';
      readUsers.action = 'read';

      const writeUsers = new Permission();
      writeUsers.resource = 'users';
      writeUsers.action = 'write';

      role.permissions = [readUsers, writeUsers];

      expect(role.permissions).toHaveLength(2);
    });
  });

  describe('role hierarchy', () => {
    it('should compare hierarchy levels', () => {
      const adminRole = new Role();
      adminRole.hierarchyLevel = 100;

      const userRole = new Role();
      userRole.hierarchyLevel = 10;

      expect(adminRole.hierarchyLevel).toBeGreaterThan(userRole.hierarchyLevel);
    });

    it('should support negative hierarchy for banned users', () => {
      const bannedRole = new Role();
      bannedRole.hierarchyLevel = -1;

      expect(bannedRole.hierarchyLevel).toBe(-1);
    });
  });

  describe('system roles', () => {
    it('should identify system roles', () => {
      role.isSystem = true;
      expect(role.isSystem).toBe(true);
    });

    it('should identify custom roles', () => {
      role.isSystem = false;
      expect(role.isSystem).toBe(false);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      const now = new Date();
      role.createdAt = now;
      expect(role.createdAt).toBe(now);
    });

    it('should have updatedAt timestamp', () => {
      const now = new Date();
      role.updatedAt = now;
      expect(role.updatedAt).toBe(now);
    });
  });
});

describe('Permission Entity', () => {
  let permission: Permission;

  beforeEach(() => {
    permission = new Permission();
    permission.id = 'perm-1';
    permission.resource = 'users';
    permission.action = 'read';
    permission.description = 'Can read user data';
    permission.createdAt = new Date();
    permission.roles = [];
  });

  describe('basic properties', () => {
    it('should have id property', () => {
      expect(permission.id).toBe('perm-1');
    });

    it('should have resource property', () => {
      expect(permission.resource).toBe('users');
    });

    it('should have action property', () => {
      expect(permission.action).toBe('read');
    });

    it('should have description property', () => {
      expect(permission.description).toBe('Can read user data');
    });
  });

  describe('permission actions', () => {
    it('should support read action', () => {
      permission.action = 'read';
      expect(permission.action).toBe('read');
    });

    it('should support write action', () => {
      permission.action = 'write';
      expect(permission.action).toBe('write');
    });

    it('should support delete action', () => {
      permission.action = 'delete';
      expect(permission.action).toBe('delete');
    });

    it('should support manage action', () => {
      permission.action = 'manage';
      expect(permission.action).toBe('manage');
    });
  });

  describe('permission resources', () => {
    it('should support users resource', () => {
      permission.resource = 'users';
      expect(permission.resource).toBe('users');
    });

    it('should support roles resource', () => {
      permission.resource = 'roles';
      expect(permission.resource).toBe('roles');
    });

    it('should support permissions resource', () => {
      permission.resource = 'permissions';
      expect(permission.resource).toBe('permissions');
    });
  });

  describe('roles relationship', () => {
    it('should have empty roles array by default', () => {
      expect(permission.roles).toEqual([]);
    });

    it('should be assigned to roles', () => {
      const adminRole = new Role();
      adminRole.name = 'Admin';

      permission.roles = [adminRole];

      expect(permission.roles).toHaveLength(1);
    });
  });
});
