/**
 * In-memory Entitlement Source for Demo/Testing
 *
 * Implements the EntitlementSource interface with in-memory storage.
 * Pre-populated with demo data for testing and showcase purposes.
 */
export function createInMemoryEntitlementSource() {
    const userEntitlements = new Map();
    const availableEntitlements = [
        { id: '1', name: 'premium', category: 'subscription', description: 'Premium subscription tier' },
        { id: '2', name: 'pro', category: 'subscription', description: 'Professional subscription tier' },
        { id: '3', name: 'enterprise', category: 'subscription', description: 'Enterprise subscription tier' },
        { id: '4', name: 'beta-access', category: 'features', description: 'Access to beta features' },
        { id: '5', name: 'api-access', category: 'features', description: 'API access enabled' },
        { id: '6', name: 'support-priority', category: 'support', description: 'Priority support access' },
    ];
    // Pre-populate some demo data
    userEntitlements.set('demo@example.com', ['premium', 'api-access']);
    userEntitlements.set('pro@example.com', ['pro', 'beta-access', 'api-access']);
    userEntitlements.set('enterprise@example.com', ['enterprise', 'beta-access', 'api-access', 'support-priority']);
    return {
        name: 'in-memory',
        description: 'In-memory entitlement source for demo/testing',
        readonly: false,
        async initialize() {
            console.log('[InMemorySource] Initialized with demo data');
        },
        async getEntitlements(identifier) {
            return userEntitlements.get(identifier.toLowerCase()) || [];
        },
        async getAllAvailable() {
            return availableEntitlements;
        },
        async getUsersWithEntitlement(entitlement) {
            const emails = [];
            userEntitlements.forEach((ents, email) => {
                if (ents.includes(entitlement)) {
                    emails.push(email);
                }
            });
            return { emails, total: emails.length };
        },
        async addEntitlement(identifier, entitlement) {
            const email = identifier.toLowerCase();
            const current = userEntitlements.get(email) || [];
            if (!current.includes(entitlement)) {
                current.push(entitlement);
                userEntitlements.set(email, current);
            }
        },
        async removeEntitlement(identifier, entitlement) {
            const email = identifier.toLowerCase();
            const current = userEntitlements.get(email) || [];
            const index = current.indexOf(entitlement);
            if (index > -1) {
                current.splice(index, 1);
                userEntitlements.set(email, current);
            }
        },
        async shutdown() {
            console.log('[InMemorySource] Shutdown');
        },
    };
}
//# sourceMappingURL=in-memory-source.js.map