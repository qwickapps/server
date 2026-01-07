/**
 * Notifications Plugin
 *
 * Provides realtime SSE-based notifications for @qwickapps/server applications.
 * Uses PostgreSQL LISTEN/NOTIFY for event distribution.
 *
 * ## Features
 * - PostgreSQL LISTEN/NOTIFY integration
 * - SSE endpoint for client connections
 * - Device/user-based event filtering
 * - Automatic reconnection with exponential backoff
 * - Heartbeat system for connection health
 * - Statistics and monitoring
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   createGateway,
 *   createPostgresPlugin,
 *   createNotificationsPlugin,
 *   broadcastToDevice,
 *   broadcastToUser,
 * } from '@qwickapps/server';
 *
 * // Create gateway with notifications
 * const gateway = createGateway({
 *   productName: 'MyApp',
 *   controlPanel: {
 *     plugins: [
 *       { plugin: createPostgresPlugin({ url: process.env.DATABASE_URL }) },
 *       { plugin: createNotificationsPlugin({
 *         channels: ['events', 'messages'],
 *         heartbeat: { interval: 60000 },
 *       }) },
 *     ],
 *   },
 * });
 *
 * // Broadcast events from anywhere in your code
 * broadcastToDevice('device-123', 'command', { action: 'pause' });
 * broadcastToUser('user-456', 'notification', { message: 'Hello!' });
 * ```
 *
 * ## SSE Client Connection
 *
 * ```typescript
 * // Client-side (browser)
 * const eventSource = new EventSource(
 *   '/notifications/stream?device_id=xxx&user_id=yyy'
 * );
 *
 * eventSource.addEventListener('connected', (e) => {
 *   console.log('Connected:', JSON.parse(e.data));
 * });
 *
 * eventSource.addEventListener('events', (e) => {
 *   console.log('Event:', JSON.parse(e.data));
 * });
 *
 * eventSource.addEventListener('heartbeat', (e) => {
 *   console.log('Heartbeat:', JSON.parse(e.data));
 * });
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

// Plugin
export { createNotificationsPlugin } from './notifications-plugin.js';

// Manager and helpers
export {
  NotificationsManager,
  getNotificationsManager,
  hasNotificationsManager,
  broadcastToDevice,
  broadcastToUser,
  broadcastToAll,
} from './notifications-manager.js';

// Types
export type {
  NotificationsPluginConfig,
  SSEClient,
  NotifyPayload,
  SSEEvent,
  NotificationsStats,
  ConnectionHealth,
  NotificationsManagerInterface,
} from './types.js';

// UI Components
export { NotificationsStatusWidget } from './NotificationsStatusWidget.js';
export { NotificationsManagementPage } from './NotificationsManagementPage.js';
export type { NotificationsStatusWidgetProps } from './NotificationsStatusWidget.js';
export type { NotificationsManagementPageProps } from './NotificationsManagementPage.js';
