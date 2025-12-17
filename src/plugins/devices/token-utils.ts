/**
 * Device Token Utilities
 *
 * Utilities for generating, hashing, and verifying device tokens.
 * Adapted from QwickForge's device-tokens implementation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface DeviceTokenPair {
  /** Raw token to return to client (store securely!) */
  token: string;
  /** Hashed token to store in database */
  hash: string;
  /** First 8 characters for identification */
  prefix: string;
}

export interface TokenVerificationResult {
  /** Whether the token is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Generation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a cryptographically secure device token
 *
 * Returns both the raw token (to send to client) and the hash (to store in DB).
 * The raw token should be shown to the user ONCE and never stored server-side.
 *
 * Token format: `<prefix>_<32 bytes base64url>`
 *
 * @param prefix - Token prefix for identification (e.g., 'qwf_dev', 'qwb_mob')
 * @returns Token pair with raw token, hash, and display prefix
 */
export async function generateDeviceToken(prefix: string): Promise<DeviceTokenPair> {
  // Generate 32 bytes of random data
  const randomBytes = crypto.randomBytes(32);

  // Convert to base64url (URL-safe, no padding)
  const tokenSecret = randomBytes.toString('base64url');

  // Combine prefix with secret
  const token = `${prefix}_${tokenSecret}`;

  // Hash the token for storage
  const hash = await hashToken(token);

  // Get first 8 chars of full token for display
  const displayPrefix = token.substring(0, 8);

  return { token, hash, prefix: displayPrefix };
}

/**
 * Generate a short-lived pairing code for device registration
 *
 * Used for device pairing flow. User enters this code in web/mobile UI.
 * Format: 6 uppercase alphanumeric characters (e.g., 'A1B2C3')
 *
 * @returns 6-character pairing code
 */
export function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars (0, O, I, 1)
  let code = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    code += chars[randomIndex];
  }

  return code;
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Hashing
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hash a token using SHA-256
 *
 * We use SHA-256 instead of bcrypt for tokens because:
 * 1. Tokens are high-entropy (32 random bytes)
 * 2. No need for slow hashing (not user passwords)
 * 3. Faster verification for high-throughput API calls
 *
 * @param token - Raw token to hash
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashToken(token: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash;
}

/**
 * Verify a token against its stored hash
 *
 * Constant-time comparison to prevent timing attacks.
 *
 * @param token - Raw token from client
 * @param storedHash - Hash from database
 * @returns Verification result
 */
export async function verifyToken(
  token: string,
  storedHash: string
): Promise<TokenVerificationResult> {
  try {
    // Hash the provided token
    const tokenHash = await hashToken(token);

    // Constant-time comparison
    const valid = crypto.timingSafeEqual(
      Buffer.from(tokenHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );

    if (!valid) {
      return { valid: false, error: 'Invalid token' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token verification failed',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Token Validation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate token format (prefix and length)
 *
 * Checks if token matches expected format before attempting verification.
 * Useful for fast rejection of malformed tokens.
 *
 * @param token - Token to validate
 * @param expectedPrefix - Expected token prefix
 * @returns True if format is valid
 */
export function isValidTokenFormat(token: string, expectedPrefix: string): boolean {
  // Check prefix
  if (!token.startsWith(`${expectedPrefix}_`)) {
    return false;
  }

  // Extract secret part
  const secret = token.slice(expectedPrefix.length + 1);

  // Validate length (32 bytes base64url = 43 characters)
  if (secret.length !== 43) {
    return false;
  }

  // Validate characters (base64url: A-Za-z0-9_-)
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!base64urlPattern.test(secret)) {
    return false;
  }

  return true;
}

/**
 * Check if token is expired
 *
 * @param expiresAt - Expiration timestamp
 * @returns True if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Calculate token expiration date
 *
 * @param daysValid - Number of days token should be valid (default: 90)
 * @returns Expiration timestamp
 */
export function getTokenExpiration(daysValid: number = 90): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);
  return expiresAt;
}

// ═══════════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════════

export const DeviceTokens = {
  generate: generateDeviceToken,
  generatePairingCode,
  hash: hashToken,
  verify: verifyToken,
  isValidFormat: isValidTokenFormat,
  isExpired: isTokenExpired,
  getExpiration: getTokenExpiration,
};
