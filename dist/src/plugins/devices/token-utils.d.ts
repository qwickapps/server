/**
 * Device Token Utilities
 *
 * Utilities for generating, hashing, and verifying device tokens.
 * Adapted from QwickForge's device-tokens implementation.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
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
export declare function generateDeviceToken(prefix: string): Promise<DeviceTokenPair>;
/**
 * Generate a short-lived pairing code for device registration
 *
 * Used for device pairing flow. User enters this code in web/mobile UI.
 * Format: 6 uppercase alphanumeric characters (e.g., 'A1B2C3')
 *
 * @returns 6-character pairing code
 */
export declare function generatePairingCode(): string;
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
export declare function hashToken(token: string): Promise<string>;
/**
 * Verify a token against its stored hash
 *
 * Constant-time comparison to prevent timing attacks.
 *
 * @param token - Raw token from client
 * @param storedHash - Hash from database
 * @returns Verification result
 */
export declare function verifyToken(token: string, storedHash: string): Promise<TokenVerificationResult>;
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
export declare function isValidTokenFormat(token: string, expectedPrefix: string): boolean;
/**
 * Check if token is expired
 *
 * @param expiresAt - Expiration timestamp
 * @returns True if token is expired
 */
export declare function isTokenExpired(expiresAt: Date): boolean;
/**
 * Calculate token expiration date
 *
 * @param daysValid - Number of days token should be valid (default: 90)
 * @returns Expiration timestamp
 */
export declare function getTokenExpiration(daysValid?: number): Date;
export declare const DeviceTokens: {
    generate: typeof generateDeviceToken;
    generatePairingCode: typeof generatePairingCode;
    hash: typeof hashToken;
    verify: typeof verifyToken;
    isValidFormat: typeof isValidTokenFormat;
    isExpired: typeof isTokenExpired;
    getExpiration: typeof getTokenExpiration;
};
//# sourceMappingURL=token-utils.d.ts.map