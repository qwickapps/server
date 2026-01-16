/**
 * In-memory Ban Store for Demo/Testing
 *
 * Implements the BanStore interface with in-memory storage.
 * Supports temporary and permanent bans with expiration.
 */

export function createInMemoryBanStore() {
  const bans = new Map<string, any>();
  let idCounter = 1;

  function isActiveBan(ban: any): boolean {
    if (!ban.is_active) return false;
    if (ban.expires_at && new Date(ban.expires_at) <= new Date()) return false;
    return true;
  }

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryBanStore] Initialized');
    },

    async isBanned(userId: string) {
      for (const ban of bans.values()) {
        if (ban.user_id === userId && isActiveBan(ban)) {
          return true;
        }
      }
      return false;
    },

    async getActiveBan(userId: string) {
      for (const ban of bans.values()) {
        if (ban.user_id === userId && isActiveBan(ban)) {
          return ban;
        }
      }
      return null;
    },

    async createBan(input: any) {
      const id = String(idCounter++);
      const now = new Date();
      const ban = {
        id,
        user_id: input.user_id,
        reason: input.reason,
        banned_by: input.banned_by || 'system',
        banned_at: now,
        expires_at: input.duration ? new Date(now.getTime() + input.duration * 1000) : null,
        is_active: true,
        metadata: input.metadata || {},
      };
      bans.set(id, ban);
      return ban;
    },

    async removeBan(input: any) {
      for (const ban of bans.values()) {
        if (ban.user_id === input.user_id && isActiveBan(ban)) {
          ban.is_active = false;
          ban.removed_at = new Date();
          ban.removed_by = input.removed_by;
          return true;
        }
      }
      return false;
    },

    async listBans(userId: string) {
      const userBans: any[] = [];
      for (const ban of bans.values()) {
        if (ban.user_id === userId) {
          userBans.push(ban);
        }
      }
      return userBans;
    },

    async listActiveBans(options: { limit?: number; offset?: number } = {}) {
      const activeBans = Array.from(bans.values()).filter(isActiveBan);
      const total = activeBans.length;
      const offset = options.offset || 0;
      const limit = options.limit || 50;
      const result = activeBans.slice(offset, offset + limit);
      return { bans: result, total };
    },

    async cleanupExpiredBans() {
      let cleaned = 0;
      for (const ban of bans.values()) {
        if (ban.is_active && ban.expires_at && new Date(ban.expires_at) <= new Date()) {
          ban.is_active = false;
          cleaned++;
        }
      }
      return cleaned;
    },

    async shutdown() {
      console.log('[InMemoryBanStore] Shutdown');
    },
  };
}
