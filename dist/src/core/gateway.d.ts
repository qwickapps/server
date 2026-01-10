/**
 * Gateway Server for @qwickapps/server
 *
 * Provides a production-ready gateway pattern that:
 * 1. Proxies multiple apps mounted at configurable paths
 * 2. Each app runs at `/` on its own internal port
 * 3. Gateway handles path rewriting automatically
 * 4. Provides health and diagnostics endpoints
 *
 * Architecture:
 *   Internet → Gateway (:3000) → [Control Panel (:3001), Admin (:3002), API (:3003), ...]
 *
 * Port Scheme:
 *   - 3000: Gateway (public)
 *   - 3001: Control Panel
 *   - 3002+: Additional apps
 *
 * Each app is isolated and can be served from any mount path without rebuilding.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Application } from 'express';
import type { Server } from 'http';
import type { ControlPanelConfig, Logger } from './types.js';
import type { Plugin, PluginConfig } from './plugin-registry.js';
import { createControlPanel } from './control-panel.js';
import { type LoggingConfig } from './logging.js';
/**
 * Maintenance mode configuration for a mounted app
 */
export interface MaintenanceConfig {
    /** Enable maintenance mode - blocks all requests with maintenance page */
    enabled: boolean;
    /** Custom page title (default: "Under Maintenance") */
    title?: string;
    /** Custom message to display */
    message?: string;
    /**
     * Expected time when service will be back.
     * Can be ISO date string, relative time ("2 hours", "30 minutes"), or "soon"
     */
    expectedBackAt?: string;
    /** URL for support/contact (shows "Contact Support" link) */
    contactUrl?: string;
    /** Allow specific paths to bypass maintenance (e.g., ["/api/health", "/api/status"]) */
    bypassPaths?: string[];
}
/**
 * Fallback page configuration when a service is unavailable (proxy error)
 */
export interface FallbackConfig {
    /** Custom page title (default: "Service Unavailable") */
    title?: string;
    /** Custom message (default: "This service is temporarily unavailable") */
    message?: string;
    /** Show "Try Again" button (default: true) */
    showRetry?: boolean;
    /** Auto-refresh interval in seconds (0 = disabled, default: 30) */
    autoRefresh?: number;
}
/**
 * Configuration for a mounted app
 */
export interface MountedAppConfig {
    /** Mount path (e.g., '/admin', '/api') */
    path: string;
    /** Display name for the app (used in status pages) */
    name?: string;
    /** App source configuration */
    source: {
        /** Proxy to an internal service */
        type: 'proxy';
        /** Target URL (e.g., 'http://localhost:3002') */
        target: string;
        /** Enable WebSocket proxying */
        ws?: boolean;
    } | {
        /** Serve static files */
        type: 'static';
        /** Path to static files directory */
        directory: string;
        /** Enable SPA mode (serve index.html for all routes) */
        spa?: boolean;
    };
    /** Whether to strip the mount path prefix when proxying (default: true) */
    stripPrefix?: boolean;
    /** Route guard for this app */
    guard?: ControlPanelConfig['guard'];
    /**
     * Maintenance mode configuration.
     * When enabled, all requests to this app show a maintenance page.
     */
    maintenance?: MaintenanceConfig;
    /**
     * Fallback page configuration for when the service is unavailable.
     * Shown when proxy encounters connection errors (service down/crashed).
     */
    fallback?: FallbackConfig;
}
/**
 * Gateway configuration
 */
export interface GatewayConfig {
    /** Port for the gateway (public-facing). Defaults to GATEWAY_PORT env or 3000 */
    port?: number;
    /** Product name for the gateway */
    productName: string;
    /** Product version */
    version?: string;
    /**
     * URL path to the product logo icon (SVG, PNG, etc.).
     * Used on landing pages and passed to the control panel React UI.
     * Example: '/cpanel/logo.svg'
     */
    logoIconUrl?: string;
    /** Branding configuration (primaryColor, favicon) */
    branding?: ControlPanelConfig['branding'];
    /** CORS origins */
    corsOrigins?: string[];
    /**
     * Mounted apps configuration.
     * Each app runs at `/` on its own port, gateway proxies to it at the configured path.
     *
     * @example
     * ```typescript
     * apps: [
     *   { path: '/cpanel', source: { type: 'proxy', target: 'http://localhost:3001' } },
     *   { path: '/admin', source: { type: 'proxy', target: 'http://localhost:3002', ws: true } },
     *   { path: '/api', source: { type: 'proxy', target: 'http://localhost:3003' } },
     *   { path: '/docs', source: { type: 'static', directory: './dist-docs', spa: true } },
     * ]
     * ```
     */
    apps?: MountedAppConfig[];
    /**
     * Control panel configuration.
     * The control panel is a special built-in app that can be enabled/disabled.
     */
    controlPanel?: {
        /** Enable the built-in control panel (default: true) */
        enabled?: boolean;
        /** Mount path for control panel (default: '/cpanel') */
        path?: string;
        /** Port for internal control panel server (default: 3001) */
        port?: number;
        /** Control panel plugins */
        plugins?: Array<{
            plugin: Plugin;
            config?: PluginConfig;
        }>;
        /** Quick links */
        links?: ControlPanelConfig['links'];
        /** Custom UI path */
        customUiPath?: string;
        /** Route guard */
        guard?: ControlPanelConfig['guard'];
    };
    /**
     * Frontend app configuration for the root path (/).
     * If not provided, shows a default landing page with system status.
     */
    frontendApp?: {
        /** Redirect to another URL */
        redirectUrl?: string;
        /** Path to static files to serve */
        staticPath?: string;
        /** Landing page configuration */
        landingPage?: {
            title: string;
            heading?: string;
            description?: string;
            links?: Array<{
                label: string;
                url: string;
            }>;
            branding?: {
                primaryColor?: string;
            };
        };
    };
    /** Logger instance */
    logger?: Logger;
    /** Logging configuration */
    logging?: LoggingConfig;
}
/**
 * Gateway instance returned by createGateway
 */
export interface GatewayInstance {
    /** The gateway Express app */
    app: Application;
    /** HTTP server */
    server: Server | null;
    /** The internal control panel (if enabled) */
    controlPanel: ReturnType<typeof createControlPanel> | null;
    /** Mounted apps information */
    mountedApps: Array<{
        path: string;
        type: 'proxy' | 'static';
        target?: string;
    }>;
    /** Start the gateway */
    start: () => Promise<void>;
    /** Stop everything gracefully */
    stop: () => Promise<void>;
    /** Gateway port */
    port: number;
}
/**
 * Create a gateway that proxies to multiple internal services
 *
 * @param config - Gateway configuration
 * @returns Gateway instance
 *
 * @example
 * ```typescript
 * import { createGateway } from '@qwickapps/server';
 *
 * const gateway = createGateway({
 *   productName: 'My Product',
 *   port: 3000,
 *   controlPanel: {
 *     path: '/cpanel',
 *     port: 3001,
 *     plugins: [...],
 *   },
 *   apps: [
 *     { path: '/api', source: { type: 'proxy', target: 'http://localhost:3002' } },
 *     { path: '/docs', source: { type: 'static', directory: './docs' } },
 *   ],
 * });
 *
 * await gateway.start();
 * ```
 */
export declare function createGateway(config: GatewayConfig): GatewayInstance;
//# sourceMappingURL=gateway.d.ts.map