/**
 * Users Plugin Index
 *
 * User identity management plugin.
 * For ban management, use the separate Bans Plugin which depends on this plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createUsersPlugin,
  getUserStore,
  getUserById,
  getUsersByIds,
  getUserByEmail,
  getUserByIdentifier,
  linkUserIdentifiers,
  findOrCreateUser,
  buildUserInfo,
} from './users-plugin.js';

// Types
export type {
  UsersPluginConfig,
  UserStore,
  User,
  CreateUserInput,
  UpdateUserInput,
  UserSearchParams,
  UserListResponse,
  PostgresUserStoreConfig,
  UserSyncConfig,
  UsersApiConfig,
  UsersUiConfig,
  UserInfo,
  UserSyncInput,
  UserIdentifiers,
  StoredIdentifiers,
  UserProfileInput,
} from './types.js';

// Stores
export { postgresUserStore } from './stores/index.js';
