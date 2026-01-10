/**
 * Auth0 Adapter
 *
 * Provides Auth0 authentication using express-openid-connect.
 * Enhanced with RBAC support, domain whitelisting, and token exposure.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { AuthAdapter, Auth0AdapterConfig } from '../types.js';
/**
 * Create an Auth0 authentication adapter
 */
export declare function auth0Adapter(config: Auth0AdapterConfig): AuthAdapter;
//# sourceMappingURL=auth0-adapter.d.ts.map