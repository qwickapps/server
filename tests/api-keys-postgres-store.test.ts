/**
 * Unit tests for API Keys PostgreSQL Store
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postgresApiKeyStore } from '../src/plugins/api-keys/stores/postgres-store.js';
import type { CreateApiKeyParams, UpdateApiKeyParams } from '../src/plugins/api-keys/types.js';

// Mock pg client
interface MockPgClient {
  query: ReturnType<typeof vi.fn>;
  release: ReturnType<typeof vi.fn>;
}

interface MockPgPool {
  query: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
}

function createMockPool(): MockPgPool {
  const mockClient: MockPgClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  return {
    query: vi.fn(),
    connect: vi.fn().mockResolvedValue(mockClient),
  };
}

describe('API Keys PostgreSQL Store', () => {
  let mockPool: MockPgPool;
  let mockClient: MockPgClient;

  beforeEach(() => {
    mockPool = createMockPool();
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    (mockPool.connect as any).mockResolvedValue(mockClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create table and indexes when autoCreateTables is true', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: true,
        enableRLS: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS')
      );
    });

    it('should enable RLS when configured', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: true,
        enableRLS: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('ENABLE ROW LEVEL SECURITY')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE POLICY')
      );
    });

    it('should skip table creation when autoCreateTables is false', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await store.initialize();

      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new API key with plaintext', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const params: CreateApiKeyParams = {
        user_id: 'user-123',
        name: 'Test Key',
        key_type: 'pat',
        scopes: ['read', 'write'],
      };

      const mockCreatedKey = {
        id: 'key-123',
        user_id: 'user-123',
        name: 'Test Key',
        key_hash: 'hash-value',
        key_prefix: 'qk_test_abc',
        key_type: 'pat',
        scopes: ['read', 'write'],
        last_used_at: null,
        expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [mockCreatedKey], rowCount: 1 }) // INSERT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.create(params);

      expect(result).toHaveProperty('plaintext_key');
      expect(result.plaintext_key).toMatch(/^qk_(test|live)_/);
      expect(result.name).toBe('Test Key');
      expect(result.scopes).toEqual(['read', 'write']);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should generate M2M key with live prefix', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
        environment: 'live', // Explicitly set to live for this test
      });

      const params: CreateApiKeyParams = {
        user_id: 'user-123',
        name: 'M2M Key',
        key_type: 'm2m',
        scopes: ['admin'],
      };

      const mockCreatedKey = {
        id: 'key-456',
        user_id: 'user-123',
        name: 'M2M Key',
        key_hash: 'hash-value',
        key_prefix: 'qk_live_xyz',
        key_type: 'm2m',
        scopes: ['admin'],
        last_used_at: null,
        expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [mockCreatedKey], rowCount: 1 }) // INSERT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.create(params);

      expect(result.plaintext_key).toMatch(/^qk_live_/);
    });

    it('should rollback on error', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const params: CreateApiKeyParams = {
        user_id: 'user-123',
        name: 'Test Key',
        key_type: 'pat',
        scopes: ['read'],
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockRejectedValueOnce(new Error('Database error')) // INSERT fails
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      await expect(store.create(params)).rejects.toThrow('Database error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return all API keys for a user', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockKeys = [
        {
          id: 'key-1',
          user_id: 'user-123',
          name: 'Key 1',
          key_hash: 'hash1',
          key_prefix: 'qk_test_abc',
          key_type: 'pat',
          scopes: ['read'],
          last_used_at: null,
          expires_at: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'key-2',
          user_id: 'user-123',
          name: 'Key 2',
          key_hash: 'hash2',
          key_prefix: 'qk_live_xyz',
          key_type: 'm2m',
          scopes: ['write', 'admin'],
          last_used_at: null,
          expires_at: null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: mockKeys, rowCount: 2 }) // SELECT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.list('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Key 1');
      expect(result[1].name).toBe('Key 2');
    });

    it('should return empty array when user has no keys', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.list('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return a specific API key', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        name: 'Test Key',
        key_hash: 'hash',
        key_prefix: 'qk_test_abc',
        key_type: 'pat',
        scopes: ['read'],
        last_used_at: null,
        expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [mockKey], rowCount: 1 }) // SELECT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.get('user-123', 'key-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('key-123');
      expect(result?.name).toBe('Test Key');
    });

    it('should return null when key not found', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // SELECT
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.get('user-123', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('verify', () => {
    it('should verify a valid active key', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      // We need to use the actual hash for verification
      const testKey = 'qk_test_' + 'a'.repeat(43); // Valid base64url length
      const crypto = await import('crypto');
      const expectedHash = crypto.createHash('sha256').update(testKey).digest('hex');

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        name: 'Test Key',
        key_hash: expectedHash,
        key_prefix: 'qk_test_aaaa',
        key_type: 'pat',
        scopes: ['read'],
        last_used_at: null,
        expires_at: null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockKey], rowCount: 1 });

      const result = await store.verify(testKey);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('key-123');
    });

    it('should return null for invalid key format', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const result = await store.verify('invalid-key');

      expect(result).toBeNull();
      expect(mockPool.query).not.toHaveBeenCalled();
    });

    it('should return null for inactive key', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const testKey = 'qk_test_' + 'a'.repeat(43);
      const result = await store.verify(testKey);

      expect(result).toBeNull();
    });

    it('should return null for expired key', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const testKey = 'qk_test_' + 'a'.repeat(43);
      const crypto = await import('crypto');
      const expectedHash = crypto.createHash('sha256').update(testKey).digest('hex');

      const expiredDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // Yesterday

      const mockKey = {
        id: 'key-123',
        user_id: 'user-123',
        name: 'Expired Key',
        key_hash: expectedHash,
        key_prefix: 'qk_test_aaaa',
        key_type: 'pat',
        scopes: ['read'],
        last_used_at: null,
        expires_at: expiredDate.toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPool.query.mockResolvedValueOnce({ rows: [mockKey], rowCount: 1 });

      const result = await store.verify(testKey);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update API key properties', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const updates: UpdateApiKeyParams = {
        name: 'Updated Name',
        scopes: ['read', 'write', 'admin'],
        is_active: false,
      };

      const mockUpdatedKey = {
        id: 'key-123',
        user_id: 'user-123',
        name: 'Updated Name',
        key_hash: 'hash',
        key_prefix: 'qk_test_abc',
        key_type: 'pat',
        scopes: ['read', 'write', 'admin'],
        last_used_at: null,
        expires_at: null,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [mockUpdatedKey], rowCount: 1 }) // UPDATE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.update('user-123', 'key-123', updates);

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
      expect(result?.scopes).toEqual(['read', 'write', 'admin']);
      expect(result?.is_active).toBe(false);
    });

    it('should return null when key not found', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // UPDATE returns nothing
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.update('user-123', 'nonexistent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an API key', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // DELETE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.delete('user-123', 'key-123');

      expect(result).toBe(true);
    });

    it('should return false when key not found', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // set_config
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // DELETE
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const result = await store.delete('user-123', 'nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('recordUsage', () => {
    it('should update last_used_at timestamp', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await store.recordUsage('key-123');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE'),
        ['key-123']
      );
    });
  });

  describe('shutdown', () => {
    it('should complete without error', async () => {
      const store = postgresApiKeyStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await expect(store.shutdown()).resolves.toBeUndefined();
    });
  });
});
