/**
 * Bans Plugin Index
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createBansPlugin, getBanStore, isUserBanned, isEmailBanned, getActiveBan, banUser, unbanUser, listActiveBans, } from './bans-plugin.js';
// Stores
export { postgresBanStore, inMemoryBanStore } from './stores/index.js';
// UI Components are exported from main package index (@qwickapps/server)
// Do NOT export here to avoid loading UI dependencies when importing plugins
//# sourceMappingURL=index.js.map