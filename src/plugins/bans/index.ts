/**
 * Bans Plugin Index
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Main plugin
export {
  createBansPlugin,
  getBanStore,
  isUserBanned,
  isEmailBanned,
  getActiveBan,
  banUser,
  unbanUser,
  listActiveBans,
} from './bans-plugin.js';

// Types
export type {
  BansPluginConfig,
  BanStore,
  Ban,
  CreateBanInput,
  RemoveBanInput,
  BanCallbacks,
  PostgresBanStoreConfig,
} from './types.js';

// Stores
export { postgresBanStore } from './stores/index.js';
