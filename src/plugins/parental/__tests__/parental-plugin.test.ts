/**
 * Parental Plugin Tests
 *
 * Unit tests for the parental controls plugin including:
 * - Plugin lifecycle
 * - Guardian settings management
 * - Profile restrictions
 * - Activity logging
 * - PIN verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createParentalPlugin,
  getParentalStore,
  getGuardianSettings,
  updateGuardianSettings,
  verifyPin,
  setPin,
  getRestrictions,
  createRestriction,
  pauseProfile,
  resumeProfile,
  logActivity,
  getActivityLog,
  checkProfileAccess,
} from '../parental-plugin.js';
import type {
  ParentalStore,
  GuardianSettings,
  ProfileRestriction,
  ActivityLog,
  ParentalAdapter,
} from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

describe('Parental Plugin', () => {
  // Mock guardian settings
  const mockSettings: GuardianSettings = {
    id: 'settings-id-123',
    user_id: 'user-123',
    adapter_type: 'kids',
    pin_hash: 'hashed_pin_123',
    pin_failed_attempts: 0,
    pin_locked_until: undefined,
    biometric_enabled: false,
    notifications_enabled: true,
    weekly_report_enabled: true,
    metadata: {},
    updated_at: new Date(),
  };

  // Mock profile restriction
  const mockRestriction: ProfileRestriction = {
    id: 'restriction-id-123',
    profile_id: 'profile-123',
    restriction_type: 'time_limit',
    daily_limit_minutes: 60,
    schedule: {
      monday: { start: '08:00', end: '20:00' },
      tuesday: { start: '08:00', end: '20:00' },
    },
    is_paused: false,
    pause_until: undefined,
    pause_reason: undefined,
    is_active: true,
    metadata: {},
    updated_at: new Date(),
  };

  // Mock activity log
  const mockActivityLog: ActivityLog = {
    id: 'activity-id-123',
    user_id: 'user-123',
    profile_id: 'profile-123',
    device_id: 'device-123',
    adapter_type: 'kids',
    activity_type: 'conversation_start',
    details: { conversation_id: 'conv-123' },
    created_at: new Date(),
  };

  // Mock store factory
  const createMockStore = (): ParentalStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    // Guardian settings
    getSettings: vi.fn().mockResolvedValue(mockSettings),
    createSettings: vi.fn().mockResolvedValue(mockSettings),
    updateSettings: vi.fn().mockResolvedValue(mockSettings),
    verifyPin: vi.fn().mockResolvedValue(true),
    setPin: vi.fn().mockResolvedValue(undefined),
    incrementFailedPinAttempts: vi.fn().mockResolvedValue(1),
    resetFailedPinAttempts: vi.fn().mockResolvedValue(undefined),
    // Profile restrictions
    getRestrictions: vi.fn().mockResolvedValue([mockRestriction]),
    createRestriction: vi.fn().mockResolvedValue(mockRestriction),
    updateRestriction: vi.fn().mockResolvedValue(mockRestriction),
    deleteRestriction: vi.fn().mockResolvedValue(true),
    pauseProfile: vi.fn().mockResolvedValue(undefined),
    resumeProfile: vi.fn().mockResolvedValue(undefined),
    // Activity logging
    logActivity: vi.fn().mockResolvedValue(mockActivityLog),
    getActivityLog: vi.fn().mockResolvedValue([mockActivityLog]),
    // Enforcement
    checkProfileAccess: vi.fn().mockResolvedValue({
      allowed: true,
      reason: undefined,
    }),
    getTimeRemaining: vi.fn().mockResolvedValue(45),
    shutdown: vi.fn().mockResolvedValue(undefined),
  });

  // Mock adapter factory
  const createMockAdapter = (): ParentalAdapter => ({
    name: 'kids',
    activityTypes: ['conversation_start', 'conversation_end', 'content_filtered'],
    defaultDailyLimitMinutes: 60,
    validateRestriction: vi.fn().mockReturnValue({ valid: true }),
    formatActivityDetails: vi.fn().mockImplementation((activity) => activity.details || {}),
    onRestrictionViolation: vi.fn().mockResolvedValue(undefined),
    onDailyLimitReached: vi.fn().mockResolvedValue(undefined),
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

  let mockStore: ParentalStore;
  let mockAdapter: ParentalAdapter;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockAdapter = createMockAdapter();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up
    const store = getParentalStore();
    if (store) {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStop?.();
    }
  });

  describe('createParentalPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.id).toBe('parental');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.name).toBe('Parental');
    });

    it('should create a plugin with version', () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'parental-store',
          type: 'custom',
        })
      );
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getParentalStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getParentalStore', () => {
      it('should return null when plugin not started', () => {
        expect(getParentalStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        expect(getParentalStore()).toBe(mockStore);
      });
    });

    describe('getGuardianSettings', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getGuardianSettings('user-id')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should return guardian settings', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await getGuardianSettings('user-123');
        expect(result).toEqual(mockSettings);
      });
    });

    describe('updateGuardianSettings', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          updateGuardianSettings('user-id', { notifications_enabled: false })
        ).rejects.toThrow('Parental plugin not initialized');
      });

      it('should update settings', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await updateGuardianSettings('user-123', {
          notifications_enabled: false,
        });

        expect(result).toEqual(mockSettings);
        expect(mockStore.updateSettings).toHaveBeenCalled();
      });
    });

    describe('verifyPin', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(verifyPin('user-id', '1234')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should return true for correct PIN', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await verifyPin('user-123', '1234');
        expect(result).toBe(true);
      });

      it('should return false for incorrect PIN', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        (mockStore.verifyPin as any).mockResolvedValue(false);

        const result = await verifyPin('user-123', 'wrong');
        expect(result).toBe(false);
      });
    });

    describe('setPin', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(setPin('user-id', '1234')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should set PIN', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        await setPin('user-123', '1234');

        // PIN is hashed before storage, so just verify setPin was called with userId
        expect(mockStore.setPin).toHaveBeenCalled();
        const callArgs = (mockStore.setPin as any).mock.calls[0];
        expect(callArgs[0]).toBe('user-123');
        // Second argument should be a hash (64 char hex string), not the raw PIN
        expect(callArgs[1]).toMatch(/^[a-f0-9]{64}$/);
      });
    });

    describe('getRestrictions', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getRestrictions('profile-id')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should return profile restrictions', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await getRestrictions('profile-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockRestriction);
      });
    });

    describe('createRestriction', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          createRestriction({
            profile_id: 'profile-id',
            restriction_type: 'time_limit',
            daily_limit_minutes: 60,
          })
        ).rejects.toThrow('Parental plugin not initialized');
      });

      it('should create restriction', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await createRestriction({
          profile_id: 'profile-123',
          restriction_type: 'time_limit',
          daily_limit_minutes: 30,
        });

        expect(result).toEqual(mockRestriction);
        expect(mockStore.createRestriction).toHaveBeenCalled();
      });
    });

    describe('pauseProfile / resumeProfile', () => {
      it('should pause profile', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const pauseUntil = new Date(Date.now() + 60 * 60 * 1000);
        await pauseProfile('profile-123', pauseUntil, 'Dinner time');

        expect(mockStore.pauseProfile).toHaveBeenCalledWith(
          'profile-123',
          pauseUntil,
          'Dinner time'
        );
      });

      it('should resume profile', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        await resumeProfile('profile-123');

        expect(mockStore.resumeProfile).toHaveBeenCalledWith('profile-123');
      });
    });

    describe('logActivity', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          logActivity({
            user_id: 'user-123',
            activity_type: 'conversation_start',
          })
        ).rejects.toThrow('Parental plugin not initialized');
      });

      it('should log activity', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await logActivity({
          user_id: 'user-123',
          profile_id: 'profile-123',
          activity_type: 'conversation_start',
          details: { topic: 'dinosaurs' },
        });

        expect(result).toEqual(mockActivityLog);
        expect(mockStore.logActivity).toHaveBeenCalled();
      });
    });

    describe('getActivityLog', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getActivityLog('user-id')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should return activity log', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await getActivityLog('user-123');

        // getActivityLog returns an array of ActivityLog entries
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockActivityLog);
      });

      it('should filter by profile', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        await getActivityLog('user-123', 50, 'profile-123');

        expect(mockStore.getActivityLog).toHaveBeenCalled();
      });
    });

    describe('checkProfileAccess', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(checkProfileAccess('profile-id')).rejects.toThrow(
          'Parental plugin not initialized'
        );
      });

      it('should return access check result', async () => {
        const plugin = createParentalPlugin({ store: mockStore, adapter: mockAdapter });
        await plugin.onStart({}, mockRegistry);

        const result = await checkProfileAccess('profile-123');

        // Should return an object with access info
        expect(result).toHaveProperty('allowed');
      });
    });
  });
});
