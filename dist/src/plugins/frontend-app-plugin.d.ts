/**
 * Frontend App Plugin
 *
 * Plugin for serving a frontend application at the root path (/).
 * Supports:
 * - Redirect to another URL
 * - Serve static files
 * - Display a landing page
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../core/plugin-registry.js';
import type { FrontendAppConfig } from '../core/types.js';
export interface FrontendAppPluginConfig {
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
        /** URL path to the logo icon (SVG, PNG, etc.) */
        logoIconUrl?: string;
        branding?: {
            primaryColor?: string;
        };
    };
    /** Route guard configuration */
    guard?: FrontendAppConfig['mount']['guard'];
    /** Product name for default landing page */
    productName?: string;
    /** Mount path for control panel link */
    mountPath?: string;
}
/**
 * Create a frontend app plugin that handles the root path
 */
export declare function createFrontendAppPlugin(config: FrontendAppPluginConfig): Plugin;
//# sourceMappingURL=frontend-app-plugin.d.ts.map