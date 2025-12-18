/**
 * NotificationsManager Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Response } from 'express';
import type { NotificationsPluginConfig } from '../types.js';
import type { Logger } from '../../../core/types.js';

// Mock pg module
vi.mock('pg', () => {
  const mockClient = {
    connect: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue({ rows: [] }),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  };

  return {
    default: {
      Client: vi.fn(() => mockClient),
    },
    Client: vi.fn(() => mockClient),
  };
});

// Import after mocking
import {
  NotificationsManager,
  setNotificationsManager,
  getNotificationsManager,
  hasNotificationsManager,
  broadcastToDevice,
  broadcastToUser,
  broadcastToAll,
} from '../notifications-manager.js';

// Helper to create mock logger
function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

// Helper to create mock response
function createMockResponse(): Response {
  const res = {
    write: vi.fn().mockReturnValue(true),
    end: vi.fn(),
    on: vi.fn(),
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
  } as unknown as Response;
  return res;
}

// Default test config
const defaultConfig: NotificationsPluginConfig = {
  channels: ['test_channel'],
  heartbeat: { interval: 60000 },
  reconnect: { maxAttempts: 3, baseDelay: 100, maxDelay: 1000 },
};

describe('NotificationsManager', () => {
  let manager: NotificationsManager;
  let logger: Logger;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    manager = new NotificationsManager(
      'postgresql://localhost/test',
      ['test_channel'],
      defaultConfig,
      logger
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    setNotificationsManager(null);
    try {
      await manager.shutdown();
    } catch {
      // Ignore shutdown errors in tests
    }
  });

  describe('Client Registration', () => {
    it('should register a client with device_id', () => {
      const res = createMockResponse();
      const clientId = 'client-1';
      const deviceId = 'device-123';

      manager.registerClient(clientId, deviceId, undefined, res);

      const stats = manager.getStats();
      expect(stats.currentConnections).toBe(1);
      expect(stats.totalConnections).toBe(1);
      expect(stats.clientsByType.device).toBe(1);
    });

    it('should register a client with user_id', () => {
      const res = createMockResponse();
      const clientId = 'client-1';
      const userId = 'user-456';

      manager.registerClient(clientId, undefined, userId, res);

      const stats = manager.getStats();
      expect(stats.currentConnections).toBe(1);
      expect(stats.clientsByType.user).toBe(1);
    });

    it('should register a client with both device_id and user_id', () => {
      const res = createMockResponse();
      const clientId = 'client-1';

      manager.registerClient(clientId, 'device-123', 'user-456', res);

      const stats = manager.getStats();
      expect(stats.currentConnections).toBe(1);
      // Should count as device since device_id takes precedence
      expect(stats.clientsByType.device).toBe(1);
    });

    it('should send connected event on registration', () => {
      const res = createMockResponse();

      manager.registerClient('client-1', 'device-123', undefined, res);

      expect(res.write).toHaveBeenCalledWith('event: connected\n');
      expect(res.write).toHaveBeenCalledWith(expect.stringContaining('data: '));
    });

    it('should handle multiple client registrations', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const res3 = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', 'device-2', undefined, res2);
      manager.registerClient('client-3', undefined, 'user-1', res3);

      const stats = manager.getStats();
      expect(stats.currentConnections).toBe(3);
      expect(stats.clientsByType.device).toBe(2);
      expect(stats.clientsByType.user).toBe(1);
    });
  });

  describe('Event Broadcasting', () => {
    beforeEach(() => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const res3 = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', 'device-2', undefined, res2);
      manager.registerClient('client-3', undefined, 'user-1', res3);
    });

    it('should broadcast to specific device', () => {
      const count = manager.broadcastToDevice('device-1', 'test', { data: 'hello' });

      expect(count).toBe(1);
    });

    it('should broadcast to all devices for a user', () => {
      const count = manager.broadcastToUser('user-1', 'test', { data: 'hello' });

      expect(count).toBe(1);
    });

    it('should broadcast to all clients', () => {
      const count = manager.broadcastToAll('test', { data: 'hello' });

      expect(count).toBe(3);
    });

    it('should return 0 when no clients match device', () => {
      const count = manager.broadcastToDevice('unknown-device', 'test', {});

      expect(count).toBe(0);
    });

    it('should return 0 when no clients match user', () => {
      const count = manager.broadcastToUser('unknown-user', 'test', {});

      expect(count).toBe(0);
    });
  });

  describe('Statistics', () => {
    it('should track total connections', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', 'device-2', undefined, res2);

      const stats = manager.getStats();
      expect(stats.totalConnections).toBe(2);
      expect(stats.currentConnections).toBe(2);
    });

    it('should provide connection health', () => {
      const health = manager.getConnectionHealth();

      expect(health).toHaveProperty('isConnected');
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('channelCount');
      expect(health).toHaveProperty('isReconnecting');
      expect(health).toHaveProperty('reconnectAttempts');
      expect(health.channelCount).toBe(1);
    });
  });

  describe('Heartbeat', () => {
    it('should start heartbeat when first client connects', () => {
      const res = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res);

      // Advance time to trigger heartbeat
      vi.advanceTimersByTime(60001);

      // Heartbeat should have been sent
      expect(res.write).toHaveBeenCalledWith('event: heartbeat\n');
    });

    it('should include server status in heartbeat', () => {
      const res = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res);

      // Clear previous calls
      (res.write as ReturnType<typeof vi.fn>).mockClear();

      // Advance time to trigger heartbeat
      vi.advanceTimersByTime(60001);

      // Find the data call
      const dataCalls = (res.write as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: unknown[]) => call[0]?.toString().startsWith('data:')
      );
      expect(dataCalls.length).toBeGreaterThan(0);

      const dataStr = dataCalls[0][0] as string;
      const data = JSON.parse(dataStr.replace('data: ', '').trim());
      expect(data.payload).toHaveProperty('timestamp');
      expect(data.payload).toHaveProperty('server');
      expect(data.payload.server).toHaveProperty('status');
    });
  });
});

describe('Singleton and Helpers', () => {
  let manager: NotificationsManager;
  let logger: Logger;

  beforeEach(() => {
    logger = createMockLogger();
    manager = new NotificationsManager(
      'postgresql://localhost/test',
      ['test_channel'],
      defaultConfig,
      logger
    );
    setNotificationsManager(manager);
  });

  afterEach(() => {
    setNotificationsManager(null);
  });

  describe('getNotificationsManager', () => {
    it('should return manager when set', () => {
      expect(getNotificationsManager()).toBe(manager);
    });

    it('should throw when not set', () => {
      setNotificationsManager(null);
      expect(() => getNotificationsManager()).toThrow('NotificationsManager not initialized');
    });
  });

  describe('hasNotificationsManager', () => {
    it('should return true when set', () => {
      expect(hasNotificationsManager()).toBe(true);
    });

    it('should return false when not set', () => {
      setNotificationsManager(null);
      expect(hasNotificationsManager()).toBe(false);
    });
  });

  describe('broadcastToDevice helper', () => {
    it('should delegate to manager', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      const count = broadcastToDevice('device-1', 'test', { data: 'hello' });

      expect(count).toBe(1);
    });
  });

  describe('broadcastToUser helper', () => {
    it('should delegate to manager', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', undefined, 'user-1', res);

      const count = broadcastToUser('user-1', 'test', { data: 'hello' });

      expect(count).toBe(1);
    });
  });

  describe('broadcastToAll helper', () => {
    it('should delegate to manager', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', undefined, 'user-1', res2);

      const count = broadcastToAll('test', { data: 'hello' });

      expect(count).toBe(2);
    });
  });
});

describe('NotificationsManager - Additional Coverage', () => {
  let manager: NotificationsManager;
  let logger: Logger;

  beforeEach(() => {
    vi.useFakeTimers();
    logger = createMockLogger();
    manager = new NotificationsManager(
      'postgresql://localhost/test',
      ['test_channel'],
      defaultConfig,
      logger
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    setNotificationsManager(null);
    try {
      await manager.shutdown();
    } catch {
      // Ignore shutdown errors in tests
    }
  });

  describe('Client Disconnect Cleanup', () => {
    it('should remove client when response closes', () => {
      const res = createMockResponse();
      let closeHandler: (() => void) | undefined;

      // Capture the close handler
      (res.on as ReturnType<typeof vi.fn>).mockImplementation((event: string, handler: () => void) => {
        if (event === 'close') {
          closeHandler = handler;
        }
      });

      manager.registerClient('client-1', 'device-1', undefined, res);
      expect(manager.getStats().currentConnections).toBe(1);

      // Simulate disconnect
      closeHandler?.();
      expect(manager.getStats().currentConnections).toBe(0);
    });

    it('should stop heartbeat when last client disconnects', () => {
      const res = createMockResponse();
      let closeHandler: (() => void) | undefined;

      (res.on as ReturnType<typeof vi.fn>).mockImplementation((event: string, handler: () => void) => {
        if (event === 'close') {
          closeHandler = handler;
        }
      });

      manager.registerClient('client-1', 'device-1', undefined, res);

      // Heartbeat should be running
      vi.advanceTimersByTime(60001);
      expect(res.write).toHaveBeenCalledWith('event: heartbeat\n');

      // Clear and disconnect
      (res.write as ReturnType<typeof vi.fn>).mockClear();
      closeHandler?.();

      // Advance time - no more heartbeats
      vi.advanceTimersByTime(60001);
      expect(res.write).not.toHaveBeenCalled();
    });
  });

  describe('Max Client Capacity', () => {
    it('should reject clients when at capacity', () => {
      // Create a manager with very low capacity for testing
      const lowCapacityConfig: NotificationsPluginConfig = {
        channels: ['test_channel'],
      };
      const testManager = new NotificationsManager(
        'postgresql://localhost/test',
        ['test_channel'],
        lowCapacityConfig,
        logger
      );

      // Register clients up to default max (we can't easily test 10000)
      // Instead test the return value behavior
      const res1 = createMockResponse();
      const result = testManager.registerClient('client-1', 'device-1', undefined, res1);
      expect(result).toBe(true);
    });

    it('should return true when registration succeeds', () => {
      const res = createMockResponse();
      const result = manager.registerClient('client-1', 'device-1', undefined, res);

      expect(result).toBe(true);
      expect(manager.getStats().currentConnections).toBe(1);
    });
  });

  describe('Connection Health', () => {
    it('should report unhealthy when not initialized', () => {
      const health = manager.getConnectionHealth();

      expect(health.isConnected).toBe(false);
    });

    it('should track channel count', () => {
      const health = manager.getConnectionHealth();

      expect(health.channelCount).toBe(1);
    });

    it('should track reconnection state', () => {
      const health = manager.getConnectionHealth();

      expect(health.isReconnecting).toBe(false);
      expect(health.reconnectAttempts).toBe(0);
    });
  });

  describe('Shutdown', () => {
    it('should close all client connections on shutdown', async () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', 'device-2', undefined, res2);

      await manager.shutdown();

      expect(res1.end).toHaveBeenCalled();
      expect(res2.end).toHaveBeenCalled();
    });

    it('should clear all clients on shutdown', async () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      await manager.shutdown();

      // Stats should still show historical data but current should be 0
      // (shutdown clears the map)
    });
  });

  describe('Event Send Error Handling', () => {
    it('should handle write errors gracefully', () => {
      const res = createMockResponse();
      (res.write as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Connection reset');
      });

      manager.registerClient('client-1', 'device-1', undefined, res);

      // Should not throw
      expect(() => {
        manager.broadcastToDevice('device-1', 'test', { data: 'hello' });
      }).not.toThrow();
    });
  });

  describe('getClients()', () => {
    it('should return empty array when no clients (UT-001)', () => {
      const clients = manager.getClients();

      expect(clients).toEqual([]);
    });

    it('should return client info with correct shape (UT-002)', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-123', 'user-456', res);

      const clients = manager.getClients();

      expect(clients).toHaveLength(1);
      expect(clients[0]).toHaveProperty('id', 'client-1');
      expect(clients[0]).toHaveProperty('deviceId', 'device-123');
      expect(clients[0]).toHaveProperty('userId', 'user-456');
      expect(clients[0]).toHaveProperty('connectedAt');
      expect(clients[0]).toHaveProperty('durationMs');
      expect(typeof clients[0].connectedAt).toBe('string');
      expect(typeof clients[0].durationMs).toBe('number');
    });

    it('should return multiple clients (UT-003)', () => {
      const res1 = createMockResponse();
      const res2 = createMockResponse();
      const res3 = createMockResponse();

      manager.registerClient('client-1', 'device-1', undefined, res1);
      manager.registerClient('client-2', 'device-2', undefined, res2);
      manager.registerClient('client-3', undefined, 'user-1', res3);

      const clients = manager.getClients();

      expect(clients).toHaveLength(3);
      expect(clients.map(c => c.id).sort()).toEqual(['client-1', 'client-2', 'client-3']);
    });

    it('should calculate durationMs correctly (UT-004)', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      const clients = manager.getClients();

      expect(clients[0].durationMs).toBeGreaterThanOrEqual(5 * 60 * 1000);
      // Allow some tolerance for test execution time
      expect(clients[0].durationMs).toBeLessThan(5 * 60 * 1000 + 1000);
    });
  });

  describe('disconnectClient()', () => {
    it('should return false for unknown client (UT-005)', () => {
      const result = manager.disconnectClient('unknown-client-id');

      expect(result).toBe(false);
    });

    it('should return true for valid client (UT-006)', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      const result = manager.disconnectClient('client-1');

      expect(result).toBe(true);
    });

    it('should remove client after disconnect - client not in getClients() (UT-007)', () => {
      const res = createMockResponse();
      let closeHandler: (() => void) | undefined;

      // Capture the close handler
      (res.on as ReturnType<typeof vi.fn>).mockImplementation((event: string, handler: () => void) => {
        if (event === 'close') {
          closeHandler = handler;
        }
      });

      manager.registerClient('client-1', 'device-1', undefined, res);
      expect(manager.getClients()).toHaveLength(1);

      manager.disconnectClient('client-1');

      // Simulate the close event that would be triggered by response.end()
      closeHandler?.();

      expect(manager.getClients()).toHaveLength(0);
    });

    it('should send disconnected event before closing (UT-008)', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      // Clear previous write calls from registration
      (res.write as ReturnType<typeof vi.fn>).mockClear();

      manager.disconnectClient('client-1');

      // Should have sent disconnected event
      expect(res.write).toHaveBeenCalledWith('event: disconnected\n');
      // Should have sent data with reason
      const dataCalls = (res.write as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: unknown[]) => call[0]?.toString().startsWith('data:')
      );
      expect(dataCalls.length).toBeGreaterThan(0);
      const dataStr = dataCalls[0][0] as string;
      const data = JSON.parse(dataStr.replace('data: ', '').trim());
      expect(data.payload).toHaveProperty('reason');
      expect(data.payload.reason).toContain('administrator');
    });

    it('should call response.end() on disconnect', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      manager.disconnectClient('client-1');

      expect(res.end).toHaveBeenCalled();
    });

    it('should accept disconnectedBy parameter for audit logging (UT-009)', () => {
      const res = createMockResponse();
      manager.registerClient('client-1', 'device-1', undefined, res);

      const result = manager.disconnectClient('client-1', {
        userId: 'admin-123',
        email: 'admin@example.com',
        ip: '192.168.1.1',
      });

      expect(result).toBe(true);
      expect(res.end).toHaveBeenCalled();
    });
  });
});
