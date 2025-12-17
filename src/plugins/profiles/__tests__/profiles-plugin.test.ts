/**
 * Profiles Plugin Tests
 *
 * Unit tests for the profiles plugin including:
 * - Plugin lifecycle
 * - Profile CRUD operations
 * - Age group calculation
 * - Default profile management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createProfilesPlugin,
  getProfileStore,
  createProfile,
  getProfileById,
  updateProfile,
  deleteProfile,
  listUserProfiles,
  setDefaultProfile,
} from '../profiles-plugin.js';
import type { ProfileStore, Profile, AgeGroup } from '../types.js';
import type { PluginRegistry } from '../../../core/plugin-registry.js';

describe('Profiles Plugin', () => {
  // Mock profile data
  const mockProfile: Profile = {
    id: 'profile-id-123',
    org_id: 'org-123',
    user_id: 'user-123',
    name: 'Emma',
    avatar: 'robot_pink',
    birth_date: new Date('2018-06-15'),
    age: 6,
    age_group: 'child',
    content_filter_level: 'strict',
    daily_time_limit_minutes: 60,
    allowed_hours_start: '08:00',
    allowed_hours_end: '20:00',
    is_active: true,
    is_default: false,
    metadata: { voice_id: 'en-US-child-1' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Mock store factory
  const createMockStore = (): ProfileStore => ({
    name: 'mock',
    initialize: vi.fn().mockResolvedValue(undefined),
    getById: vi.fn().mockResolvedValue(mockProfile),
    create: vi.fn().mockResolvedValue(mockProfile),
    update: vi.fn().mockResolvedValue(mockProfile),
    delete: vi.fn().mockResolvedValue(true),
    search: vi.fn().mockResolvedValue({
      profiles: [mockProfile],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    listByUser: vi.fn().mockResolvedValue([mockProfile]),
    getDefaultProfile: vi.fn().mockResolvedValue(mockProfile),
    getProfileCount: vi.fn().mockResolvedValue(1),
    getByAgeGroup: vi.fn().mockResolvedValue([mockProfile]),
    setDefaultProfile: vi.fn().mockResolvedValue(true),
    shutdown: vi.fn().mockResolvedValue(undefined),
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

  let mockStore: ProfileStore;
  let mockRegistry: PluginRegistry;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    mockRegistry = createMockRegistry();
  });

  afterEach(async () => {
    // Clean up by stopping the plugin if it was started
    const store = getProfileStore();
    if (store) {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStop?.();
    }
  });

  describe('createProfilesPlugin', () => {
    it('should create a plugin with correct id', () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      expect(plugin.id).toBe('profiles');
    });

    it('should create a plugin with correct name', () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      expect(plugin.name).toBe('Profiles');
    });

    it('should create a plugin with version', () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      expect(plugin.version).toBe('1.0.0');
    });
  });

  describe('onStart', () => {
    it('should initialize store on start', async () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockStore.initialize).toHaveBeenCalled();
    });

    it('should register health check', async () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      expect(mockRegistry.registerHealthCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'profiles-store',
          type: 'custom',
        })
      );
    });

    it('should register CRUD routes by default', async () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);

      // GET /profiles, GET /profiles/:id, POST /profiles, PUT /profiles/:id,
      // DELETE /profiles/:id, POST /profiles/:id/default
      expect(mockRegistry.addRoute).toHaveBeenCalled();
    });
  });

  describe('onStop', () => {
    it('should shutdown store', async () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(mockStore.shutdown).toHaveBeenCalled();
    });

    it('should clear store reference', async () => {
      const plugin = createProfilesPlugin({ store: mockStore });
      await plugin.onStart({}, mockRegistry);
      await plugin.onStop?.();

      expect(getProfileStore()).toBeNull();
    });
  });

  describe('helper functions', () => {
    describe('getProfileStore', () => {
      it('should return null when plugin not started', () => {
        expect(getProfileStore()).toBeNull();
      });

      it('should return store when plugin started', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        expect(getProfileStore()).toBe(mockStore);
      });
    });

    describe('createProfile', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          createProfile({ user_id: 'user-123', name: 'Test' })
        ).rejects.toThrow('Profiles plugin not initialized');
      });

      it('should create profile', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await createProfile({
          user_id: 'user-123',
          name: 'Emma',
          age: 6,
        });

        expect(result.id).toBe(mockProfile.id);
        expect(mockStore.create).toHaveBeenCalled();
      });
    });

    describe('getProfileById', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(getProfileById('profile-id')).rejects.toThrow(
          'Profiles plugin not initialized'
        );
      });

      it('should return profile when found', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await getProfileById(mockProfile.id);
        expect(result).toEqual(mockProfile);
      });

      it('should return null when not found', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        (mockStore.getById as any).mockResolvedValue(null);

        const result = await getProfileById('non-existent');
        expect(result).toBeNull();
      });
    });

    describe('updateProfile', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          updateProfile('profile-id', { name: 'New Name' })
        ).rejects.toThrow('Profiles plugin not initialized');
      });

      it('should update profile', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const updated = { ...mockProfile, name: 'Updated Name' };
        (mockStore.update as any).mockResolvedValue(updated);

        const result = await updateProfile(mockProfile.id, { name: 'Updated Name' });

        expect(result?.name).toBe('Updated Name');
      });
    });

    describe('deleteProfile', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(deleteProfile('profile-id')).rejects.toThrow(
          'Profiles plugin not initialized'
        );
      });

      it('should delete profile', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await deleteProfile(mockProfile.id);

        expect(result).toBe(true);
        expect(mockStore.delete).toHaveBeenCalledWith(mockProfile.id);
      });
    });

    describe('listUserProfiles', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(listUserProfiles('user-id')).rejects.toThrow(
          'Profiles plugin not initialized'
        );
      });

      it('should return user profiles', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await listUserProfiles('user-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(mockProfile);
      });
    });

    describe('setDefaultProfile', () => {
      it('should throw when plugin not initialized', async () => {
        await expect(
          setDefaultProfile('profile-id', 'user-id')
        ).rejects.toThrow('Profiles plugin not initialized');
      });

      it('should set default profile', async () => {
        const plugin = createProfilesPlugin({ store: mockStore });
        await plugin.onStart({}, mockRegistry);

        const result = await setDefaultProfile(mockProfile.id, 'user-123');

        expect(result).toBe(true);
        expect(mockStore.setDefaultProfile).toHaveBeenCalledWith(
          mockProfile.id,
          'user-123'
        );
      });
    });
  });
});
