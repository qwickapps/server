/**
 * Users Plugin Index
 *
 * User identity management plugin.
 * For ban management, use the separate Bans Plugin which depends on this plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createUsersPlugin, getUserStore, getUserById, getUsersByIds, getUserByEmail, getUserByIdentifier, linkUserIdentifiers, findOrCreateUser, buildUserInfo, } from './users-plugin.js';
// Stores
export { postgresUserStore, inMemoryUserStore } from './stores/index.js';
//# sourceMappingURL=index.js.map