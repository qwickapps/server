/**
 * Devices Plugin Tests
 *
 * Unit tests for the devices plugin including:
 * - Plugin lifecycle (start, stop)
 * - Device registration
 * - Token verification
 * - Helper functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createDevicesPlugin,
  getDeviceStore,
  getDeviceAdapter,
  registerDevice,
  verifyDeviceToken,
  getDeviceById,
  updateDevice,
  deleteDevice,
  regenerateToken,
  listUserDevices,
  deactivateDevice,
  activateDevice,
} from '../devices-plugin.js';
import type {
  DeviceStore,
  DeviceAdapter,
  Device,
  CreateDeviceInput,
} from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

describe('Devices Plugin', () => {
  // Mock device data
  const mockDevice: Device = {
    id: 'device-id-123',
    org_id: 'org-123',
    user_id: 'user-123',
    adapter_type: 'mobile',
    name: 'Test Phone',
    token_prefix: 'mob_1234',
    token_expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    last_seen_at: new Date(),
    last_ip: '192.168.1.1',
    is_active: true,
    metadata: { device_model: 'iPhone 15', os_name: 'iOS', os_version: '17.0' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock store factory
  const createMockStore = (): DeviceStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(mockDevice),
    getByTokenHash: vi.fn().mockResolvedValue(mockDevice),
    create: vi.fn().mockResolvedValue(mockDevice),
    update: vi.fn().mockResolvedValue(mockDevice),
    delete: vi.fn().mockResolvedValue(true),
    search: vi.fn().mockResolvedValue({
      devices: [mockDevice],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    updateLastSeen: vi.fn().mockResolvedValue(undefined),
    updateToken: vi.fn().mockResolvedValue(true),
    cleanupExpired: vi.fn().mockResolvedValue(5),
    shutdown: vi.fn().mockResolvedValue(undefined),
  });

  // Mock adapter factory
  const createMockAdapter = (): DeviceAdapter => ({
    name: 'mobile',
    tokenPrefix: 'mob',
    validateDeviceInput: vi.fn().mockReturnValue({ valid: true }),
    transformForStorage: vi.fn().mockImplementation((input) => input.metadata || {}),
    transformFromStorage: vi.fn().mockImplementation((row) => row),
    onDeviceCreated: vi.fn().mockResolvedValue(undefined),
    onDeviceDeleted: vi.fn().mockResolvedValue(undefined),
    onDeviceVerified: vi.fn().mockResolvedValue(undefined),
  });

  // Mock registry factory
  const createMockRegistry = (): PluginRegistry =>
    ({
      hasPlugin: vi.fn().mockReturnValue(false),
      getPlugin: vi.fn().mockReturnValue(null),
      listPlugins: vi.fn().mockReturnValue([]),
      addRoute: vi.fn(),
      addMenuItem: vi.fn(),
      addPage: vi.fn(),
      addWidget: vi.fn(),
      getRoutes: vi.fn().mockReturnValue([]),
      getMenuItems: vi.fn().mockReturnValue([]),
      getPages: vi.fn().mockReturnValue([]),
      getWidgets: vi.fn().mockReturnValue([]),
      getConfig: vi.fn().mockReturnValue({}),
      setConfig: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockReturnValue(() => {}),
      emit: vi.fn(),
      registerHealthCheck: vi.fn(),
      getApp: vi.fn().mockReturnValue({} as any),
      getRouter: vi.fn().mockReturnValue({} as any),
      getLogger: vi.fn().mockReturnValue({
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      }),
    }) as unknown as PluginRegistry;

  let mockStore: DeviceStore;
  let mockAdapter: DeviceAdapter;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockAdapter = createMockAdapter();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up by stopping the plugin if it was started
    const store = getDeviceStore();
    if (store) {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStop?.();
    }
  });

  describe('createDevicesPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.id).toBe('devices');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.name).toBe('Devices');
    });

    it('should create a plugin with version', () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'devices-store',
          type: 'custom',
        })
      );
    });

    it('should register CRUD routes by default', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);

      // GET /devices, GET /devices/:id, POST /devices, PUT /devices/:id,
      // DELETE /devices/:id, POST /devices/:id/regenerate-token, POST /devices/verify
      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(7);
    });

    it('should use custom API prefix when provided', async () => {
      const plugin = createDevicesPlugin({
        store: mockStore,
        adapter: mockAdapter,
        api: { prefix: '/api/devices' },
      });
      await plugin.onStart({}, mockRegistry);

      const calls = (mockRegistry.addRoute as any).mock.calls;
      expect(calls[0][0].path).toBe('/api/devices');
    });

    it('should skip CRUD routes when disabled', async () => {
      const plugin = createDevicesPlugin({
        store: mockStore,
        adapter: mockAdapter,
        api: { crud: false },
      });
      await plugin.onStart({}, mockRegistry);

      // Only verification endpoint
      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(1);
    });

    it('should skip verify endpoint when disabled', async () => {
      const plugin = createDevicesPlugin({
        store: mockStore,
        adapter: mockAdapter,
        api: { verify: false },
      });
      await plugin.onStart({}, mockRegistry);

      // 6 CRUD routes, no verify
      expect(mockRegistry.addRoute).toHaveBeenCalledTimes(6);
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getDeviceStore()).toBeNull();
    });

    it('should clear adapter reference', async () => {
      const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getDeviceAdapter()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getDeviceStore', () => {
      it('should return null when plugin not started', () => {
        expect(getDeviceStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        expect(getDeviceStore()).toBe(mockStore);
      });
    });

    describe('getDeviceAdapter', () => {
      it('should return null when plugin not started', () => {
        expect(getDeviceAdapter()).toBeNull();
      });

      it('should return adapter when plugin started', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        expect(getDeviceAdapter()).toBe(mockAdapter);
      });
    });

    describe('registerDevice', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          registerDevice({ name: 'Test Device' })
        ).rejects.toThrow('Devices plugin not initialized');
      });

      it('should create device with generated token', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await registerDevice({
          name: 'Test Device',
          user_id: 'user-123',
        });

        expect(result.id).toBe(mockDevice.id);
        expect(result.token).toBeDefined();
        expect(mockStore.create).toHaveBeenCalled();
      });

      it('should throw on validation failure', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockAdapter.validateDeviceInput as any).mockReturnValue({
          valid: false,
          errors: ['Name is required'],
        });

        await expect(
          registerDevice({ name: '' })
        ).rejects.toThrow('Validation failed: Name is required');
      });

      it('should call adapter onDeviceCreated hook', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        await registerDevice({ name: 'Test Device' });

        expect(mockAdapter.onDeviceCreated).toHaveBeenCalledWith(mockDevice);
      });
    });

    describe('verifyDeviceToken', () => {
      it('should return error when plugin not initialized', async () => {
        const result = await verifyDeviceToken('mob_testtoken');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Devices plugin not initialized');
      });

      it('should return error for invalid token format', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await verifyDeviceToken('invalid_format');

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid token format');
      });

      it('should return error when token not found', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getByTokenHash as any).mockResolvedValue(null);

        // Valid format token (43 chars after prefix)
        const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
        const result = await verifyDeviceToken(validToken);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Token not found or expired');
      });

      it('should return error for expired token', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const expiredDevice = {
          ...mockDevice,
          token_expires_at: new Date(Date.now() - 1000), // expired
        };
        (mockStore.getByTokenHash as any).mockResolvedValue(expiredDevice);

        const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
        const result = await verifyDeviceToken(validToken);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Token has expired');
      });

      it('should return error for inactive device', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const inactiveDevice = { ...mockDevice, is_active: false };
        (mockStore.getByTokenHash as any).mockResolvedValue(inactiveDevice);

        const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
        const result = await verifyDeviceToken(validToken);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Device is not active');
      });

      it('should return valid device and update last seen', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
        const result = await verifyDeviceToken(validToken, '10.0.0.1');

        expect(result.valid).toBe(true);
        expect(result.device).toEqual(mockDevice);
        expect(mockStore.updateLastSeen).toHaveBeenCalledWith(mockDevice.id, '10.0.0.1');
      });

      it('should call adapter onDeviceVerified hook', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const validToken = 'mob_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk123456';
        await verifyDeviceToken(validToken, '10.0.0.1');

        expect(mockAdapter.onDeviceVerified).toHaveBeenCalledWith(mockDevice, '10.0.0.1');
      });
    });

    describe('getDeviceById', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getDeviceById('device-id')).rejects.toThrow(
          'Devices plugin not initialized'
        );
      });

      it('should return device when found', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await getDeviceById(mockDevice.id);
        expect(result).toEqual(mockDevice);
      });

      it('should return null when not found', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getById as any).mockResolvedValue(null);

        const result = await getDeviceById('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('updateDevice', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          updateDevice('device-id', { name: 'New Name' })
        ).rejects.toThrow('Devices plugin not initialized');
      });

      it('should update device', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const updated = { ...mockDevice, name: 'Updated Name' };
        (mockStore.update as any).mockResolvedValue(updated);

        const result = await updateDevice(mockDevice.id, { name: 'Updated Name' });

        expect(result?.name).toBe('Updated Name');
        expect(mockStore.update).toHaveBeenCalledWith(mockDevice.id, { name: 'Updated Name' });
      });
    });

    describe('deleteDevice', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(deleteDevice('device-id')).rejects.toThrow(
          'Devices plugin not initialized'
        );
      });

      it('should delete device and call adapter hook', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await deleteDevice(mockDevice.id);

        expect(result).toBe(true);
        expect(mockStore.delete).toHaveBeenCalledWith(mockDevice.id);
        expect(mockAdapter.onDeviceDeleted).toHaveBeenCalledWith(mockDevice);
      });

      it('should return false when device not found', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getById as any).mockResolvedValue(null);

        const result = await deleteDevice('non-existent');

        expect(result).toBe(false);
      });
    });

    describe('regenerateToken', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(regenerateToken('device-id')).rejects.toThrow(
          'Devices plugin not initialized'
        );
      });

      it('should return null when device not found', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getById as any).mockResolvedValue(null);

        const result = await regenerateToken('non-existent');

        expect(result).toBeNull();
      });

      it('should regenerate token and return new token', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await regenerateToken(mockDevice.id, 30);

        expect(result).not.toBeNull();
        expect(result?.token).toMatch(/^mob_/);
        expect(result?.expiresAt).toBeInstanceOf(Date);
        expect(mockStore.updateToken).toHaveBeenCalled();
      });
    });

    describe('listUserDevices', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(listUserDevices('user-id')).rejects.toThrow(
          'Devices plugin not initialized'
        );
      });

      it('should return user devices', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await listUserDevices('user-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockDevice);
        expect(mockStore.search).toHaveBeenCalledWith({ user_id: 'user-123', limit: 100 });
      });
    });

    describe('deactivateDevice / activateDevice', () => {
      it('should deactivate device', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await deactivateDevice(mockDevice.id);

        expect(result).toBe(true);
        expect(mockStore.update).toHaveBeenCalledWith(mockDevice.id, { is_active: false });
      });

      it('should activate device', async () => {
        const plugin = createDevicesPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await activateDevice(mockDevice.id);

        expect(result).toBe(true);
        expect(mockStore.update).toHaveBeenCalledWith(mockDevice.id, { is_active: true });
      });
    });
  });
});
