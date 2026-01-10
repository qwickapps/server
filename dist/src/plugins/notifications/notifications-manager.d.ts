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
import type { Response } from 'express';
import type { NotificationsStats, ConnectionHealth, NotificationsManagerInterface, NotificationsPluginConfig } from './types.js';
import type { Logger } from '../../core/types.js';
/**
 * NotificationsManager - Singleton service for realtime notifications
 */
export declare class NotificationsManager implements NotificationsManagerInterface {
    private client;
    private clients;
    private channels;
    private connectionString;
    private logger;
    private heartbeatInterval;
    private heartbeatIncludeStatus;
    private reconnectMaxAttempts;
    private reconnectBaseDelay;
    private reconnectMaxDelay;
    private initialized;
    private isReconnecting;
    private isShuttingDown;
    private reconnectAttempts;
    private reconnectTimer?;
    private heartbeatTimer?;
    private stats;
    private maxClients;
    private lastEventReceivedAt;
    constructor(connectionString: string, channels: string[], config: NotificationsPluginConfig, logger: Logger);
    /**
     * Helper to safely truncate IDs for logging
     */
    private truncateId;
    /**
     * Initialize the manager - connect to PostgreSQL and start LISTEN
     */
    initialize(): Promise<void>;
    /**
     * Connect to PostgreSQL and set up LISTEN
     */
    private connect;
    /**
     * Handle PostgreSQL connection error
     */
    private handleConnectionError;
    /**
     * Handle incoming notification from PostgreSQL
     */
    private handleNotification;
    /**
     * Route event to matching SSE clients
     */
    private routeEvent;
    /**
     * Filter clients based on device_id or user_id
     */
    private filterClients;
    /**
     * Send SSE event to a client
     */
    private sendEvent;
    /**
     * Schedule reconnection with exponential backoff
     */
    private scheduleReconnect;
    /**
     * Clean up existing PostgreSQL connection
     */
    private cleanupConnection;
    /**
     * Sanitize channel name to prevent SQL injection
     */
    private sanitizeChannelName;
    /**
     * Register a new SSE client
     * @returns true if registered, false if at capacity
     */
    registerClient(id: string, deviceId: string | undefined, userId: string | undefined, response: Response): boolean;
    /**
     * Unregister a client
     */
    private unregisterClient;
    /**
     * Broadcast event to a specific device
     */
    broadcastToDevice(deviceId: string, eventType: string, payload: unknown): number;
    /**
     * Broadcast event to all devices for a user
     */
    broadcastToUser(userId: string, eventType: string, payload: unknown): number;
    /**
     * Broadcast to all connected clients
     */
    broadcastToAll(eventType: string, payload: unknown): number;
    /**
     * Start heartbeat system
     */
    private startHeartbeat;
    /**
     * Stop heartbeat system
     */
    private stopHeartbeat;
    /**
     * Get list of connected clients
     */
    getClients(): Array<{
        id: string;
        deviceId?: string;
        userId?: string;
        connectedAt: string;
        durationMs: number;
    }>;
    /**
     * Disconnect a specific client by ID
     * @param clientId - The client ID to disconnect
     * @param disconnectedBy - Optional info about who initiated the disconnect (for audit logging)
     * @returns true if client was found and disconnected, false otherwise
     */
    disconnectClient(clientId: string, disconnectedBy?: {
        userId?: string;
        email?: string;
        ip?: string;
    }): boolean;
    /**
     * Get current statistics
     */
    getStats(): NotificationsStats;
    /**
     * Get connection health status
     */
    getConnectionHealth(): ConnectionHealth;
    /**
     * Force reconnection - useful for recovery
     */
    forceReconnect(): Promise<void>;
    /**
     * Shutdown the manager
     */
    shutdown(): Promise<void>;
}
/**
 * Set the notifications manager singleton
 */
export declare function setNotificationsManager(manager: NotificationsManager | null): void;
/**
 * Get the notifications manager singleton
 * @throws Error if manager is not initialized
 */
export declare function getNotificationsManager(): NotificationsManager;
/**
 * Check if notifications manager is available
 */
export declare function hasNotificationsManager(): boolean;
/**
 * Broadcast event to a specific device
 * @returns Number of clients the event was sent to
 */
export declare function broadcastToDevice(deviceId: string, eventType: string, payload: unknown): number;
/**
 * Broadcast event to all devices for a user
 * @returns Number of clients the event was sent to
 */
export declare function broadcastToUser(userId: string, eventType: string, payload: unknown): number;
/**
 * Broadcast event to all connected clients
 * @returns Number of clients the event was sent to
 */
export declare function broadcastToAll(eventType: string, payload: unknown): number;
//# sourceMappingURL=notifications-manager.d.ts.map