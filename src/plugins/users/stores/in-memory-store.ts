/**
 * In-memory User Store for Demo/Testing
 *
 * Implements the UserStore interface with in-memory storage.
 * Pre-populated with demo users for testing and showcase purposes.
 */

export function createInMemoryUserStore() {
  const users = new Map<string, any>();
  let idCounter = 1;

  // Pre-populate demo users
  const demoUsers = [
    { email: 'demo@example.com', name: 'Demo User' },
    { email: 'pro@example.com', name: 'Pro User' },
    { email: 'enterprise@example.com', name: 'Enterprise User' },
    { email: 'basic@example.com', name: 'Basic User' },
  ];

  demoUsers.forEach((u) => {
    const id = String(idCounter++);
    users.set(id, {
      id,
      email: u.email,
      name: u.name,
      created_at: new Date(),
      updated_at: new Date(),
    });
  });

  return {
    name: 'in-memory',

    async initialize() {
      console.log('[InMemoryUserStore] Initialized with demo users');
    },

    async getById(id: string) {
      return users.get(id) || null;
    },

    async getByEmail(email: string) {
      for (const user of users.values()) {
        if (user.email === email.toLowerCase()) {
          return user;
        }
      }
      return null;
    },

    async getByExternalId(externalId: string, provider: string) {
      for (const user of users.values()) {
        if (user.external_id === externalId && user.provider === provider) {
          return user;
        }
      }
      return null;
    },

    async create(input: any) {
      const id = String(idCounter++);
      const user = {
        id,
        email: input.email.toLowerCase(),
        name: input.name || null,
        external_id: input.external_id,
        provider: input.provider,
        picture: input.picture,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: input.metadata || {},
      };
      users.set(id, user);
      return user;
    },

    async update(id: string, input: any) {
      const user = users.get(id);
      if (!user) return null;
      Object.assign(user, input, { updated_at: new Date() });
      return user;
    },

    async delete(id: string) {
      return users.delete(id);
    },

    async search(params: any = {}) {
      let result = Array.from(users.values());

      if (params.query) {
        const query = params.query.toLowerCase();
        result = result.filter(
          (u) =>
            u.email.toLowerCase().includes(query) ||
            (u.name && u.name.toLowerCase().includes(query))
        );
      }

      if (params.provider) {
        result = result.filter((u) => u.provider === params.provider);
      }

      const sortBy = params.sortBy || 'created_at';
      const sortOrder = params.sortOrder || 'desc';
      result.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      const total = result.length;
      const page = params.page || 1;
      const limit = params.limit || 20;
      const offset = (page - 1) * limit;
      result = result.slice(offset, offset + limit);

      return {
        users: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    },

    async updateLastLogin(id: string) {
      const user = users.get(id);
      if (user) {
        user.last_login_at = new Date();
      }
    },

    async shutdown() {
      console.log('[InMemoryUserStore] Shutdown');
    },
  };
}
