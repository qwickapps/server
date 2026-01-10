/**
 * Client Builder - Auto-generate typed API client from server manifest
 *
 * Fetches route manifest from server and builds dynamic API client with proper
 * HTTP method handling, query parameters, and error handling.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
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
export async function buildClientFromManifest(baseUrl) {
    // Fetch manifest from server
    const manifestUrl = `${baseUrl}/api/client-manifest`;
    const response = await fetch(manifestUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch client manifest: ${response.status} ${response.statusText}`);
    }
    const manifest = await response.json();
    // Build nested client object
    const client = {};
    for (const [key, route] of Object.entries(manifest.routes)) {
        const [namespace, method] = key.split('.');
        if (!namespace || !method) {
            console.warn(`Invalid route key: ${key}, skipping`);
            continue;
        }
        // Convert hyphenated namespace to camelCase for JavaScript object access
        // e.g., "rate-limit" -> "rateLimit", "api-keys" -> "apiKeys"
        const camelNamespace = namespace.replace(/-./g, x => x[1].toUpperCase());
        // Create namespace if it doesn't exist
        if (!client[camelNamespace]) {
            client[camelNamespace] = {};
        }
        // Create method function
        client[camelNamespace][method] = createMethodFunction(baseUrl, route.method, route.path);
    }
    return client;
}
/**
 * Create a method function for a specific route
 *
 * @param baseUrl - Base URL of the server
 * @param method - HTTP method
 * @param path - Route path (may contain :params)
 * @returns Function that makes the API request
 */
function createMethodFunction(baseUrl, method, path) {
    return async (params) => {
        // Build URL with path parameters and query string
        const url = buildUrl(baseUrl, path, params, method);
        // Prepare request options
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin', // Required for Basic Auth support
        };
        // Add body for non-GET requests
        if (method !== 'GET' && params) {
            // For POST/PUT/PATCH, send params as JSON body
            // (unless params were used for path parameters)
            const hasPathParams = path.includes(':');
            if (!hasPathParams) {
                options.body = JSON.stringify(params);
            }
            else {
                // If we have path params, filter them out from body
                const pathParamNames = extractPathParams(path);
                const bodyParams = Object.keys(params)
                    .filter((key) => !pathParamNames.includes(key))
                    .reduce((obj, key) => {
                    obj[key] = params[key];
                    return obj;
                }, {});
                if (Object.keys(bodyParams).length > 0) {
                    options.body = JSON.stringify(bodyParams);
                }
            }
        }
        // Make the request
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        // Return JSON response
        return response.json();
    };
}
/**
 * Build URL with path parameters and query string
 *
 * @param baseUrl - Base URL
 * @param path - Route path (may contain :params)
 * @param params - Parameters object
 * @param method - HTTP method
 * @returns Complete URL
 */
function buildUrl(baseUrl, path, params, method) {
    let url = path;
    // Replace path parameters (e.g., /users/:id -> /users/123)
    if (params && path.includes(':')) {
        const pathParamNames = extractPathParams(path);
        for (const paramName of pathParamNames) {
            if (params[paramName] !== undefined) {
                url = url.replace(`:${paramName}`, encodeURIComponent(params[paramName]));
            }
        }
    }
    // Add query string for GET requests
    if (method === 'GET' && params) {
        const pathParamNames = path.includes(':') ? extractPathParams(path) : [];
        const queryParams = Object.keys(params)
            .filter((key) => !pathParamNames.includes(key))
            .reduce((obj, key) => {
            obj[key] = params[key];
            return obj;
        }, {});
        if (Object.keys(queryParams).length > 0) {
            const searchParams = new URLSearchParams();
            for (const [key, value] of Object.entries(queryParams)) {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            }
            url += `?${searchParams.toString()}`;
        }
    }
    return `${baseUrl}${url}`;
}
/**
 * Extract path parameter names from a route path
 *
 * @param path - Route path (e.g., /users/:id/posts/:postId)
 * @returns Array of parameter names (e.g., ['id', 'postId'])
 */
function extractPathParams(path) {
    const matches = path.match(/:([a-zA-Z0-9_]+)/g);
    if (!matches) {
        return [];
    }
    return matches.map((match) => match.slice(1)); // Remove leading ':'
}
//# sourceMappingURL=clientBuilder.js.map