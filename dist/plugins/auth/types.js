/**
 * Auth Plugin Types
 *
 * Type definitions for the pluggable authentication system.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Helper type guard for authenticated requests
 */
export function isAuthenticatedRequest(req) {
    return 'auth' in req && req.auth?.isAuthenticated === true;
}
//# sourceMappingURL=types.js.map