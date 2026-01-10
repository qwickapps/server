/**
 * Client Builder - Auto-generate typed API client from server manifest
 *
 * Fetches route manifest from server and builds dynamic API client with proper
 * HTTP method handling, query parameters, and error handling.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface ClientManifest {
    routes: Record<string, RouteManifestEntry>;
    version: string;
}
export interface RouteManifestEntry {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    path: string;
    auth: boolean;
}
/**
 * Build typed API client from server manifest
 *
 * Fetches the manifest from /api/client-manifest and generates a nested
 * client object with methods for each route.
 *
 * @param baseUrl - Base URL of the server (e.g., 'http://localhost:3000')
 * @returns Promise resolving to the generated client
 *
 * @example
 * ```typescript
 * const client = await buildClientFromManifest<APIClient>('http://localhost:3000');
 * const logs = await client.logs.query({ limit: 10 });
 * ```
 */
export declare function buildClientFromManifest<T = any>(baseUrl: string): Promise<T>;
//# sourceMappingURL=clientBuilder.d.ts.map