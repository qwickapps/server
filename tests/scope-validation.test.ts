/**
 * Unit tests for Scope Validation Functions
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect } from 'vitest';
import {
  isValidScopeFormat,
  normalizeScope,
  ApiKeyScopeSchema,
} from '../src/plugins/api-keys/types.js';

describe('Scope Validation', () => {
  describe('isValidScopeFormat', () => {
    it('should accept valid plugin scope format (plugin-id:action)', () => {
      expect(isValidScopeFormat('qwickbrain:read')).toBe(true);
      expect(isValidScopeFormat('qwickbrain:execute')).toBe(true);
      expect(isValidScopeFormat('system:read')).toBe(true);
      expect(isValidScopeFormat('api-keys:admin')).toBe(true);
      expect(isValidScopeFormat('my-plugin:my-action')).toBe(true);
    });

    it('should accept legacy scope formats', () => {
      expect(isValidScopeFormat('read')).toBe(true);
      expect(isValidScopeFormat('write')).toBe(true);
      expect(isValidScopeFormat('admin')).toBe(true);
    });

    it('should reject scopes without colon separator', () => {
      expect(isValidScopeFormat('qwickbrain')).toBe(false);
      expect(isValidScopeFormat('readwrite')).toBe(false);
    });

    it('should reject scopes with invalid characters', () => {
      expect(isValidScopeFormat('QWICKBRAIN:READ')).toBe(false); // uppercase
      expect(isValidScopeFormat('qwick_brain:read')).toBe(false); // underscore
      expect(isValidScopeFormat('qwickbrain:read!')).toBe(false); // special char
      expect(isValidScopeFormat('qwick brain:read')).toBe(false); // space
    });

    it('should reject scopes with empty plugin-id or action', () => {
      expect(isValidScopeFormat(':read')).toBe(false);
      expect(isValidScopeFormat('qwickbrain:')).toBe(false);
      expect(isValidScopeFormat(':')).toBe(false);
    });

    it('should reject scopes with multiple colons', () => {
      expect(isValidScopeFormat('qwickbrain:read:write')).toBe(false);
    });

    it('should reject invalid legacy scopes', () => {
      expect(isValidScopeFormat('execute')).toBe(false);
      expect(isValidScopeFormat('delete')).toBe(false);
      expect(isValidScopeFormat('superadmin')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidScopeFormat('')).toBe(false);
      expect(isValidScopeFormat('a:b')).toBe(true); // minimum valid
      expect(isValidScopeFormat('plugin-with-many-dashes:action-with-dashes')).toBe(true);
      expect(isValidScopeFormat('plugin123:action456')).toBe(true); // numbers allowed
    });
  });

  describe('normalizeScope', () => {
    it('should convert legacy read to system:read', () => {
      expect(normalizeScope('read')).toBe('system:read');
    });

    it('should convert legacy write to system:write', () => {
      expect(normalizeScope('write')).toBe('system:write');
    });

    it('should convert legacy admin to system:admin', () => {
      expect(normalizeScope('admin')).toBe('system:admin');
    });

    it('should pass through plugin scopes unchanged', () => {
      expect(normalizeScope('qwickbrain:read')).toBe('qwickbrain:read');
      expect(normalizeScope('qwickbrain:execute')).toBe('qwickbrain:execute');
      expect(normalizeScope('api-keys:admin')).toBe('api-keys:admin');
      expect(normalizeScope('system:read')).toBe('system:read');
    });

    it('should handle unknown scopes by passing through', () => {
      expect(normalizeScope('unknown:scope')).toBe('unknown:scope');
      expect(normalizeScope('invalid')).toBe('invalid');
    });

    it('should handle edge cases', () => {
      expect(normalizeScope('')).toBe('');
      expect(normalizeScope('system:write')).toBe('system:write'); // already normalized
    });
  });

  describe('ApiKeyScopeSchema (Zod)', () => {
    it('should validate valid plugin scopes', () => {
      expect(ApiKeyScopeSchema.safeParse('qwickbrain:read').success).toBe(true);
      expect(ApiKeyScopeSchema.safeParse('qwickbrain:execute').success).toBe(true);
      expect(ApiKeyScopeSchema.safeParse('system:admin').success).toBe(true);
    });

    it('should validate legacy scopes', () => {
      expect(ApiKeyScopeSchema.safeParse('read').success).toBe(true);
      expect(ApiKeyScopeSchema.safeParse('write').success).toBe(true);
      expect(ApiKeyScopeSchema.safeParse('admin').success).toBe(true);
    });

    it('should reject invalid scope formats', () => {
      const result1 = ApiKeyScopeSchema.safeParse('INVALID:SCOPE');
      expect(result1.success).toBe(false);
      if (!result1.success) {
        expect(result1.error.issues[0].message).toContain('plugin-id:action');
      }

      const result2 = ApiKeyScopeSchema.safeParse('no-colon');
      expect(result2.success).toBe(false);

      const result3 = ApiKeyScopeSchema.safeParse('');
      expect(result3.success).toBe(false);
    });

    it('should reject scopes with special characters', () => {
      expect(ApiKeyScopeSchema.safeParse('plugin_name:action').success).toBe(false);
      expect(ApiKeyScopeSchema.safeParse('plugin:action!').success).toBe(false);
      expect(ApiKeyScopeSchema.safeParse('plugin name:action').success).toBe(false);
    });

    it('should provide helpful error message', () => {
      const result = ApiKeyScopeSchema.safeParse('invalid');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/plugin-id:action|legacy scope/i);
      }
    });
  });

  describe('Scope Format Edge Cases', () => {
    it('should handle numeric plugin IDs and actions', () => {
      expect(isValidScopeFormat('plugin123:action456')).toBe(true);
      expect(isValidScopeFormat('123plugin:456action')).toBe(true);
    });

    it('should handle dashes in plugin IDs and actions', () => {
      expect(isValidScopeFormat('my-cool-plugin:my-cool-action')).toBe(true);
      expect(isValidScopeFormat('a-b-c:x-y-z')).toBe(true);
    });

    it('should reject starting or ending with dashes', () => {
      expect(isValidScopeFormat('-plugin:action')).toBe(false);
      expect(isValidScopeFormat('plugin-:action')).toBe(false);
      expect(isValidScopeFormat('plugin:action-')).toBe(false);
      expect(isValidScopeFormat('plugin:-action')).toBe(false);
    });

    it('should reject consecutive dashes', () => {
      expect(isValidScopeFormat('plugin--name:action')).toBe(false);
      expect(isValidScopeFormat('plugin:action--name')).toBe(false);
    });

    it('should handle minimum valid length scopes', () => {
      expect(isValidScopeFormat('a:b')).toBe(true);
      expect(isValidScopeFormat('a1:b2')).toBe(true);
    });
  });

  describe('Backwards Compatibility', () => {
    it('should ensure legacy scopes normalize to system namespace', () => {
      const legacyScopes = ['read', 'write', 'admin'];
      const normalized = legacyScopes.map(normalizeScope);

      expect(normalized).toEqual([
        'system:read',
        'system:write',
        'system:admin',
      ]);
    });

    it('should validate both legacy and normalized forms', () => {
      expect(isValidScopeFormat('read')).toBe(true);
      expect(isValidScopeFormat('system:read')).toBe(true);

      expect(ApiKeyScopeSchema.safeParse('write').success).toBe(true);
      expect(ApiKeyScopeSchema.safeParse('system:write').success).toBe(true);
    });

    it('should preserve plugin scopes during normalization', () => {
      const pluginScopes = [
        'qwickbrain:read',
        'qwickbrain:execute',
        'api-keys:admin',
      ];

      pluginScopes.forEach(scope => {
        expect(normalizeScope(scope)).toBe(scope);
      });
    });
  });
});
