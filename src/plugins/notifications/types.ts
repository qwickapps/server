/**
 * Notifications Plugin Types
 *
 * Type definitions for the realtime notifications plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Response } from 'express';

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Configuration for the notifications plugin
 */
export interface NotificationsPluginConfig {
  /**
   * PostgreSQL channels to LISTEN on.
   * Each channel maps to a NOTIFY channel in PostgreSQL.
   * Example: ['bot_events', 'chat_messages']
   */
  channels: string[];

  /**
   * Heartbeat configuration
   */
  heartbeat?: {
    /** Interval in milliseconds (default: 60000 = 1 minute) */
    interval?: number;
    /** Include server status in heartbeat (default: true) */
    includeStatus?: boolean;
  };

  /**
   * Reconnection configuration for PostgreSQL LISTEN connection
   */
  reconnect?: {
    /** Maximum reconnection attempts before giving up (default: 10) */
    maxAttempts?: number;
    /** Base delay in milliseconds for exponential backoff (default: 1000) */
    baseDelay?: number;
    /** Maximum delay in milliseconds (default: 60000) */
    maxDelay?: number;
  };

  /**
   * API endpoint configuration
   */
  api?: {
    /** Route prefix (default: '/notifications') */
    prefix?: string;
    /** Enable /stream SSE endpoint (default: true) */
    stream?: boolean;
    /** Enable /stats endpoint (default: true) */
    stats?: boolean;
  };

  /**
   * Enable debug logging (default: false)
   */
  debug?: boolean;
}

// =============================================================================
// SSE Client Types
// =============================================================================

/**
 * Represents a connected SSE client
 */
export interface SSEClient {
  /** Unique client identifier */
  id: string;
  /** Device ID for filtering (optional) */
  deviceId?: string;
  /** User ID for filtering (optional) */
  userId?: string;
  /** Express response object for SSE */
  response: Response;
  /** Connection timestamp */
  connectedAt: Date;
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * PostgreSQL NOTIFY payload structure
 */
export interface NotifyPayload {
  /** Event type (e.g., 'command', 'status') */
  eventType?: string;
  /** Target device ID (for routing) */
  deviceId?: string;
  /** Target user ID (for routing) */
  userId?: string;
  /** Event payload data */
  payload?: unknown;
  /** Additional fields */
  [key: string]: unknown;
}

/**
 * SSE event to send to clients
 */
export interface SSEEvent {
  /** Event type name */
  eventType: string;
  /** Event data */
  payload: unknown;
}

// =============================================================================
// Statistics Types
// =============================================================================

/**
 * Connection health information
 */
export interface ConnectionHealth {
  /** Whether LISTEN connection is established */
  isConnected: boolean;
  /** Whether connection is considered healthy */
  isHealthy: boolean;
  /** Last time an event was received */
  lastEventAt: Date | null;
  /** Time since last event in milliseconds */
  timeSinceLastEvent: number;
  /** Number of channels being listened to */
  channelCount: number;
  /** Whether reconnection is in progress */
  isReconnecting: boolean;
  /** Current reconnection attempt number */
  reconnectAttempts: number;
}

/**
 * Notifications manager statistics
 */
export interface NotificationsStats {
  /** Total connections since startup */
  totalConnections: number;
  /** Currently active connections */
  currentConnections: number;
  /** Total events received from PostgreSQL */
  eventsProcessed: number;
  /** Total events routed to clients */
  eventsRouted: number;
  /** Events that failed JSON parsing */
  eventsParseFailed: number;
  /** Events dropped because no clients matched */
  eventsDroppedNoClients: number;
  /** Total reconnection attempts */
  reconnectionAttempts: number;
  /** Last reconnection timestamp */
  lastReconnectionAt?: Date;
  /** Client breakdown by type */
  clientsByType: {
    /** Clients with device_id filter */
    device: number;
    /** Clients with user_id filter */
    user: number;
  };
  /** Connection health status */
  connectionHealth: ConnectionHealth;
}

// =============================================================================
// Manager Interface
// =============================================================================

/**
 * NotificationsManager interface for external access
 */
export interface NotificationsManagerInterface {
  /** Register a new SSE client */
  registerClient(
    id: string,
    deviceId: string | undefined,
    userId: string | undefined,
    response: Response
  ): void;

  /** Broadcast event to a specific device */
  broadcastToDevice(deviceId: string, eventType: string, payload: unknown): number;

  /** Broadcast event to all devices for a user */
  broadcastToUser(userId: string, eventType: string, payload: unknown): number;

  /** Broadcast to all clients (channel-level broadcast) */
  broadcastToAll(eventType: string, payload: unknown): number;

  /** Get current statistics */
  getStats(): NotificationsStats;

  /** Get connection health */
  getConnectionHealth(): ConnectionHealth;

  /** Force reconnection to PostgreSQL */
  forceReconnect(): Promise<void>;

  /** Shutdown the manager */
  shutdown(): Promise<void>;
}
