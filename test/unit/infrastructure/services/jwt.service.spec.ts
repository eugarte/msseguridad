import { JwtService } from '../../../src/infrastructure/services/jwt.service';
import * as jose from 'jose';

jest.mock('jose');

describe('JwtService', () => {
  let jwtService: JwtService;
  const mockPrivateKey = 'mock-private-key';
  const mockPublicKey = 'mock-public-key';

  beforeEach(() => {
    jest.clearAllMocks();
    jwtService = new JwtService(mockPrivateKey, mockPublicKey);
  });

  describe('sign', () => {
    it('should sign a token with payload', async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('signed-token'),
      };
      
      (jose.SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('imported-key');

      const payload = { sub: 'user-123', email: 'test@example.com' };
      const result = await jwtService.sign(payload, { expiresIn: '1h' });

      expect(jose.SignJWT).toHaveBeenCalledWith(payload);
      expect(mockSignJWT.setProtectedHeader).toHaveBeenCalledWith({ alg: 'RS256' });
      expect(mockSignJWT.setIssuedAt).toHaveBeenCalled();
      expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith('1h');
      expect(result).toBe('signed-token');
    });

    it('should use default expiration of 15 minutes', async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('token'),
      };
      
      (jose.SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('imported-key');

      await jwtService.sign({ sub: 'user-123' });

      expect(mockSignJWT.setExpirationTime).toHaveBeenCalledWith('15m');
    });

    it('should throw error when private key is invalid', async () => {
      (jose.importPKCS8 as jest.Mock).mockRejectedValue(new Error('Invalid key'));

      await expect(jwtService.sign({ sub: 'user-123' }))
        .rejects.toThrow('Failed to sign JWT');
    });
  });

  describe('verify', () => {
    it('should verify and decode a valid token', async () => {
      const mockPayload = { 
        sub: 'user-123', 
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567990
      };
      
      (jose.jwtVerify as jest.Mock).mockResolvedValue({ payload: mockPayload });
      (jose.importSPKI as jest.Mock).mockResolvedValue('imported-public-key');

      const result = await jwtService.verify('valid-token');

      expect(jose.jwtVerify).toHaveBeenCalledWith('valid-token', 'imported-public-key');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error for expired token', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(
        new Error('JWTExpired: token expired')
      );

      await expect(jwtService.verify('expired-token'))
        .rejects.toThrow('Token verification failed');
    });

    it('should throw error for invalid signature', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(
        new Error('JWTInvalid: invalid signature')
      );

      await expect(jwtService.verify('invalid-token'))
        .rejects.toThrow('Token verification failed');
    });

    it('should throw error when public key is invalid', async () => {
      (jose.importSPKI as jest.Mock).mockRejectedValue(new Error('Invalid key'));

      await expect(jwtService.verify('token'))
        .rejects.toThrow('Token verification failed');
    });
  });

  describe('decode', () => {
    it('should decode token without verification', () => {
      const mockPayload = { 
        sub: 'user-123', 
        email: 'test@example.com' 
      };
      
      (jose.decodeJwt as jest.Mock).mockReturnValue(mockPayload);

      const result = jwtService.decode('token-without-verification');

      expect(jose.decodeJwt).toHaveBeenCalledWith('token-without-verification');
      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token format', () => {
      (jose.decodeJwt as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const result = jwtService.decode('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn()
          .mockResolvedValueOnce('access-token')
          .mockResolvedValueOnce('refresh-token'),
      };
      
      (jose.SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('imported-key');

      const payload = { sub: 'user-123', email: 'test@example.com' };
      const result = await jwtService.generateTokenPair(payload);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900, // 15 minutes
      });
    });

    it('should include familyId in refresh token', async () => {
      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn()
          .mockResolvedValueOnce('access-token')
          .mockResolvedValueOnce('refresh-token'),
      };
      
      (jose.SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('imported-key');

      const payload = { sub: 'user-123', familyId: 'family-456' };
      await jwtService.generateTokenPair(payload);

      expect(mockSignJWT.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token from refresh token payload', async () => {
      const mockPayload = { 
        sub: 'user-123', 
        email: 'test@example.com',
        familyId: 'family-456'
      };
      
      (jose.jwtVerify as jest.Mock).mockResolvedValue({ payload: mockPayload });
      (jose.importSPKI as jest.Mock).mockResolvedValue('imported-public-key');

      const mockSignJWT = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue('new-access-token'),
      };
      
      (jose.SignJWT as jest.Mock).mockImplementation(() => mockSignJWT);
      (jose.importPKCS8 as jest.Mock).mockResolvedValue('imported-key');

      const result = await jwtService.refreshAccessToken('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        expiresIn: 900,
      });
    });

    it('should throw error when refresh token is invalid', async () => {
      (jose.jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(jwtService.refreshAccessToken('invalid-token'))
        .rejects.toThrow('Token verification failed');
    });
  });

  describe('calculateExpiration', () => {
    it('should return correct expiration in seconds', () => {
      const result = (jwtService as any).calculateExpiration('15m');
      expect(result).toBe(900);
    });

    it('should handle hours', () => {
      const result = (jwtService as any).calculateExpiration('2h');
      expect(result).toBe(7200);
    });

    it('should handle days', () => {
      const result = (jwtService as any).calculateExpiration('7d');
      expect(result).toBe(604800);
    });
  });
});
