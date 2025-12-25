/**
 * PostgreSQL User Store Tests
 *
 * Unit tests for the PostgreSQL user store implementation,
 * focusing on getByIdentifier() and linkIdentifiers() methods.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { postgresUserStore } from '../stores/postgres-store.js';
import type { User, UserIdentifiers } from '../types.js';

// Mock user data
const mockUser: User = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  external_id: 'auth0|abc123',
  provider: 'auth0',
  picture: 'https://example.com/avatar.jpg',
  status: 'active',
  metadata: {
    identifiers: {
      auth0_user_id: 'auth0|abc123',
      wp_user_id: 42,
      keap_contact_id: 12345,
    },
  },
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  last_login_at: new Date('2025-12-13'),
};

// Mock pg pool
const createMockPool = () => {
  const mockQuery = vi.fn();
  return {
    query: mockQuery,
    _mockQuery: mockQuery, // Expose for test assertions
  };
};

describe('PostgreSQL User Store', () => {
  let mockPool: ReturnType<typeof createMockPool>;
  let store: ReturnType<typeof postgresUserStore>;

  beforeEach(() => {
    mockPool = createMockPool();
    store = postgresUserStore({
      pool: mockPool as any,
      autoCreateTables: false, // Skip table creation in tests
    });
  });

  describe('getByIdentifier()', () => {
    it('should throw error when no identifier is provided (UT-001)', async () => {
      const emptyIdentifiers: UserIdentifiers = {};

      await expect(store.getByIdentifier(emptyIdentifiers)).rejects.toThrow(
        'At least one identifier must be provided'
      );

      // Should not make any DB queries
      expect(mockPool._mockQuery).not.toHaveBeenCalled();
    });

    it('should find user by email first (priority 1) (UT-002)', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const identifiers: UserIdentifiers = {
        email: 'test@example.com',
        auth0_user_id: 'auth0|abc123',
        wp_user_id: 42,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(email) = LOWER($1)'),
        ['test@example.com']
      );
    });

    it('should find user by auth0_user_id if email not found (priority 2) (UT-003)', async () => {
      // Email query returns no results
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] });
      // auth0_user_id query in metadata returns user
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const identifiers: UserIdentifiers = {
        email: 'nonexistent@example.com',
        auth0_user_id: 'auth0|abc123',
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(2);
      expect(mockPool._mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("metadata->'identifiers'->>'auth0_user_id'"),
        ['auth0|abc123']
      );
    });

    it('should check legacy external_id for auth0 users (UT-004)', async () => {
      // No email provided, so skip email check
      // auth0_user_id in metadata returns no results
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] });
      // Legacy external_id query returns user
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const identifiers: UserIdentifiers = {
        auth0_user_id: 'auth0|abc123',
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(2);
      expect(mockPool._mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('external_id = $1'),
        ['auth0|abc123']
      );
    });

    it('should find user by wp_user_id (priority 3) (UT-005)', async () => {
      // All higher priority queries return no results
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] }); // email
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] }); // auth0 metadata
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] }); // auth0 external_id
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] }); // wp_user_id

      const identifiers: UserIdentifiers = {
        email: 'nonexistent@example.com',
        auth0_user_id: 'auth0|xyz',
        wp_user_id: 42,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenNthCalledWith(
        4,
        expect.stringContaining("(metadata->'identifiers'->>'wp_user_id')::int"),
        [42]
      );
    });

    it('should find user by keap_contact_id (priority 4) (UT-006)', async () => {
      // All higher priority queries return no results
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [] }); // wp_user_id
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] }); // keap_contact_id

      const identifiers: UserIdentifiers = {
        wp_user_id: 999,
        keap_contact_id: 12345,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("(metadata->'identifiers'->>'keap_contact_id')::int"),
        [12345]
      );
    });

    it('should return null if no user found by any identifier (UT-007)', async () => {
      // All queries return no results
      mockPool._mockQuery.mockResolvedValue({ rows: [] });

      const identifiers: UserIdentifiers = {
        email: 'nonexistent@example.com',
        auth0_user_id: 'auth0|nonexistent',
        wp_user_id: 99999,
        keap_contact_id: 99999,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toBeNull();
    });

    it('should handle wp_user_id of 0 as valid identifier (UT-008)', async () => {
      // Only wp_user_id provided (no email or auth0_user_id)
      // So only 1 query for wp_user_id should be made
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const identifiers: UserIdentifiers = {
        wp_user_id: 0,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("(metadata->'identifiers'->>'wp_user_id')::int"),
        [0]
      );
    });

    it('should handle keap_contact_id of 0 as valid identifier (UT-009)', async () => {
      // Only keap_contact_id provided (no email, auth0_user_id, or wp_user_id)
      // So only 1 query for keap_contact_id should be made
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [mockUser] });

      const identifiers: UserIdentifiers = {
        keap_contact_id: 0,
      };

      const result = await store.getByIdentifier(identifiers);

      expect(result).toEqual(mockUser);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("(metadata->'identifiers'->>'keap_contact_id')::int"),
        [0]
      );
    });
  });

  describe('linkIdentifiers()', () => {
    it('should not make DB query when no identifiers provided (UT-010)', async () => {
      await store.linkIdentifiers('user-123', {});

      expect(mockPool._mockQuery).not.toHaveBeenCalled();
    });

    it('should update metadata with single identifier (UT-011)', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await store.linkIdentifiers('user-123', {
        wp_user_id: 42,
      });

      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('jsonb_set'),
        [JSON.stringify({ wp_user_id: 42 }), 'user-123']
      );
    });

    it('should update metadata with multiple identifiers (UT-012)', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await store.linkIdentifiers('user-123', {
        wp_user_id: 42,
        auth0_user_id: 'auth0|abc123',
        keap_contact_id: 12345,
      });

      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      const [, args] = mockPool._mockQuery.mock.calls[0];
      const identifiersJson = JSON.parse(args[0] as string);

      expect(identifiersJson).toEqual({
        wp_user_id: 42,
        auth0_user_id: 'auth0|abc123',
        keap_contact_id: 12345,
      });
      expect(args[1]).toBe('user-123');
    });

    it('should preserve existing identifiers (uses COALESCE) (UT-013)', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await store.linkIdentifiers('user-123', {
        wp_user_id: 42,
      });

      // Verify the query uses COALESCE to preserve existing values
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("COALESCE(metadata->'identifiers', '{}'::jsonb)"),
        expect.any(Array)
      );
    });

    it('should handle undefined values correctly (UT-014)', async () => {
      mockPool._mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

      await store.linkIdentifiers('user-123', {
        wp_user_id: undefined,
        auth0_user_id: 'auth0|abc123',
        keap_contact_id: undefined,
      });

      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      const [, args] = mockPool._mockQuery.mock.calls[0];
      const identifiersJson = JSON.parse(args[0] as string);

      // Should only include defined values
      expect(identifiersJson).toEqual({
        auth0_user_id: 'auth0|abc123',
      });
    });
  });

  describe('getByIds()', () => {
    it('should return empty array for empty input (UT-015)', async () => {
      const result = await store.getByIds([]);

      expect(result).toEqual([]);
      expect(mockPool._mockQuery).not.toHaveBeenCalled();
    });

    it('should batch query multiple users (UT-016)', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'user-2' }];
      mockPool._mockQuery.mockResolvedValueOnce({ rows: mockUsers });

      const result = await store.getByIds(['user-1', 'user-2']);

      expect(result).toEqual(mockUsers);
      expect(mockPool._mockQuery).toHaveBeenCalledTimes(1);
      expect(mockPool._mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('id = ANY($1)'),
        [['user-1', 'user-2']]
      );
    });
  });
});
