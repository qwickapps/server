/**
 * Control Panel API Client
 *
 * Communicates with the backend Express API
 */
import { buildClientFromManifest } from './clientBuilder.js';
class ControlPanelApi {
    constructor(baseUrl = '') {
        this.client = null;
        this.clientPromise = null;
        this.baseUrl = baseUrl;
    }
    /**
     * Ensure the API client is initialized.
     * Lazy-loads the client on first use by fetching the manifest.
     */
    async ensureClient() {
        if (this.client) {
            return this.client;
        }
        // If already fetching, wait for that promise
        if (this.clientPromise) {
            return this.clientPromise;
        }
        // Start fetching the client
        this.clientPromise = buildClientFromManifest(this.baseUrl);
        try {
            this.client = await this.clientPromise;
            return this.client;
        }
        catch (error) {
            // Reset promise so we can retry on next call
            this.clientPromise = null;
            throw error;
        }
    }
    /**
     * Set the base URL for API requests.
     * Call this when the control panel is mounted at a custom path.
     * Invalidates the cached client since the manifest will be different.
     */
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        // Invalidate cached client
        this.client = null;
        this.clientPromise = null;
    }
    /**
     * Get the base URL for API requests.
     */
    getBaseUrl() {
        return this.baseUrl;
    }
    /**
     * Internal fetch wrapper that includes credentials for Basic Auth support.
     * Using 'same-origin' ensures the browser sends stored Basic Auth credentials
     * without embedding them in the URL (which would cause fetch to fail).
     */
    async _fetch(url, options) {
        return fetch(url, {
            ...options,
            credentials: 'same-origin',
        });
    }
    /**
     * Generic fetch method for API requests.
     * Automatically prepends the base URL and /api prefix.
     */
    async fetch(path, options) {
        const url = `${this.baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;
        const response = await this._fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || `Request failed: ${response.statusText}`);
        }
        return response.json();
    }
    // ==================
    // Plugin Feature Detection
    // ==================
    /**
     * Detect which user management plugins are available by probing their endpoints
     */
    async detectFeatures() {
        const [users, bans, entitlements] = await Promise.all([
            this.checkEndpoint('/api/users'),
            this.checkEndpoint('/api/bans'),
            this.checkEndpoint('/api/entitlements/available'),
        ]);
        // If entitlements is available, get readonly status
        let entitlementsReadonly = true;
        if (entitlements) {
            try {
                const status = await this.getEntitlementsStatus();
                entitlementsReadonly = status.readonly;
            }
            catch {
                // Default to readonly if we can't get status
            }
        }
        return { users, bans, entitlements, entitlementsReadonly };
    }
    async checkEndpoint(path) {
        try {
            const response = await this._fetch(`${this.baseUrl}${path}`, { method: 'HEAD' });
            // 200, 401, 403 mean the endpoint exists (might need auth)
            // 404 means it doesn't exist
            return response.status !== 404;
        }
        catch {
            return false;
        }
    }
    // ==================
    // Users API
    // ==================
    async getUsers(options = {}) {
        const client = await this.ensureClient();
        return client.users.query(options);
    }
    async getUserById(id) {
        const client = await this.ensureClient();
        return client.users.get(id);
    }
    async inviteUser(request) {
        const client = await this.ensureClient();
        return client.users.invite(request);
    }
    async acceptInvitation(token) {
        const response = await this._fetch(`${this.baseUrl}/api/users/accept-invitation/${encodeURIComponent(token)}`);
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Accept invitation failed: ${response.statusText}`);
        }
        return response.json();
    }
    async getInvitations() {
        const params = new URLSearchParams();
        params.set('status', 'invited');
        params.set('limit', '100');
        const response = await this._fetch(`${this.baseUrl}/api/users?${params}`);
        if (!response.ok) {
            throw new Error(`Invitations request failed: ${response.statusText}`);
        }
        return response.json();
    }
    // ==================
    // Bans API
    // ==================
    async getBans() {
        const client = await this.ensureClient();
        return client.bans.query();
    }
    async banUser(email, reason, expiresAt) {
        // Convert expiresAt datetime to duration in seconds
        let duration;
        if (expiresAt) {
            const expiresDate = new Date(expiresAt);
            const now = new Date();
            duration = Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000));
        }
        const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, duration }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Ban request failed: ${response.statusText}`);
        }
    }
    async unbanUser(email) {
        const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Unban request failed: ${response.statusText}`);
        }
    }
    async checkBan(email) {
        const response = await this._fetch(`${this.baseUrl}/api/bans/email/${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error(`Ban check failed: ${response.statusText}`);
        }
        const data = await response.json();
        // Backend returns { email, isBanned }, transform to expected shape
        return { banned: data.isBanned };
    }
    // ==================
    // Entitlements API
    // ==================
    async getEntitlements(email) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error(`Entitlements request failed: ${response.statusText}`);
        }
        return response.json();
    }
    async refreshEntitlements(email) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/refresh`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`Entitlements refresh failed: ${response.statusText}`);
        }
        return response.json();
    }
    async checkEntitlement(email, entitlement) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/check/${encodeURIComponent(entitlement)}`);
        if (!response.ok) {
            throw new Error(`Entitlement check failed: ${response.statusText}`);
        }
        return response.json();
    }
    async getAvailableEntitlements() {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/available`);
        if (!response.ok) {
            throw new Error(`Available entitlements request failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.entitlements;
    }
    async grantEntitlement(email, entitlement) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entitlement }),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Grant entitlement failed: ${response.statusText}`);
        }
    }
    async revokeEntitlement(email, entitlement) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/${encodeURIComponent(email)}/${encodeURIComponent(entitlement)}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(`Revoke entitlement failed: ${response.statusText}`);
        }
    }
    async invalidateEntitlementCache(email) {
        const response = await this._fetch(`${this.baseUrl}/api/entitlements/cache/${encodeURIComponent(email)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Cache invalidation failed: ${response.statusText}`);
        }
    }
    async getEntitlementsStatus() {
        const client = await this.ensureClient();
        return client.entitlements.query();
    }
    // ==================
    // Health API
    // ==================
    async getHealth() {
        const client = await this.ensureClient();
        return client.core.health();
    }
    async getInfo() {
        const client = await this.ensureClient();
        return client.core.info();
    }
    async getDiagnostics() {
        const client = await this.ensureClient();
        return client.core.diagnostics();
    }
    async getConfig() {
        const client = await this.ensureClient();
        return client.config.query();
    }
    async getLogs(options = {}) {
        const client = await this.ensureClient();
        return client.logs.query(options);
    }
    async getLogSources() {
        const client = await this.ensureClient();
        return client.logs.sources();
    }
    // ==================
    // Plugins API
    // ==================
    async getPlugins() {
        const client = await this.ensureClient();
        return client.core.plugins();
    }
    async getPluginDetail(id) {
        const response = await this._fetch(`${this.baseUrl}/api/plugins/${encodeURIComponent(id)}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Plugin not found: ${id}`);
            }
            throw new Error(`Plugin detail request failed: ${response.statusText}`);
        }
        return response.json();
    }
    // ==================
    // UI Contributions API
    // ==================
    async getUiContributions() {
        const client = await this.ensureClient();
        return client.core.uiContributions();
    }
    // ==================
    // Auth Config API
    // ==================
    async getAuthConfigStatus() {
        try {
            const client = await this.ensureClient();
            return await client.auth.status();
        }
        catch (error) {
            // Return disabled state if endpoint not available
            if (error instanceof Error && error.message.includes('404')) {
                return { state: 'disabled', adapter: null };
            }
            throw error;
        }
    }
    async getAuthConfig() {
        try {
            const client = await this.ensureClient();
            return await client.auth.config();
        }
        catch (error) {
            // Return disabled state if endpoint not available
            if (error instanceof Error && error.message.includes('404')) {
                return { state: 'disabled', adapter: null };
            }
            throw error;
        }
    }
    /**
     * Update auth configuration (save to database for hot-reload)
     */
    async updateAuthConfig(request) {
        const client = await this.ensureClient();
        return client.auth.update(request);
    }
    /**
     * Delete auth configuration (revert to environment variables)
     */
    async deleteAuthConfig() {
        const response = await this._fetch(`${this.baseUrl}/api/auth/config`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Auth config delete failed: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Test auth provider connection without saving
     */
    async testAuthProvider(request) {
        const client = await this.ensureClient();
        return client.auth.test(request);
    }
    /**
     * Test current auth provider connection (uses existing env/runtime config)
     */
    async testCurrentAuthProvider() {
        const response = await this._fetch(`${this.baseUrl}/api/auth/test-current`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Provider test failed: ${response.statusText}`);
        }
        return response.json();
    }
    // ==================
    // Rate Limit Config API
    // ==================
    async getRateLimitConfig() {
        const client = await this.ensureClient();
        return client.rateLimit.config();
    }
    async updateRateLimitConfig(updates) {
        const client = await this.ensureClient();
        return client.rateLimit.update(updates);
    }
    // ==================
    // Notifications API
    // ==================
    async getNotificationsStats() {
        const client = await this.ensureClient();
        return client.notifications.stats();
    }
    async getNotificationsClients() {
        const client = await this.ensureClient();
        return client.notifications.clients();
    }
    async disconnectNotificationsClient(clientId) {
        const response = await this._fetch(`${this.baseUrl}/api/notifications/clients/${encodeURIComponent(clientId)}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Disconnect client failed: ${response.statusText}`);
        }
        return response.json();
    }
    async forceNotificationsReconnect() {
        const response = await this._fetch(`${this.baseUrl}/api/notifications/reconnect`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Force reconnect failed: ${response.statusText}`);
        }
        return response.json();
    }
    // ==================
    // API Keys API
    // ==================
    async getApiKeys() {
        const client = await this.ensureClient();
        return client.apiKeys.query();
    }
    async createApiKey(request) {
        const client = await this.ensureClient();
        return client.apiKeys.create(request);
    }
    async getApiKey(keyId) {
        const client = await this.ensureClient();
        return client.apiKeys.get(keyId);
    }
    async updateApiKey(keyId, updates) {
        const client = await this.ensureClient();
        return client.apiKeys.update(keyId, updates);
    }
    async deleteApiKey(keyId) {
        const client = await this.ensureClient();
        return client.apiKeys.delete(keyId);
    }
    // Phase 2: Scope Management
    async getAvailableScopes() {
        const client = await this.ensureClient();
        return client.apiKeys.scopes();
    }
    // Phase 2: Usage Tracking
    async getKeyUsage(keyId, _params) {
        const client = await this.ensureClient();
        // Note: _params are ignored in auto-generated client - API expects them as query params
        // TODO: Verify if usage endpoint accepts query params and update client if needed
        return client.apiKeys.usage(keyId);
    }
    // ============================================================================
    // Preferences API
    // ============================================================================
    async getPreferences() {
        const client = await this.ensureClient();
        return client.preferences.query();
    }
    async updatePreferences(preferences) {
        const url = `${this.baseUrl}/api/preferences`;
        const response = await this._fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preferences),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(error.error || `Failed to update preferences: ${response.statusText}`);
        }
        return response.json();
    }
    async deletePreferences() {
        const url = `${this.baseUrl}/api/preferences`;
        const response = await this._fetch(url, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete preferences: ${response.statusText}`);
        }
    }
}
export const api = new ControlPanelApi();
//# sourceMappingURL=controlPanelApi.js.map