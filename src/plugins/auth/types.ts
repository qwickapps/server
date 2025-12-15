/**
 * Auth Plugin Types
 *
 * Type definitions for the pluggable authentication system.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Authenticated user information
 */
export interface AuthenticatedUser {
  /** Unique user ID from the provider */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name?: string;
  /** User's profile picture URL */
  picture?: string;
  /** Whether the email is verified */
  emailVerified?: boolean;
  /** User's roles from the provider */
  roles?: string[];
  /** Raw user object from the provider */
  raw?: Record<string, unknown>;
}

/**
 * Auth adapter interface - all adapters must implement this
 */
export interface AuthAdapter {
  /** Adapter name (e.g., 'auth0', 'supabase', 'basic') */
  name: string;

  /**
   * Initialize the adapter - called once during plugin setup
   * Returns middleware to apply to the Express app
   */
  initialize(): RequestHandler | RequestHandler[];

  /**
   * Check if the request is authenticated
   */
  isAuthenticated(req: Request): boolean;

  /**
   * Get the authenticated user from the request
   * Can be async for adapters that need to validate tokens
   */
  getUser(req: Request): AuthenticatedUser | null | Promise<AuthenticatedUser | null>;

  /**
   * Check if user has required roles (optional)
   */
  hasRoles?(req: Request, roles: string[]): boolean;

  /**
   * Get the access token for downstream API calls (optional)
   */
  getAccessToken?(req: Request): string | null;

  /**
   * Handler for unauthorized requests (optional custom behavior)
   */
  onUnauthorized?(req: Request, res: Response): void;

  /**
   * Cleanup resources on shutdown (optional)
   */
  shutdown?(): Promise<void>;
}

/**
 * Auth0 adapter configuration
 */
export interface Auth0AdapterConfig {
  /** Auth0 domain (e.g., 'myapp.auth0.com') */
  domain: string;
  /** Auth0 client ID */
  clientId: string;
  /** Auth0 client secret */
  clientSecret: string;
  /** Base URL of the application */
  baseUrl: string;
  /** Session secret for cookie encryption */
  secret: string;
  /** API audience for access tokens (optional) */
  audience?: string;
  /** Scopes to request (default: ['openid', 'profile', 'email']) */
  scopes?: string[];
  /** Allowed roles - only these roles can access (optional) */
  allowedRoles?: string[];
  /** Allowed email domains - only these domains can access (optional) */
  allowedDomains?: string[];
  /** Whether to expose the access token to handlers (default: false) */
  exposeAccessToken?: boolean;
  /** Auth routes configuration */
  routes?: {
    login?: string;
    logout?: string;
    callback?: string;
  };
}

/**
 * Supabase adapter configuration
 */
export interface SupabaseAdapterConfig {
  /** Supabase project URL */
  url: string;
  /** Supabase anon key */
  anonKey: string;
}

/**
 * Basic auth adapter configuration
 */
export interface BasicAdapterConfig {
  /** Username for basic auth */
  username: string;
  /** Password for basic auth */
  password: string;
  /** Realm name for the WWW-Authenticate header */
  realm?: string;
}

/**
 * Supertokens adapter configuration
 */
export interface SupertokensAdapterConfig {
  /** Supertokens connection URI (e.g., 'http://localhost:3567') */
  connectionUri: string;

  /** Supertokens API key (for managed service) */
  apiKey?: string;

  /** App name for branding */
  appName: string;

  /** API domain (e.g., 'http://localhost:3000') */
  apiDomain: string;

  /** Website domain (e.g., 'http://localhost:3000') */
  websiteDomain: string;

  /** API base path (default: '/auth') */
  apiBasePath?: string;

  /** Website base path (default: '/auth') */
  websiteBasePath?: string;

  /** Enable email/password auth (default: true) */
  enableEmailPassword?: boolean;

  /** Social login providers */
  socialProviders?: {
    google?: { clientId: string; clientSecret: string };
    apple?: {
      clientId: string;
      clientSecret: string;
      keyId: string;
      teamId: string;
    };
    github?: { clientId: string; clientSecret: string };
  };
}

/**
 * Auth plugin configuration
 */
export interface AuthPluginConfig {
  /** Primary adapter for authentication */
  adapter: AuthAdapter;
  /** Fallback adapters checked in order if primary fails (optional) */
  fallback?: AuthAdapter[];
  /** Paths to exclude from authentication */
  excludePaths?: string[];
  /** Whether auth is required for all routes (default: true) */
  authRequired?: boolean;
  /** Custom unauthorized handler */
  onUnauthorized?: (req: Request, res: Response) => void;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Extended Express Request with auth info
 */
export interface AuthenticatedRequest extends Request {
  auth: {
    isAuthenticated: boolean;
    user: AuthenticatedUser | null;
    adapter: string;
    accessToken?: string;
  };
}

/**
 * Helper type guard for authenticated requests
 */
export function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return 'auth' in req && (req as AuthenticatedRequest).auth?.isAuthenticated === true;
}
