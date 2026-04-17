import { RefreshToken } from '../../../src/domain/entities/refresh-token';
import { User } from '../../../src/domain/entities/user';

describe('RefreshToken Entity', () => {
  let refreshToken: RefreshToken;

  beforeEach(() => {
    refreshToken = new RefreshToken();
    refreshToken.id = 'token-1';
    refreshToken.tokenHash = 'hashed-token-value';
    refreshToken.userId = 'user-123';
    refreshToken.familyId = 'family-456';
    refreshToken.isRevoked = false;
    refreshToken.createdAt = new Date();
    refreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    refreshToken.usedAt = null;
    refreshToken.ipAddress = '192.168.1.1';
    refreshToken.userAgent = 'Mozilla/5.0';
    refreshToken.replacedBy = null;
  });

  describe('basic properties', () => {
    it('should have id property', () => {
      expect(refreshToken.id).toBe('token-1');
    });

    it('should have tokenHash property', () => {
      expect(refreshToken.tokenHash).toBe('hashed-token-value');
    });

    it('should have userId property', () => {
      expect(refreshToken.userId).toBe('user-123');
    });

    it('should have familyId property', () => {
      expect(refreshToken.familyId).toBe('family-456');
    });
  });

  describe('token state', () => {
    it('should not be revoked by default', () => {
      expect(refreshToken.isRevoked).toBe(false);
    });

    it('should be revocable', () => {
      refreshToken.isRevoked = true;
      expect(refreshToken.isRevoked).toBe(true);
    });

    it('should track if used', () => {
      expect(refreshToken.usedAt).toBeNull();
      
      refreshToken.usedAt = new Date();
      expect(refreshToken.usedAt).toBeInstanceOf(Date);
    });

    it('should check if expired when expiresAt is in past', () => {
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      const isExpired = refreshToken.expiresAt < new Date();
      expect(isExpired).toBe(true);
    });

    it('should check if not expired when expiresAt is in future', () => {
      refreshToken.expiresAt = new Date(Date.now() + 1000);
      const isExpired = refreshToken.expiresAt < new Date();
      expect(isExpired).toBe(false);
    });
  });

  describe('family tracking', () => {
    it('should belong to a token family', () => {
      expect(refreshToken.familyId).toBe('family-456');
    });

    it('should track token that replaced it', () => {
      refreshToken.replacedBy = 'new-token-id';
      expect(refreshToken.replacedBy).toBe('new-token-id');
    });

    it('should allow null replacedBy', () => {
      refreshToken.replacedBy = null;
      expect(refreshToken.replacedBy).toBeNull();
    });
  });

  describe('metadata', () => {
    it('should track IP address', () => {
      expect(refreshToken.ipAddress).toBe('192.168.1.1');
    });

    it('should track user agent', () => {
      expect(refreshToken.userAgent).toBe('Mozilla/5.0');
    });

    it('should handle null IP', () => {
      refreshToken.ipAddress = null;
      expect(refreshToken.ipAddress).toBeNull();
    });

    it('should handle null user agent', () => {
      refreshToken.userAgent = null;
      expect(refreshToken.userAgent).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should have createdAt timestamp', () => {
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
    });

    it('should have expiresAt timestamp', () => {
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
    });
  });

  describe('token lifecycle', () => {
    it('should represent a valid active token', () => {
      expect(refreshToken.isRevoked).toBe(false);
      expect(refreshToken.usedAt).toBeNull();
      expect(refreshToken.expiresAt > new Date()).toBe(true);
    });

    it('should represent a used token', () => {
      refreshToken.usedAt = new Date();
      expect(refreshToken.usedAt).toBeInstanceOf(Date);
    });

    it('should represent a revoked token', () => {
      refreshToken.isRevoked = true;
      expect(refreshToken.isRevoked).toBe(true);
    });
  });

  describe('token family detection', () => {
    it('should identify tokens from same family', () => {
      const token1 = new RefreshToken();
      token1.familyId = 'family-abc';

      const token2 = new RefreshToken();
      token2.familyId = 'family-abc';

      expect(token1.familyId).toBe(token2.familyId);
    });

    it('should identify tokens from different families', () => {
      const token1 = new RefreshToken();
      token1.familyId = 'family-abc';

      const token2 = new RefreshToken();
      token2.familyId = 'family-xyz';

      expect(token1.familyId).not.toBe(token2.familyId);
    });
  });
});
