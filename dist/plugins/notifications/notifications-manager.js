/**
 * Notifications Manager
 *
 * Core service that manages PostgreSQL LISTEN/NOTIFY and SSE client connections.
 * Provides realtime event routing from database to connected clients.
 *
 * Architecture:
 * - Single dedicated PostgreSQL connection for LISTEN (not from pool)
 * - In-memory Map of SSE clients
 * - Event routing based on device_id/user_id filters
 * - Automatic reconnection with exponential backoff
 * - Heartbeat system for connection health
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import pg from 'pg';
const { Client } = pg;
// Default configuration values
const DEFAULT_HEARTBEAT_INTERVAL = 60000; // 60 seconds
const DEFAULT_RECONNECT_MAX_ATTEMPTS = 10;
const DEFAULT_RECONNECT_BASE_DELAY = 1000; // 1 second
const DEFAULT_RECONNECT_MAX_DELAY = 60000; // 60 seconds
const CONNECTION_HEALTH_TIMEOUT = 30 * 60 * 1000; // 30 minutes (increased for low-traffic systems)
const DEFAULT_MAX_CLIENTS = 10000; // Maximum concurrent SSE clients
/**
 * NotificationsManager - Singleton service for realtime notifications
 */
export class NotificationsManager {
    constructor(connectionString, channels, config, logger) {
        this.client = null;
        this.clients = new Map();
        // Connection state
        this.initialized = false;
        this.isReconnecting = false;
        this.isShuttingDown = false;
        this.reconnectAttempts = 0;
        // Statistics
        this.stats = {
            totalConnections: 0,
            currentConnections: 0,
            eventsProcessed: 0,
            eventsRouted: 0,
            eventsParseFailed: 0,
            eventsDroppedNoClients: 0,
            reconnectionAttempts: 0,
            lastReconnectionAt: undefined,
        };
        // Health tracking
        this.lastEventReceivedAt = Date.now();
        this.connectionString = connectionString;
        this.channels = channels;
        this.logger = logger;
        // Apply configuration with defaults
        this.heartbeatInterval = config.heartbeat?.interval ?? DEFAULT_HEARTBEAT_INTERVAL;
        this.heartbeatIncludeStatus = config.heartbeat?.includeStatus !== false;
        this.reconnectMaxAttempts = config.reconnect?.maxAttempts ?? DEFAULT_RECONNECT_MAX_ATTEMPTS;
        this.reconnectBaseDelay = config.reconnect?.baseDelay ?? DEFAULT_RECONNECT_BASE_DELAY;
        this.reconnectMaxDelay = config.reconnect?.maxDelay ?? DEFAULT_RECONNECT_MAX_DELAY;
        this.maxClients = DEFAULT_MAX_CLIENTS;
    }
    /**
     * Helper to safely truncate IDs for logging
     */
    truncateId(id) {
        return id ? id.substring(0, 8) : 'unknown';
    }
    /**
     * Initialize the manager - connect to PostgreSQL and start LISTEN
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        await this.connect();
    }
    /**
     * Connect to PostgreSQL and set up LISTEN
     */
    async connect() {
        if (this.isShuttingDown) {
            this.logger.debug('Skip connection attempt - shutting down');
            return;
        }
        try {
            // Clean up existing connection if any
            await this.cleanupConnection();
            // Create new client
            this.client = new Client({
                connectionString: this.connectionString,
            });
            // Set up error handler before connecting
            this.client.on('error', (err) => {
                this.logger.error('PostgreSQL LISTEN connection error', { error: err.message });
                this.handleConnectionError();
            });
            // Set up notification handler
            this.client.on('notification', (msg) => {
                this.handleNotification(msg);
            });
            // Connect
            await this.client.connect();
            // Subscribe to channels
            for (const channel of this.channels) {
                await this.client.query(`LISTEN ${this.sanitizeChannelName(channel)}`);
                this.logger.debug(`Listening on channel: ${channel}`);
            }
            // Success
            this.initialized = true;
            this.reconnectAttempts = 0;
            this.isReconnecting = false;
            const clientMsg = this.clients.size > 0
                ? ` - ${this.clients.size} client${this.clients.size !== 1 ? 's' : ''} connected`
                : '';
            this.logger.info(`Notifications service ready (${this.channels.length} channels)${clientMsg}`);
        }
        catch (error) {
            this.initialized = false;
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to connect to PostgreSQL for LISTEN', { error: errorMsg });
            this.scheduleReconnect();
        }
    }
    /**
     * Handle PostgreSQL connection error
     */
    handleConnectionError() {
        this.initialized = false;
        if (!this.isReconnecting && !this.isShuttingDown) {
            this.scheduleReconnect();
        }
    }
    /**
     * Handle incoming notification from PostgreSQL
     */
    handleNotification(msg) {
        this.stats.eventsProcessed++;
        this.lastEventReceivedAt = Date.now();
        const channel = msg.channel;
        const payloadStr = msg.payload;
        if (!payloadStr) {
            this.logger.debug('Received empty notification payload', { channel });
            return;
        }
        let payload;
        try {
            payload = JSON.parse(payloadStr);
        }
        catch {
            this.stats.eventsParseFailed++;
            this.logger.warn('Failed to parse notification payload as JSON', {
                channel,
                payload: payloadStr.substring(0, 100),
                totalParseFailed: this.stats.eventsParseFailed,
            });
            return;
        }
        this.logger.debug('Received notification', {
            channel,
            deviceId: this.truncateId(payload.deviceId),
            userId: this.truncateId(payload.userId),
            eventType: payload.eventType,
        });
        // Route to matching clients
        this.routeEvent(channel, payload);
    }
    /**
     * Route event to matching SSE clients
     */
    routeEvent(channel, payload) {
        const eventType = payload.eventType || channel;
        const deviceId = payload.deviceId;
        const userId = payload.userId;
        const matchingClients = this.filterClients(deviceId, userId);
        if (matchingClients.length === 0) {
            this.stats.eventsDroppedNoClients++;
            this.logger.debug('No SSE clients to receive event', {
                channel,
                eventType,
                deviceId: this.truncateId(deviceId),
                userId: this.truncateId(userId),
                totalClients: this.clients.size,
            });
            return;
        }
        this.logger.debug(`Broadcasting ${eventType} to ${matchingClients.length} client(s)`);
        for (const client of matchingClients) {
            this.sendEvent(client, eventType, payload);
            this.stats.eventsRouted++;
        }
    }
    /**
     * Filter clients based on device_id or user_id
     */
    filterClients(deviceId, userId) {
        const matching = [];
        for (const client of this.clients.values()) {
            // Device-specific client matches device
            if (client.deviceId && deviceId && client.deviceId === deviceId) {
                matching.push(client);
            }
            // User-wide client matches user
            else if (client.userId && userId && client.userId === userId) {
                matching.push(client);
            }
        }
        return matching;
    }
    /**
     * Send SSE event to a client
     */
    sendEvent(client, eventType, data) {
        try {
            const eventData = JSON.stringify({ eventType, payload: data });
            client.response.write(`event: ${eventType}\n`);
            client.response.write(`data: ${eventData}\n\n`);
        }
        catch {
            // Client disconnected - will be cleaned up by close handler
            this.logger.debug('Event send failed - client disconnected', {
                clientId: client.id.substring(0, 8),
                eventType,
            });
        }
    }
    /**
     * Schedule reconnection with exponential backoff
     */
    scheduleReconnect() {
        if (this.isShuttingDown) {
            this.isReconnecting = false;
            return;
        }
        if (this.isReconnecting) {
            this.logger.debug('Reconnection already in progress, skipping');
            return;
        }
        if (this.reconnectAttempts >= this.reconnectMaxAttempts) {
            this.logger.error(`PostgreSQL LISTEN connection failed after ${this.reconnectMaxAttempts} attempts. ` +
                'Call forceReconnect() to retry.');
            this.initialized = false;
            this.isReconnecting = false;
            return;
        }
        this.isReconnecting = true;
        this.reconnectAttempts++;
        this.stats.reconnectionAttempts++;
        // Calculate delay with exponential backoff
        const delay = Math.min(this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts - 1), this.reconnectMaxDelay);
        this.logger.info(`Reconnecting to PostgreSQL in ${Math.round(delay / 1000)}s ` +
            `(attempt ${this.reconnectAttempts}/${this.reconnectMaxAttempts})`);
        this.reconnectTimer = setTimeout(() => {
            this.stats.lastReconnectionAt = new Date();
            this.connect();
        }, delay);
    }
    /**
     * Clean up existing PostgreSQL connection
     */
    async cleanupConnection() {
        if (!this.client) {
            return;
        }
        try {
            // Unlisten all channels
            for (const channel of this.channels) {
                try {
                    await this.client.query(`UNLISTEN ${this.sanitizeChannelName(channel)}`);
                }
                catch {
                    // Ignore cleanup errors
                }
            }
            await this.client.end();
        }
        catch {
            // Ignore cleanup errors
        }
        this.client = null;
    }
    /**
     * Sanitize channel name to prevent SQL injection
     */
    sanitizeChannelName(channel) {
        // Only allow alphanumeric and underscore
        return channel.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    // ===========================================================================
    // Public API
    // ===========================================================================
    /**
     * Register a new SSE client
     * @returns true if registered, false if at capacity
     */
    registerClient(id, deviceId, userId, response) {
        // Check capacity
        if (this.clients.size >= this.maxClients) {
            this.logger.warn('Max SSE clients reached, rejecting connection', {
                maxClients: this.maxClients,
                currentClients: this.clients.size,
            });
            return false;
        }
        const client = {
            id,
            deviceId,
            userId,
            response,
            connectedAt: new Date(),
        };
        this.clients.set(id, client);
        this.stats.totalConnections++;
        this.stats.currentConnections++;
        // Log connection
        const identifier = deviceId
            ? `Device ${this.truncateId(deviceId)}`
            : userId
                ? `User ${this.truncateId(userId)}`
                : 'Unknown client';
        this.logger.info(`${identifier} connected (${this.clients.size} active)`);
        // Send initial connection event
        this.sendEvent(client, 'connected', {
            message: 'Connected to notifications service',
            clientId: id,
            timestamp: new Date().toISOString(),
        });
        // Set up cleanup on disconnect
        response.on('close', () => {
            this.unregisterClient(id);
        });
        // Start heartbeat if this is the first client
        if (this.clients.size === 1 && !this.heartbeatTimer) {
            this.startHeartbeat();
        }
        return true;
    }
    /**
     * Unregister a client
     */
    unregisterClient(id) {
        const client = this.clients.get(id);
        if (!client)
            return;
        this.clients.delete(id);
        this.stats.currentConnections--;
        const identifier = client.deviceId
            ? `Device ${this.truncateId(client.deviceId)}`
            : client.userId
                ? `User ${this.truncateId(client.userId)}`
                : 'Unknown client';
        const durationMs = Date.now() - client.connectedAt.getTime();
        const durationMin = Math.round(durationMs / 60000);
        const durationDisplay = durationMin > 0 ? `${durationMin}m` : '<1m';
        this.logger.info(`${identifier} disconnected after ${durationDisplay} (${this.clients.size} active)`);
        // Stop heartbeat if no clients remain
        if (this.clients.size === 0) {
            this.stopHeartbeat();
        }
    }
    /**
     * Broadcast event to a specific device
     */
    broadcastToDevice(deviceId, eventType, payload) {
        let count = 0;
        for (const client of this.clients.values()) {
            if (client.deviceId === deviceId) {
                this.sendEvent(client, eventType, payload);
                count++;
            }
        }
        return count;
    }
    /**
     * Broadcast event to all devices for a user
     */
    broadcastToUser(userId, eventType, payload) {
        let count = 0;
        for (const client of this.clients.values()) {
            if (client.userId === userId) {
                this.sendEvent(client, eventType, payload);
                count++;
            }
        }
        return count;
    }
    /**
     * Broadcast to all connected clients
     */
    broadcastToAll(eventType, payload) {
        let count = 0;
        for (const client of this.clients.values()) {
            this.sendEvent(client, eventType, payload);
            count++;
        }
        return count;
    }
    // ===========================================================================
    // Heartbeat System
    // ===========================================================================
    /**
     * Start heartbeat system
     */
    startHeartbeat() {
        this.logger.debug(`Starting heartbeat (${this.heartbeatInterval / 1000}s interval)`);
        this.heartbeatTimer = setInterval(() => {
            if (this.clients.size === 0) {
                return;
            }
            const heartbeatData = {
                timestamp: new Date().toISOString(),
            };
            if (this.heartbeatIncludeStatus) {
                heartbeatData.server = {
                    status: this.initialized ? 'healthy' : 'degraded',
                    uptime: Math.round(process.uptime()),
                    clients: this.clients.size,
                };
            }
            this.logger.debug(`Broadcasting heartbeat to ${this.clients.size} clients`);
            for (const client of this.clients.values()) {
                this.sendEvent(client, 'heartbeat', heartbeatData);
            }
        }, this.heartbeatInterval);
    }
    /**
     * Stop heartbeat system
     */
    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
            this.logger.debug('Stopped heartbeat');
        }
    }
    // ===========================================================================
    // Client Management
    // ===========================================================================
    /**
     * Get list of connected clients
     */
    getClients() {
        const now = Date.now();
        return Array.from(this.clients.values()).map((client) => ({
            id: client.id,
            deviceId: client.deviceId,
            userId: client.userId,
            connectedAt: client.connectedAt.toISOString(),
            durationMs: now - client.connectedAt.getTime(),
        }));
    }
    /**
     * Disconnect a specific client by ID
     * @param clientId - The client ID to disconnect
     * @param disconnectedBy - Optional info about who initiated the disconnect (for audit logging)
     * @returns true if client was found and disconnected, false otherwise
     */
    disconnectClient(clientId, disconnectedBy) {
        const client = this.clients.get(clientId);
        if (!client) {
            return false;
        }
        // Audit log with details about who disconnected the client
        const disconnectInfo = disconnectedBy
            ? ` by ${disconnectedBy.email || disconnectedBy.userId || disconnectedBy.ip || 'admin'}`
            : '';
        this.logger.info(`Force disconnecting client ${this.truncateId(clientId)}${disconnectInfo}` +
            (client.deviceId ? ` (device: ${this.truncateId(client.deviceId)})` : '') +
            (client.userId ? ` (user: ${this.truncateId(client.userId)})` : ''));
        // Send disconnect event before closing
        try {
            this.sendEvent(client, 'disconnected', {
                reason: 'Disconnected by administrator',
                timestamp: new Date().toISOString(),
            });
            client.response.end();
        }
        catch {
            // Ignore errors - client may have already disconnected
        }
        // The unregisterClient will be called by the 'close' event handler
        return true;
    }
    // ===========================================================================
    // Statistics & Health
    // ===========================================================================
    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            clientsByType: {
                device: Array.from(this.clients.values()).filter((c) => c.deviceId).length,
                user: Array.from(this.clients.values()).filter((c) => c.userId && !c.deviceId).length,
            },
            connectionHealth: this.getConnectionHealth(),
        };
    }
    /**
     * Get connection health status
     */
    getConnectionHealth() {
        const now = Date.now();
        const timeSinceLastEvent = now - this.lastEventReceivedAt;
        const isHealthy = this.initialized && timeSinceLastEvent < CONNECTION_HEALTH_TIMEOUT;
        return {
            isConnected: this.initialized,
            isHealthy,
            lastEventAt: this.lastEventReceivedAt ? new Date(this.lastEventReceivedAt) : null,
            timeSinceLastEvent,
            channelCount: this.channels.length,
            isReconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
        };
    }
    /**
     * Force reconnection - useful for recovery
     */
    async forceReconnect() {
        this.logger.info('Force reconnection requested');
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        await this.cleanupConnection();
        await this.connect();
    }
    /**
     * Shutdown the manager
     */
    async shutdown() {
        this.isShuttingDown = true;
        // Stop heartbeat
        this.stopHeartbeat();
        // Clear reconnect timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        if (this.clients.size > 0) {
            this.logger.info(`Shutting down notifications service (${this.clients.size} active connections)`);
        }
        // Close all SSE connections
        for (const client of this.clients.values()) {
            try {
                client.response.end();
            }
            catch {
                // Ignore errors during shutdown
            }
        }
        this.clients.clear();
        // Clean up PostgreSQL connection
        await this.cleanupConnection();
        this.initialized = false;
        this.logger.info('Notifications service stopped');
    }
}
// =============================================================================
// Singleton Management
// =============================================================================
let managerInstance = null;
/**
 * Set the notifications manager singleton
 */
export function setNotificationsManager(manager) {
    managerInstance = manager;
}
/**
 * Get the notifications manager singleton
 * @throws Error if manager is not initialized
 */
export function getNotificationsManager() {
    if (!managerInstance) {
        throw new Error('NotificationsManager not initialized. Did you register the notifications plugin?');
    }
    return managerInstance;
}
/**
 * Check if notifications manager is available
 */
export function hasNotificationsManager() {
    return managerInstance !== null;
}
// =============================================================================
// Helper Functions
// =============================================================================
/**
 * Broadcast event to a specific device
 * @returns Number of clients the event was sent to
 */
export function broadcastToDevice(deviceId, eventType, payload) {
    return getNotificationsManager().broadcastToDevice(deviceId, eventType, payload);
}
/**
 * Broadcast event to all devices for a user
 * @returns Number of clients the event was sent to
 */
export function broadcastToUser(userId, eventType, payload) {
    return getNotificationsManager().broadcastToUser(userId, eventType, payload);
}
/**
 * Broadcast event to all connected clients
 * @returns Number of clients the event was sent to
 */
export function broadcastToAll(eventType, payload) {
    return getNotificationsManager().broadcastToAll(eventType, payload);
}
//# sourceMappingURL=notifications-manager.js.map