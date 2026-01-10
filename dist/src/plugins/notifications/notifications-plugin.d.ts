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
 * ## Usage
 *
 * ```typescript
 * import { createGateway, createNotificationsPlugin } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   productName: 'MyApp',
 *   controlPanel: {
 *     plugins: [
 *       { plugin: createPostgresPlugin({ url: DATABASE_URL }) },
 *       { plugin: createNotificationsPlugin({
 *         channels: ['events', 'messages'],
 *         heartbeat: { interval: 60000 },
 *       }) },
 *     ],
 *   },
 * });
 * ```
 *
 * ## SSE Endpoint
 *
 * ```
 * GET /notifications/stream?device_id=xxx&user_id=yyy
 *
 * Events:
 *   - connected: Initial connection confirmation
 *   - heartbeat: Periodic health check
 *   - {channel}: Events from subscribed channels
 * ```
 *
 * ## Security Note
 *
 * This plugin does NOT handle authentication. Authentication should be
 * configured at the gateway level using the `guard` option or an auth
 * middleware. The plugin trusts that requests reaching it are authorized.
 *
 * Example with gateway guard:
 * ```typescript
 * const gateway = createGateway({
 *   controlPanel: {
 *     guard: { type: 'basic', username: 'admin', password: 'secret' },
 *     plugins: [createNotificationsPlugin({ ... })],
 *   },
 * });
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { NotificationsPluginConfig } from './types.js';
/**
 * Create the Notifications plugin
 *
 * @param config Plugin configuration
 * @returns Plugin instance
 *
 * @example
 * ```typescript
 * import { createNotificationsPlugin } from '@qwickapps/server';
 *
 * const plugin = createNotificationsPlugin({
 *   channels: ['bot_events', 'chat_messages'],
 *   heartbeat: { interval: 60000 },
 *   api: { prefix: '/notifications' },
 * });
 * ```
 */
export declare function createNotificationsPlugin(config: NotificationsPluginConfig): Plugin;
//# sourceMappingURL=notifications-plugin.d.ts.map