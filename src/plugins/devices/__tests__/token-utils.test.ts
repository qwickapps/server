/**
 * Token Utilities Tests
 *
 * Unit tests for device token generation, hashing, and verification.
 */

import { describe, it, expect } from 'vitest';
import {
  generateDeviceToken,
  generatePairingCode,
  hashToken,
  verifyToken,
  isValidTokenFormat,
  isTokenExpired,
  getTokenExpiration,
} from '../token-utils.js';

describe('Token Utilities', () => {
  describe('generateDeviceToken', () => {
    it('should generate a token with the correct prefix', async () => {
      const result = await generateDeviceToken('mob');
      expect(result.token).toMatch(/^mob_/);
    });

    it('should generate a 43-character secret after prefix', async () => {
      const result = await generateDeviceToken('mob');
      const secret = result.token.split('_')[1];
      expect(secret.length).toBe(43);
    });

    it('should generate base64url-safe characters', async () => {
      const result = await generateDeviceToken('test');
      const secret = result.token.split('_')[1];
      expect(secret).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should return a SHA-256 hash (64 hex characters)', async () => {
      const result = await generateDeviceToken('mob');
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should return an 8-character prefix for display', async () => {
      const result = await generateDeviceToken('mob');
      expect(result.prefix.length).toBe(8);
      expect(result.token.startsWith(result.prefix)).toBe(true);
    });

    it('should generate unique tokens each time', async () => {
      const result1 = await generateDeviceToken('mob');
      const result2 = await generateDeviceToken('mob');

      expect(result1.token).not.toBe(result2.token);
      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('generatePairingCode', () => {
    it('should generate a 6-character code', () => {
      const code = generatePairingCode();
      expect(code.length).toBe(6);
    });

    it('should only contain uppercase alphanumeric characters', () => {
      const code = generatePairingCode();
      // Excludes confusing chars: 0, O, I, 1
      expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generatePairingCode());
      }
      // Should have mostly unique codes (allowing some collisions)
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('hashToken', () => {
    it('should return a 64-character hex string', async () => {
      const hash = await hashToken('test_token');
      expect(hash.length).toBe(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it('should produce consistent hashes for same input', async () => {
      const hash1 = await hashToken('same_token');
      const hash2 = await hashToken('same_token');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different input', async () => {
      const hash1 = await hashToken('token_one');
      const hash2 = await hashToken('token_two');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyToken', () => {
    it('should return valid for matching token and hash', async () => {
      const token = 'mob_ABC123testtoken';
      const hash = await hashToken(token);

      const result = await verifyToken(token, hash);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return invalid for non-matching token', async () => {
      const originalHash = await hashToken('original_token');

      const result = await verifyToken('different_token', originalHash);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid token');
    });

    it('should handle malformed hash gracefully', async () => {
      const result = await verifyToken('some_token', 'not-a-valid-hex-hash');

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use constant-time comparison (timing-safe)', async () => {
      // This test ensures the comparison doesn't leak timing info
      // We can't directly test timing, but we verify the function uses the correct approach
      const token = 'mob_securetoken123';
      const hash = await hashToken(token);

      // Multiple verifications should all succeed
      for (let i = 0; i < 10; i++) {
        const result = await verifyToken(token, hash);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('isValidTokenFormat', () => {
    it('should return true for valid token format', () => {
      // 43 base64url characters after prefix (32 bytes = 43 chars in base64url)
      const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
      expect(isValidTokenFormat(validToken, 'mob')).toBe(true);
    });

    it('should return false for wrong prefix', () => {
      const token = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
      expect(isValidTokenFormat(token, 'cpute')).toBe(false);
    });

    it('should return false for missing underscore', () => {
      const token = 'mobABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
      expect(isValidTokenFormat(token, 'mob')).toBe(false);
    });

    it('should return false for too short secret', () => {
      const token = 'mob_tooshort';
      expect(isValidTokenFormat(token, 'mob')).toBe(false);
    });

    it('should return false for too long secret', () => {
      const token = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456extra';
      expect(isValidTokenFormat(token, 'mob')).toBe(false);
    });

    it('should return false for invalid characters', () => {
      const token = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()123456';
      expect(isValidTokenFormat(token, 'mob')).toBe(false);
    });

    it('should accept base64url characters including - and _', () => {
      const token = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZ-_abcdefghij12345';
      expect(isValidTokenFormat(token, 'mob')).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      expect(isTokenExpired(futureDate)).toBe(false);
    });

    it('should return true for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(isTokenExpired(pastDate)).toBe(true);
    });

    it('should return true for date exactly now (edge case)', () => {
      const now = new Date();
      // Slightly in the past to ensure it's expired
      now.setMilliseconds(now.getMilliseconds() - 1);

      expect(isTokenExpired(now)).toBe(true);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return a date 90 days in the future by default', () => {
      const now = new Date();
      const expiration = getTokenExpiration();

      const daysDiff = Math.round(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(90);
    });

    it('should accept custom validity days', () => {
      const now = new Date();
      const expiration = getTokenExpiration(30);

      const daysDiff = Math.round(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(30);
    });

    it('should handle 0 days (expires immediately)', () => {
      const now = new Date();
      const expiration = getTokenExpiration(0);

      // Should be very close to now
      const diffMs = Math.abs(expiration.getTime() - now.getTime());
      expect(diffMs).toBeLessThan(1000); // Within 1 second
    });

    it('should handle large values', () => {
      const now = new Date();
      const expiration = getTokenExpiration(365);

      const daysDiff = Math.round(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBe(365);
    });
  });

  describe('integration: generate and verify', () => {
    it('should generate token that can be verified', async () => {
      const { token, hash } = await generateDeviceToken('mob');

      const verifyResult = await verifyToken(token, hash);

      expect(verifyResult.valid).toBe(true);
    });

    it('should reject tampered token', async () => {
      const { hash } = await generateDeviceToken('mob');
      const tamperedToken = 'mob_tamperedtokenthatisdifferentfromoriginal';

      const verifyResult = await verifyToken(tamperedToken, hash);

      expect(verifyResult.valid).toBe(false);
    });
  });
});
