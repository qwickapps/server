/**
 * Unit tests for Usage Log Store
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPostgresUsageLogStore } from '../src/plugins/api-keys/stores/usage-log-store.js';
import type { UsageLogEntry } from '../src/plugins/api-keys/stores/usage-log-store.js';

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

describe('Usage Log Store', () => {
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
    it('should create partitioned table when autoCreateTables is true', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS api_key_usage_logs')
      );
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('PARTITION BY RANGE (timestamp)')
      );
    });

    it('should create CHECK constraint for valid status codes', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CONSTRAINT valid_status_code CHECK (status_code >= 100 AND status_code < 600)')
      );
    });

    it('should create initial partitions (current + 2 future months)', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      // Should create 3 partitions
      const partitionCalls = (mockPool.query as any).mock.calls.filter((call: any[]) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS api_key_usage_logs_')
      );

      expect(partitionCalls.length).toBeGreaterThanOrEqual(3);
    });

    it('should create index on key_id and timestamp', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: true,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.initialize();

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_key_id')
      );
    });

    it('should skip table creation when autoCreateTables is false', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await store.initialize();

      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

  describe('log', () => {
    it('should insert a single usage log entry', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const entry: UsageLogEntry = {
        key_id: '123e4567-e89b-12d3-a456-426614174000',
        endpoint: '/api/test',
        method: 'GET',
        status_code: 200,
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
      };

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 1 });

      await store.log(entry);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO api_key_usage_logs'),
        expect.arrayContaining([
          entry.key_id,
          entry.endpoint,
          entry.method,
          entry.status_code,
          entry.ip_address,
          entry.user_agent,
        ])
      );
    });

    it('should handle optional fields (status_code, ip_address, user_agent)', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const entry: UsageLogEntry = {
        key_id: '123e4567-e89b-12d3-a456-426614174000',
        endpoint: '/api/test',
        method: 'POST',
      };

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 1 });

      await store.log(entry);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([entry.key_id, entry.endpoint, entry.method])
      );
    });

    it('should create partition if it does not exist', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: true,
        autoCreatePartitions: true,
      });

      const entry: UsageLogEntry = {
        key_id: '123e4567-e89b-12d3-a456-426614174000',
        endpoint: '/api/test',
        method: 'GET',
        timestamp: new Date('2025-12-26'),
      };

      // First call fails (partition doesn't exist), second succeeds
      mockPool.query
        .mockRejectedValueOnce(new Error('partition does not exist'))
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // Create partition
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // Insert

      await store.log(entry);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS api_key_usage_logs_')
      );
    });
  });

  describe('logBatch', () => {
    it('should insert multiple log entries in a single query', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const entries: UsageLogEntry[] = [
        {
          key_id: '123e4567-e89b-12d3-a456-426614174000',
          endpoint: '/api/test1',
          method: 'GET',
          status_code: 200,
        },
        {
          key_id: '123e4567-e89b-12d3-a456-426614174000',
          endpoint: '/api/test2',
          method: 'POST',
          status_code: 201,
        },
      ];

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 2 });

      await store.logBatch(entries);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO api_key_usage_logs'),
        expect.any(Array)
      );
    });

    it('should handle empty batch gracefully', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await store.logBatch([]);

      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

  describe('getKeyUsage', () => {
    it('should retrieve usage logs for a specific key', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockLogs = [
        {
          id: '1',
          key_id: 'key-123',
          endpoint: '/api/test',
          method: 'GET',
          status_code: 200,
          timestamp: new Date(),
        },
      ];

      mockPool.query.mockResolvedValue({ rows: mockLogs, rowCount: 1 });

      const result = await store.getKeyUsage('key-123');

      expect(result).toHaveLength(1);
      expect(result[0].endpoint).toBe('/api/test');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE key_id = $1'),
        expect.arrayContaining(['key-123'])
      );
    });

    it('should support limit and offset for pagination', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyUsage('key-123', { limit: 50, offset: 100 });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $'),
        expect.arrayContaining([50, 100])
      );
    });

    it('should filter by date range (since and until)', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const since = new Date('2025-12-01');
      const until = new Date('2025-12-31');

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyUsage('key-123', { since, until });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('timestamp >= $'),
        expect.arrayContaining([since, until])
      );
    });

    it('should filter by endpoint pattern', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyUsage('key-123', { endpoint: '/api/qwickbrain' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('endpoint'),
        expect.arrayContaining(['/api/qwickbrain'])
      );
    });

    it('should filter by HTTP method', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyUsage('key-123', { method: 'POST' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('method = $'),
        expect.arrayContaining(['POST'])
      );
    });

    it('should filter by status code', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyUsage('key-123', { statusCode: 404 });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('status_code = $'),
        expect.arrayContaining([404])
      );
    });
  });

  describe('getKeyStats', () => {
    it('should return aggregated statistics for a key', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const mockStats = {
        total_calls: '150',
        last_used: new Date('2025-12-26'),
        calls_by_status: JSON.stringify({ '200': 120, '404': 20, '500': 10 }),
        calls_by_endpoint: JSON.stringify({
          '/api/test': 100,
          '/api/qwickbrain': 50,
        }),
      };

      mockPool.query.mockResolvedValue({ rows: [mockStats], rowCount: 1 });

      const result = await store.getKeyStats('key-123');

      expect(result.totalCalls).toBe(150);
      expect(result.lastUsed).toBeInstanceOf(Date);
      expect(result.callsByStatus).toEqual({ '200': 120, '404': 20, '500': 10 });
      expect(result.callsByEndpoint).toEqual({
        '/api/test': 100,
        '/api/qwickbrain': 50,
      });
    });

    it('should handle keys with no usage logs', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await store.getKeyStats('key-unused');

      expect(result.totalCalls).toBe(0);
      expect(result.lastUsed).toBeNull();
      expect(result.callsByStatus).toEqual({});
      expect(result.callsByEndpoint).toEqual({});
    });

    it('should filter stats by date range', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const since = new Date('2025-12-01');
      const until = new Date('2025-12-31');

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await store.getKeyStats('key-123', { since, until });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE key_id = $1 AND timestamp >= $2 AND timestamp <= $3'),
        expect.arrayContaining(['key-123', since, until])
      );
    });
  });

  describe('deleteOlderThan', () => {
    it('should delete logs older than specified date', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      const olderThan = new Date('2025-11-01');

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 150 });

      const deletedCount = await store.deleteOlderThan(olderThan);

      expect(deletedCount).toBe(150);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM'),
        [olderThan]
      );
    });

    it('should return 0 when no logs deleted', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const deletedCount = await store.deleteOlderThan(new Date());

      expect(deletedCount).toBe(0);
    });
  });

  describe('shutdown', () => {
    it('should complete successfully', async () => {
      const store = createPostgresUsageLogStore({
        pool: mockPool,
        autoCreateTables: false,
      });

      await expect(store.shutdown()).resolves.not.toThrow();
    });
  });
});
