/**
 * Auth Environment Configuration Tests
 *
 * Tests for createAuthPluginFromEnv() factory function and env parsing.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAuthPluginFromEnv, getAuthStatus, __testing } from '../src/plugins/auth/env-config.js';

const {
  parseSupertokensEnv,
  parseAuth0Env,
  parseSupabaseEnv,
  parseBasicAuthEnv,
  getEnv,
  getEnvBool,
  getEnvList,
  maskValue,
  VALID_ADAPTERS,
} = __testing;

// ═══════════════════════════════════════════════════════════════════════════
// Test Fixtures
// ═══════════════════════════════════════════════════════════════════════════

const validSupertokensEnv = {
  AUTH_ADAPTER: 'supertokens',
  SUPERTOKENS_CONNECTION_URI: 'http://localhost:3567',
  SUPERTOKENS_APP_NAME: 'TestApp',
  SUPERTOKENS_API_DOMAIN: 'http://localhost:3000',
  SUPERTOKENS_WEBSITE_DOMAIN: 'http://localhost:3000',
};

const validAuth0Env = {
  AUTH_ADAPTER: 'auth0',
  AUTH0_DOMAIN: 'test.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
  AUTH0_BASE_URL: 'http://localhost:3000',
  AUTH0_SECRET: 'test-session-secret-at-least-32-chars',
};

const validSupabaseEnv = {
  AUTH_ADAPTER: 'supabase',
  SUPABASE_URL: 'https://xxx.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
};

const validBasicAuthEnv = {
  AUTH_ADAPTER: 'basic',
  BASIC_AUTH_USERNAME: 'admin',
  BASIC_AUTH_PASSWORD: 'secret',
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set environment variables for a test
 */
function setEnv(vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value;
  }
}

/**
 * Clear all auth-related environment variables
 */
function clearAuthEnv(): void {
  const prefixes = ['AUTH_', 'SUPERTOKENS_', 'AUTH0_', 'SUPABASE_', 'BASIC_AUTH_'];
  for (const key of Object.keys(process.env)) {
    if (prefixes.some((p) => key.startsWith(p))) {
      delete process.env[key];
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Helper Functions
// ═══════════════════════════════════════════════════════════════════════════

describe('Helper Functions', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  describe('getEnv', () => {
    it('returns undefined for unset variable', () => {
      expect(getEnv('NONEXISTENT_VAR')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      process.env.TEST_VAR = '';
      expect(getEnv('TEST_VAR')).toBeUndefined();
    });

    it('returns undefined for whitespace-only value', () => {
      process.env.TEST_VAR = '   ';
      expect(getEnv('TEST_VAR')).toBeUndefined();
    });

    it('returns trimmed value', () => {
      process.env.TEST_VAR = '  value  ';
      expect(getEnv('TEST_VAR')).toBe('value');
    });

    it('returns value as-is when no whitespace', () => {
      process.env.TEST_VAR = 'value';
      expect(getEnv('TEST_VAR')).toBe('value');
    });
  });

  describe('getEnvBool', () => {
    it('returns default for unset variable', () => {
      expect(getEnvBool('NONEXISTENT_VAR', true)).toBe(true);
      expect(getEnvBool('NONEXISTENT_VAR', false)).toBe(false);
    });

    it('parses "true" as true', () => {
      process.env.TEST_VAR = 'true';
      expect(getEnvBool('TEST_VAR', false)).toBe(true);
    });

    it('parses "TRUE" as true (case-insensitive)', () => {
      process.env.TEST_VAR = 'TRUE';
      expect(getEnvBool('TEST_VAR', false)).toBe(true);
    });

    it('parses "1" as true', () => {
      process.env.TEST_VAR = '1';
      expect(getEnvBool('TEST_VAR', false)).toBe(true);
    });

    it('parses "yes" as true', () => {
      process.env.TEST_VAR = 'yes';
      expect(getEnvBool('TEST_VAR', false)).toBe(true);
    });

    it('parses "false" as false', () => {
      process.env.TEST_VAR = 'false';
      expect(getEnvBool('TEST_VAR', true)).toBe(false);
    });

    it('parses "0" as false', () => {
      process.env.TEST_VAR = '0';
      expect(getEnvBool('TEST_VAR', true)).toBe(false);
    });

    it('parses "no" as false', () => {
      process.env.TEST_VAR = 'no';
      expect(getEnvBool('TEST_VAR', true)).toBe(false);
    });

    it('returns default for invalid value', () => {
      process.env.TEST_VAR = 'invalid';
      expect(getEnvBool('TEST_VAR', true)).toBe(true);
      expect(getEnvBool('TEST_VAR', false)).toBe(false);
    });
  });

  describe('getEnvList', () => {
    it('returns undefined for unset variable', () => {
      expect(getEnvList('NONEXISTENT_VAR')).toBeUndefined();
    });

    it('parses comma-separated values', () => {
      process.env.TEST_VAR = 'a,b,c';
      expect(getEnvList('TEST_VAR')).toEqual(['a', 'b', 'c']);
    });

    it('trims whitespace from values', () => {
      process.env.TEST_VAR = ' a , b , c ';
      expect(getEnvList('TEST_VAR')).toEqual(['a', 'b', 'c']);
    });

    it('filters empty values', () => {
      process.env.TEST_VAR = 'a,,b, ,c';
      expect(getEnvList('TEST_VAR')).toEqual(['a', 'b', 'c']);
    });

    it('handles single value', () => {
      process.env.TEST_VAR = 'single';
      expect(getEnvList('TEST_VAR')).toEqual(['single']);
    });
  });

  describe('maskValue', () => {
    it('masks short values completely', () => {
      expect(maskValue('abc')).toBe('****');
      expect(maskValue('abcd')).toBe('****');
    });

    it('shows first and last two chars for longer values', () => {
      expect(maskValue('abcdef')).toBe('ab**ef');
      expect(maskValue('secret-key-here')).toBe('se***********re');
    });

    it('limits mask length for very long values', () => {
      const longValue = 'a'.repeat(100);
      const masked = maskValue(longValue);
      expect(masked.length).toBeLessThanOrEqual(24); // 2 + 20 + 2
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Supertokens Parser
// ═══════════════════════════════════════════════════════════════════════════

describe('parseSupertokensEnv', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it('parses all required variables', () => {
    setEnv(validSupertokensEnv);
    const result = parseSupertokensEnv();

    expect(result.errors).toHaveLength(0);
    expect(result.config).toEqual({
      connectionUri: 'http://localhost:3567',
      appName: 'TestApp',
      apiDomain: 'http://localhost:3000',
      websiteDomain: 'http://localhost:3000',
      apiKey: undefined,
      apiBasePath: '/auth',
      websiteBasePath: '/auth',
      enableEmailPassword: true,
    });
  });

  it('returns error for missing connectionUri', () => {
    const { SUPERTOKENS_CONNECTION_URI, ...rest } = validSupertokensEnv;
    setEnv(rest);
    const result = parseSupertokensEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPERTOKENS_CONNECTION_URI');
  });

  it('returns error for missing appName', () => {
    const { SUPERTOKENS_APP_NAME, ...rest } = validSupertokensEnv;
    setEnv(rest);
    const result = parseSupertokensEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPERTOKENS_APP_NAME');
  });

  it('returns error for missing apiDomain', () => {
    const { SUPERTOKENS_API_DOMAIN, ...rest } = validSupertokensEnv;
    setEnv(rest);
    const result = parseSupertokensEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPERTOKENS_API_DOMAIN');
  });

  it('returns error for missing websiteDomain', () => {
    const { SUPERTOKENS_WEBSITE_DOMAIN, ...rest } = validSupertokensEnv;
    setEnv(rest);
    const result = parseSupertokensEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPERTOKENS_WEBSITE_DOMAIN');
  });

  it('returns all missing vars in errors', () => {
    const result = parseSupertokensEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toHaveLength(4);
    expect(result.errors).toContain('SUPERTOKENS_CONNECTION_URI');
    expect(result.errors).toContain('SUPERTOKENS_APP_NAME');
    expect(result.errors).toContain('SUPERTOKENS_API_DOMAIN');
    expect(result.errors).toContain('SUPERTOKENS_WEBSITE_DOMAIN');
  });

  it('parses optional apiKey', () => {
    setEnv({ ...validSupertokensEnv, SUPERTOKENS_API_KEY: 'my-api-key' });
    const result = parseSupertokensEnv();

    expect(result.errors).toHaveLength(0);
    expect(result.config?.apiKey).toBe('my-api-key');
  });

  it('parses custom apiBasePath', () => {
    setEnv({ ...validSupertokensEnv, SUPERTOKENS_API_BASE_PATH: '/api/auth' });
    const result = parseSupertokensEnv();

    expect(result.config?.apiBasePath).toBe('/api/auth');
  });

  it('parses custom websiteBasePath', () => {
    setEnv({ ...validSupertokensEnv, SUPERTOKENS_WEBSITE_BASE_PATH: '/account' });
    const result = parseSupertokensEnv();

    expect(result.config?.websiteBasePath).toBe('/account');
  });

  it('parses enableEmailPassword as false', () => {
    setEnv({ ...validSupertokensEnv, SUPERTOKENS_ENABLE_EMAIL_PASSWORD: 'false' });
    const result = parseSupertokensEnv();

    expect(result.config?.enableEmailPassword).toBe(false);
  });

  it('parses Google social provider', () => {
    setEnv({
      ...validSupertokensEnv,
      SUPERTOKENS_GOOGLE_CLIENT_ID: 'google-id',
      SUPERTOKENS_GOOGLE_CLIENT_SECRET: 'google-secret',
    });
    const result = parseSupertokensEnv();

    expect(result.config?.socialProviders?.google).toEqual({
      clientId: 'google-id',
      clientSecret: 'google-secret',
    });
  });

  it('parses GitHub social provider', () => {
    setEnv({
      ...validSupertokensEnv,
      SUPERTOKENS_GITHUB_CLIENT_ID: 'github-id',
      SUPERTOKENS_GITHUB_CLIENT_SECRET: 'github-secret',
    });
    const result = parseSupertokensEnv();

    expect(result.config?.socialProviders?.github).toEqual({
      clientId: 'github-id',
      clientSecret: 'github-secret',
    });
  });

  it('parses Apple social provider', () => {
    setEnv({
      ...validSupertokensEnv,
      SUPERTOKENS_APPLE_CLIENT_ID: 'apple-id',
      SUPERTOKENS_APPLE_CLIENT_SECRET: 'apple-secret',
      SUPERTOKENS_APPLE_KEY_ID: 'key-id',
      SUPERTOKENS_APPLE_TEAM_ID: 'team-id',
    });
    const result = parseSupertokensEnv();

    expect(result.config?.socialProviders?.apple).toEqual({
      clientId: 'apple-id',
      clientSecret: 'apple-secret',
      keyId: 'key-id',
      teamId: 'team-id',
    });
  });

  it('ignores incomplete Google provider (missing secret)', () => {
    setEnv({
      ...validSupertokensEnv,
      SUPERTOKENS_GOOGLE_CLIENT_ID: 'google-id',
    });
    const result = parseSupertokensEnv();

    expect(result.config?.socialProviders?.google).toBeUndefined();
  });

  it('ignores incomplete Apple provider (missing keyId)', () => {
    setEnv({
      ...validSupertokensEnv,
      SUPERTOKENS_APPLE_CLIENT_ID: 'apple-id',
      SUPERTOKENS_APPLE_CLIENT_SECRET: 'apple-secret',
      // Missing keyId and teamId
    });
    const result = parseSupertokensEnv();

    expect(result.config?.socialProviders?.apple).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Auth0 Parser
// ═══════════════════════════════════════════════════════════════════════════

describe('parseAuth0Env', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it('parses all required variables', () => {
    setEnv(validAuth0Env);
    const result = parseAuth0Env();

    expect(result.errors).toHaveLength(0);
    expect(result.config).toMatchObject({
      domain: 'test.auth0.com',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      baseUrl: 'http://localhost:3000',
      secret: 'test-session-secret-at-least-32-chars',
    });
  });

  it('returns error for missing domain', () => {
    const { AUTH0_DOMAIN, ...rest } = validAuth0Env;
    setEnv(rest);
    const result = parseAuth0Env();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('AUTH0_DOMAIN');
  });

  it('returns error for missing clientId', () => {
    const { AUTH0_CLIENT_ID, ...rest } = validAuth0Env;
    setEnv(rest);
    const result = parseAuth0Env();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('AUTH0_CLIENT_ID');
  });

  it('returns error for missing clientSecret', () => {
    const { AUTH0_CLIENT_SECRET, ...rest } = validAuth0Env;
    setEnv(rest);
    const result = parseAuth0Env();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('AUTH0_CLIENT_SECRET');
  });

  it('returns error for missing baseUrl', () => {
    const { AUTH0_BASE_URL, ...rest } = validAuth0Env;
    setEnv(rest);
    const result = parseAuth0Env();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('AUTH0_BASE_URL');
  });

  it('returns error for missing secret', () => {
    const { AUTH0_SECRET, ...rest } = validAuth0Env;
    setEnv(rest);
    const result = parseAuth0Env();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('AUTH0_SECRET');
  });

  it('applies default scopes', () => {
    setEnv(validAuth0Env);
    const result = parseAuth0Env();

    expect(result.config?.scopes).toEqual(['openid', 'profile', 'email']);
  });

  it('parses custom scopes', () => {
    setEnv({ ...validAuth0Env, AUTH0_SCOPES: 'openid,profile' });
    const result = parseAuth0Env();

    expect(result.config?.scopes).toEqual(['openid', 'profile']);
  });

  it('parses optional audience', () => {
    setEnv({ ...validAuth0Env, AUTH0_AUDIENCE: 'https://api.example.com' });
    const result = parseAuth0Env();

    expect(result.config?.audience).toBe('https://api.example.com');
  });

  it('parses allowedRoles', () => {
    setEnv({ ...validAuth0Env, AUTH0_ALLOWED_ROLES: 'admin,user' });
    const result = parseAuth0Env();

    expect(result.config?.allowedRoles).toEqual(['admin', 'user']);
  });

  it('parses allowedDomains', () => {
    setEnv({ ...validAuth0Env, AUTH0_ALLOWED_DOMAINS: 'example.com,acme.org' });
    const result = parseAuth0Env();

    expect(result.config?.allowedDomains).toEqual(['example.com', 'acme.org']);
  });

  it('parses exposeAccessToken', () => {
    setEnv({ ...validAuth0Env, AUTH0_EXPOSE_ACCESS_TOKEN: 'true' });
    const result = parseAuth0Env();

    expect(result.config?.exposeAccessToken).toBe(true);
  });

  it('applies default routes', () => {
    setEnv(validAuth0Env);
    const result = parseAuth0Env();

    expect(result.config?.routes).toEqual({
      login: '/login',
      logout: '/logout',
      callback: '/callback',
    });
  });

  it('parses custom routes', () => {
    setEnv({
      ...validAuth0Env,
      AUTH0_LOGIN_PATH: '/signin',
      AUTH0_LOGOUT_PATH: '/signout',
      AUTH0_CALLBACK_PATH: '/oauth/callback',
    });
    const result = parseAuth0Env();

    expect(result.config?.routes).toEqual({
      login: '/signin',
      logout: '/signout',
      callback: '/oauth/callback',
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Supabase Parser
// ═══════════════════════════════════════════════════════════════════════════

describe('parseSupabaseEnv', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it('parses all required variables', () => {
    setEnv(validSupabaseEnv);
    const result = parseSupabaseEnv();

    expect(result.errors).toHaveLength(0);
    expect(result.config).toEqual({
      url: 'https://xxx.supabase.co',
      anonKey: 'test-anon-key',
    });
  });

  it('returns error for missing url', () => {
    const { SUPABASE_URL, ...rest } = validSupabaseEnv;
    setEnv(rest);
    const result = parseSupabaseEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPABASE_URL');
  });

  it('returns error for missing anonKey', () => {
    const { SUPABASE_ANON_KEY, ...rest } = validSupabaseEnv;
    setEnv(rest);
    const result = parseSupabaseEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('SUPABASE_ANON_KEY');
  });

  it('returns all missing vars in errors', () => {
    const result = parseSupabaseEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toHaveLength(2);
    expect(result.errors).toContain('SUPABASE_URL');
    expect(result.errors).toContain('SUPABASE_ANON_KEY');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Basic Auth Parser
// ═══════════════════════════════════════════════════════════════════════════

describe('parseBasicAuthEnv', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  it('parses all required variables', () => {
    setEnv(validBasicAuthEnv);
    const result = parseBasicAuthEnv();

    expect(result.errors).toHaveLength(0);
    expect(result.config).toEqual({
      username: 'admin',
      password: 'secret',
      realm: 'Protected',
    });
  });

  it('returns error for missing username', () => {
    const { BASIC_AUTH_USERNAME, ...rest } = validBasicAuthEnv;
    setEnv(rest);
    const result = parseBasicAuthEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('BASIC_AUTH_USERNAME');
  });

  it('returns error for missing password', () => {
    const { BASIC_AUTH_PASSWORD, ...rest } = validBasicAuthEnv;
    setEnv(rest);
    const result = parseBasicAuthEnv();

    expect(result.config).toBeNull();
    expect(result.errors).toContain('BASIC_AUTH_PASSWORD');
  });

  it('applies default realm', () => {
    setEnv(validBasicAuthEnv);
    const result = parseBasicAuthEnv();

    expect(result.config?.realm).toBe('Protected');
  });

  it('parses custom realm', () => {
    setEnv({ ...validBasicAuthEnv, BASIC_AUTH_REALM: 'MyApp' });
    const result = parseBasicAuthEnv();

    expect(result.config?.realm).toBe('MyApp');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Tests: Factory Function
// ═══════════════════════════════════════════════════════════════════════════

describe('createAuthPluginFromEnv', () => {
  beforeEach(() => {
    clearAuthEnv();
  });

  afterEach(() => {
    clearAuthEnv();
  });

  describe('disabled state', () => {
    it('returns disabled plugin when AUTH_ADAPTER not set', () => {
      const plugin = createAuthPluginFromEnv();

      expect(plugin.id).toBe('auth');
      expect(plugin.name).toBe('Auth Plugin (Disabled)');

      const status = getAuthStatus();
      expect(status.state).toBe('disabled');
      expect(status.adapter).toBeNull();
    });

    it('returns disabled plugin when AUTH_ADAPTER is empty', () => {
      process.env.AUTH_ADAPTER = '';
      const plugin = createAuthPluginFromEnv();

      expect(plugin.name).toBe('Auth Plugin (Disabled)');

      const status = getAuthStatus();
      expect(status.state).toBe('disabled');
    });

    it('returns disabled plugin when AUTH_ADAPTER is whitespace', () => {
      process.env.AUTH_ADAPTER = '   ';
      const plugin = createAuthPluginFromEnv();

      expect(plugin.name).toBe('Auth Plugin (Disabled)');

      const status = getAuthStatus();
      expect(status.state).toBe('disabled');
    });
  });

  describe('error state', () => {
    it('returns error plugin for unknown adapter', () => {
      process.env.AUTH_ADAPTER = 'unknown';
      const plugin = createAuthPluginFromEnv();

      expect(plugin.name).toBe('Auth Plugin (Error)');

      const status = getAuthStatus();
      expect(status.state).toBe('error');
      expect(status.error).toContain('Invalid AUTH_ADAPTER');
      expect(status.error).toContain('unknown');
      expect(status.error).toContain(VALID_ADAPTERS.join(', '));
    });

    it('returns error plugin for missing supertokens config', () => {
      process.env.AUTH_ADAPTER = 'supertokens';
      // Not setting any SUPERTOKENS_* vars
      const plugin = createAuthPluginFromEnv();

      expect(plugin.name).toBe('Auth Plugin (Error)');

      const status = getAuthStatus();
      expect(status.state).toBe('error');
      expect(status.error).toContain('Missing required environment variables');
      expect(status.missingVars).toContain('SUPERTOKENS_CONNECTION_URI');
    });

    it('returns error plugin for missing auth0 config', () => {
      process.env.AUTH_ADAPTER = 'auth0';
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('error');
      expect(status.missingVars).toContain('AUTH0_DOMAIN');
    });

    it('returns error plugin for missing supabase config', () => {
      process.env.AUTH_ADAPTER = 'supabase';
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('error');
      expect(status.missingVars).toContain('SUPABASE_URL');
    });

    it('returns error plugin for missing basic auth config', () => {
      process.env.AUTH_ADAPTER = 'basic';
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('error');
      expect(status.missingVars).toContain('BASIC_AUTH_USERNAME');
    });
  });

  describe('enabled state', () => {
    it('returns enabled plugin for valid supertokens config', () => {
      setEnv(validSupertokensEnv);
      const plugin = createAuthPluginFromEnv();

      expect(plugin.id).toBe('auth');
      expect(plugin.name).toBe('Auth Plugin');

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
      expect(status.adapter).toBe('supertokens');
    });

    it('returns enabled plugin for valid auth0 config', () => {
      setEnv(validAuth0Env);
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
      expect(status.adapter).toBe('auth0');
    });

    it('returns enabled plugin for valid supabase config', () => {
      setEnv(validSupabaseEnv);
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
      expect(status.adapter).toBe('supabase');
    });

    it('returns enabled plugin for valid basic auth config', () => {
      setEnv(validBasicAuthEnv);
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
      expect(status.adapter).toBe('basic');
    });

    it('handles case-insensitive adapter names', () => {
      setEnv({ ...validSupertokensEnv, AUTH_ADAPTER: 'SUPERTOKENS' });
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
      expect(status.adapter).toBe('supertokens');
    });
  });

  describe('options', () => {
    it('uses options.excludePaths when provided', () => {
      setEnv(validBasicAuthEnv);
      const plugin = createAuthPluginFromEnv({
        excludePaths: ['/health', '/metrics'],
      });

      // Plugin created successfully
      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
    });

    it('uses AUTH_EXCLUDE_PATHS when options not provided', () => {
      setEnv({
        ...validBasicAuthEnv,
        AUTH_EXCLUDE_PATHS: '/health,/metrics',
      });
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
    });

    it('uses options.authRequired when provided', () => {
      setEnv(validBasicAuthEnv);
      const plugin = createAuthPluginFromEnv({
        authRequired: false,
      });

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
    });

    it('uses AUTH_REQUIRED env var when options not provided', () => {
      setEnv({
        ...validBasicAuthEnv,
        AUTH_REQUIRED: 'false',
      });
      const plugin = createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.state).toBe('enabled');
    });
  });

  describe('getAuthStatus', () => {
    it('masks secrets in config', () => {
      setEnv({
        ...validBasicAuthEnv,
        BASIC_AUTH_PASSWORD: 'super-secret-password',
      });
      createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.config?.BASIC_AUTH_PASSWORD).not.toBe('super-secret-password');
      expect(status.config?.BASIC_AUTH_PASSWORD).toContain('*');
    });

    it('includes non-sensitive values in config', () => {
      setEnv(validBasicAuthEnv);
      createAuthPluginFromEnv();

      const status = getAuthStatus();
      expect(status.config?.BASIC_AUTH_USERNAME).toBe('admin');
      expect(status.config?.AUTH_ADAPTER).toBe('basic');
    });
  });
});
