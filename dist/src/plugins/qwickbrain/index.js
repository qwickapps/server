/**
 * QwickBrain Plugin
 *
 * MCP proxy plugin for exposing QwickBrain tools to external AI clients.
 *
 * @example
 * ```typescript
 * import { createControlPanel } from '@qwickapps/server';
 * import { createQwickBrainPlugin } from '@qwickapps/server/plugins';
 *
 * const panel = await createControlPanel({
 *   plugins: [
 *     createQwickBrainPlugin({
 *       qwickbrainUrl: 'http://macmini.tailnet-xxx.ts.net:8080',
 *       exposedTools: '*', // or ['search_codebase', 'get_document', ...]
 *     }),
 *   ],
 * });
 * ```
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createQwickBrainPlugin, getConnectionStatus, isConnected } from './qwickbrain-plugin.js';
// UI Components are exported from main package index (@qwickapps/server)
// Do NOT export here to avoid loading UI dependencies when importing plugins
//# sourceMappingURL=index.js.map