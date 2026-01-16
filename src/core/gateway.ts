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
import type { IncomingMessage, ServerResponse, Server } from 'http';
import type { Socket } from 'net';
import type { Duplex } from 'stream';
import type { ControlPanelConfig, Logger } from './types.js';
import type { Plugin, PluginConfig } from './plugin-registry.js';
import { createControlPanel } from './control-panel.js';
import { initializeLogging, getControlPanelLogger, type LoggingConfig } from './logging.js';
import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import express from 'express';
import { existsSync, readFileSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get QwickApps Server version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find package.json by walking up directories
// Recommended approach for libraries that work in both source and compiled contexts
function findPackageJson(): string {
  let currentDir = __dirname;
  // Walk up max 5 levels looking for the correct package.json
  for (let i = 0; i < 5; i++) {
    try {
      const packagePath = join(currentDir, 'package.json');
      if (existsSync(packagePath)) {
        const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
        // Verify it's the right package
        if (pkg.name === '@qwickapps/server') {
          return pkg.version || '1.0.0';
        }
      }
    } catch {
      // Continue searching
    }
    currentDir = join(currentDir, '..');
  }
  return '1.0.0';
}

const QWICKAPPS_SERVER_VERSION = findPackageJson();

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
  source:
    | {
        /** Proxy to an internal service */
        type: 'proxy';
        /** Target URL (e.g., 'http://localhost:3002') */
        target: string;
        /** Enable WebSocket proxying */
        ws?: boolean;
      }
    | {
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
    plugins?: Array<{ plugin: Plugin; config?: PluginConfig }>;
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
      links?: Array<{ label: string; url: string }>;
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
 * Generate landing page HTML for the frontend app
 */
function generateLandingPageHtml(
  config: NonNullable<GatewayConfig['frontendApp']>['landingPage'],
  controlPanelPath: string
): string {
  if (!config) return '';

  const primaryColor = config.branding?.primaryColor || '#6366f1';

  const links = config.links || [
    { label: 'Control Panel', url: controlPanelPath },
  ];

  const linksHtml = links
    .map(
      (link) =>
        `<a href="${link.url}" class="link">${link.label}</a>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      text-align: center;
      max-width: 600px;
      padding: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      color: ${primaryColor};
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.125rem;
      color: #94a3b8;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }
    .link {
      display: inline-block;
      padding: 0.875rem 2rem;
      background: ${primaryColor};
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .link:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    }
    .footer {
      position: fixed;
      bottom: 1rem;
      left: 0;
      right: 0;
      text-align: center;
      color: #64748b;
      font-size: 0.875rem;
    }
    .footer a {
      color: ${primaryColor};
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${config.heading || config.title}</h1>
    ${config.description ? `<p>${config.description}</p>` : ''}
    ${linksHtml ? `<div class="links">${linksHtml}</div>` : ''}
  </div>
  <div class="footer">
    Powered by <a href="https://qwickapps.com" target="_blank">QwickApps</a>
  </div>
</body>
</html>`;
}

/**
 * Generate default landing page HTML when no frontend app is configured
 */
function generateDefaultLandingPageHtml(
  productName: string,
  controlPanelPath: string,
  logoIconUrl?: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --primary: #6366f1;
      --primary-glow: rgba(99, 102, 241, 0.4);
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
      --bg-dark: #0a0a0f;
      --bg-card: rgba(255, 255, 255, 0.03);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .bg-gradient {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      animation: gradientShift 15s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .container {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 500px;
      padding: 3rem 2rem;
    }

    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: logoFloat 6s ease-in-out infinite;
    }

    .logo.default {
      background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
      border-radius: 20px;
      box-shadow: 0 20px 40px var(--primary-glow);
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .logo svg {
      width: 48px;
      height: 48px;
      fill: white;
    }

    .logo img {
      width: 64px;
      height: 64px;
      object-fit: contain;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      margin: 1.5rem 0 2rem;
      backdrop-filter: blur(10px);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 10px var(--success);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .status-text {
      font-size: 0.95rem;
      font-weight: 500;
    }

    .description {
      color: var(--text-secondary);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }

    .link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.75rem;
      background: var(--primary);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .link:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--primary-glow);
    }

    .footer {
      position: fixed;
      bottom: 1.5rem;
      left: 0;
      right: 0;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
      z-index: 10;
    }

    .footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>

  <div class="container">
    ${logoIconUrl
      ? `<div class="logo"><img src="${logoIconUrl}" alt="${productName} logo"></div>`
      : `<div class="logo default">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>`
    }

    <h1>${productName}</h1>

    <div class="status-badge">
      <div class="status-dot"></div>
      <span class="status-text">Gateway Online</span>
    </div>

    <div class="links">
      <a href="${controlPanelPath}" class="link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Control Panel
      </a>
    </div>
  </div>

  <div class="footer">
    Enterprise Services Powered by <a href="https://qwickapps.com" target="_blank">QwickApps Server</a> - <a href="https://github.com/qwickapps/server" target="_blank">Version ${QWICKAPPS_SERVER_VERSION}</a>
  </div>
</body>
</html>`;
}

/**
 * Shared CSS styles for status pages (maintenance, service unavailable)
 */
const statusPageStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-dark: #0a0a0f;
      --bg-card: rgba(255, 255, 255, 0.03);
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --border-color: rgba(255, 255, 255, 0.08);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: var(--bg-dark);
      color: var(--text-primary);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .bg-gradient {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      animation: gradientShift 15s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.8; }
    }

    .container {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 480px;
      padding: 3rem 2rem;
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      margin: 0 auto 2rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: iconPulse 3s ease-in-out infinite;
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .icon-wrapper svg {
      width: 48px;
      height: 48px;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .status-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }

    .status-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .status-row svg {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .eta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 100px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: var(--accent-color);
      color: white;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px var(--accent-glow);
    }

    .btn-secondary {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .footer {
      position: fixed;
      bottom: 1.5rem;
      left: 0;
      right: 0;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
      z-index: 10;
    }

    @media (max-width: 480px) {
      .container { padding: 2rem 1.5rem; }
      h1 { font-size: 1.5rem; }
      .icon-wrapper { width: 80px; height: 80px; }
      .icon-wrapper svg { width: 40px; height: 40px; }
    }
`;

/**
 * Generate a maintenance page HTML
 */
function generateMaintenancePageHtml(
  appName: string,
  config: MaintenanceConfig,
  productName: string
): string {
  const title = config.title || 'Under Maintenance';
  const message = config.message || `${appName} is currently undergoing scheduled maintenance.`;

  let etaHtml = '';
  if (config.expectedBackAt) {
    const eta = config.expectedBackAt;
    if (eta === 'soon') {
      etaHtml = `
        <div class="eta-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Back online soon
        </div>`;
    } else if (eta.includes('hour') || eta.includes('minute')) {
      etaHtml = `
        <div class="eta-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Expected back in ${eta}
        </div>`;
    } else {
      // ISO date string
      etaHtml = `
        <div class="eta-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span id="eta-countdown">Calculating...</span>
        </div>
        <script>
          (function() {
            const target = new Date('${eta}');
            const el = document.getElementById('eta-countdown');
            function update() {
              const now = new Date();
              const diff = target - now;
              if (diff <= 0) {
                el.textContent = 'Should be back now';
                setTimeout(() => location.reload(), 5000);
                return;
              }
              const hours = Math.floor(diff / 3600000);
              const mins = Math.floor((diff % 3600000) / 60000);
              if (hours > 0) {
                el.textContent = 'Back in ' + hours + 'h ' + mins + 'm';
              } else {
                el.textContent = 'Back in ' + mins + ' minutes';
              }
            }
            update();
            setInterval(update, 60000);
          })();
        </script>`;
    }
  }

  const contactHtml = config.contactUrl
    ? `<a href="${config.contactUrl}" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Contact Support
      </a>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${productName}</title>
  <style>
    ${statusPageStyles}
    :root {
      --accent-color: #f59e0b;
      --accent-glow: rgba(245, 158, 11, 0.3);
    }
    .bg-gradient {
      background:
        radial-gradient(ellipse at 30% 30%, rgba(245, 158, 11, 0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 70%, rgba(234, 179, 8, 0.08) 0%, transparent 50%);
    }
    .icon-wrapper {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 20px 40px rgba(245, 158, 11, 0.3);
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>

  <div class="container">
    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    </div>

    <h1>${title}</h1>
    <p class="subtitle">${message}</p>

    <div class="status-card">
      <div class="status-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>We're performing upgrades to improve your experience</span>
      </div>
    </div>

    ${etaHtml}

    <div class="actions">
      <button onclick="location.reload()" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Check Again
      </button>
      ${contactHtml}
    </div>
  </div>

  <div class="footer">
    ${productName}
  </div>
</body>
</html>`;
}

/**
 * Generate a service unavailable page HTML (when proxy fails)
 */
function generateServiceUnavailablePageHtml(
  appName: string,
  path: string,
  config: FallbackConfig | undefined,
  productName: string
): string {
  const title = config?.title || 'Service Unavailable';
  const message = config?.message || `${appName} is temporarily unavailable. Our team has been notified.`;
  const showRetry = config?.showRetry !== false;
  const autoRefresh = config?.autoRefresh ?? 30;

  const autoRefreshScript = autoRefresh > 0
    ? `<script>
        let countdown = ${autoRefresh};
        const el = document.getElementById('refresh-countdown');
        setInterval(() => {
          countdown--;
          if (countdown <= 0) location.reload();
          el.textContent = countdown;
        }, 1000);
      </script>`
    : '';

  const autoRefreshHtml = autoRefresh > 0
    ? `<div class="status-row" style="margin-top: 1rem;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>Auto-refreshing in <strong id="refresh-countdown">${autoRefresh}</strong>s</span>
      </div>`
    : '';

  const retryButtonHtml = showRetry
    ? `<button onclick="location.reload()" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M23 4v6h-6"/>
          <path d="M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        Try Again
      </button>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${productName}</title>
  <style>
    ${statusPageStyles}
    :root {
      --accent-color: #ef4444;
      --accent-glow: rgba(239, 68, 68, 0.3);
    }
    .bg-gradient {
      background:
        radial-gradient(ellipse at 30% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 70%, rgba(220, 38, 38, 0.08) 0%, transparent 50%);
    }
    .icon-wrapper {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>

  <div class="container">
    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>

    <h1>${title}</h1>
    <p class="subtitle">${message}</p>

    <div class="status-card">
      <div class="status-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
        <span>The service at <code style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 4px;">${path}</code> is not responding</span>
      </div>
      ${autoRefreshHtml}
    </div>

    <div class="actions">
      ${retryButtonHtml}
      <a href="/" class="btn btn-secondary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        Go Home
      </a>
    </div>
  </div>

  <div class="footer">
    ${productName}
  </div>
  ${autoRefreshScript}
</body>
</html>`;
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
export function createGateway(config: GatewayConfig): GatewayInstance {
  // Initialize logging (side effect - subsystem is initialized globally)
  initializeLogging({
    namespace: config.productName,
    ...config.logging,
  });

  const logger = config.logger || getControlPanelLogger('Gateway');

  // Port configuration - new scheme: 3000 gateway, 3001 cpanel, 3002+ apps
  const gatewayPort = config.port || parseInt(process.env.GATEWAY_PORT || process.env.PORT || '3000', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';
  const version = config.version || process.env.npm_package_version || '1.0.0';

  // Control panel configuration
  const cpConfig = config.controlPanel ?? { enabled: true };
  const cpEnabled = cpConfig.enabled !== false;
  const cpPath = cpConfig.path || '/cpanel';
  const cpPort = cpConfig.port || 3001;

  // Create gateway Express app
  const app = express();
  let server: Server | null = null;
  let controlPanelInstance: ReturnType<typeof createControlPanel> | null = null;
  const mountedApps: GatewayInstance['mountedApps'] = [];

  /**
   * Setup proxy middleware for an app
   */
  const setupProxyApp = (appConfig: MountedAppConfig, httpServer: Server) => {
    const { path, source, stripPrefix = true, name, maintenance, fallback } = appConfig;

    if (source.type !== 'proxy') return;

    const appName = name || path.replace(/^\//, '') || 'Service';
    logger.debug(`Setting up proxy: ${path} -> ${source.target}`);

    // Maintenance mode middleware - intercepts all requests when enabled
    if (maintenance?.enabled) {
      logger.info(`Maintenance mode enabled for ${path}`);
      app.use(path, (req, res, next) => {
        // Check bypass paths
        if (maintenance.bypassPaths?.some(bp => req.path.startsWith(bp))) {
          return next();
        }
        const html = generateMaintenancePageHtml(appName, maintenance, config.productName);
        res.status(503).type('html').send(html);
      });
      mountedApps.push({ path, type: 'proxy', target: source.target });
      return; // Don't setup proxy when in maintenance mode
    }

    const proxyOptions: Options = {
      target: source.target,
      changeOrigin: true,
      ws: source.ws ?? false,
      pathRewrite: stripPrefix ? { [`^${path}`]: '' } : undefined,
      on: {
        proxyReq: (proxyReq) => {
          // Add X-Forwarded headers so app knows its mounted path
          proxyReq.setHeader('X-Forwarded-Prefix', path);
        },
        error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
          logger.error(`Proxy error for ${path}`, { error: err.message });

          if (res && 'writeHead' in res && !res.headersSent) {
            // Check if this looks like an API request (Accept: application/json or /api/ path)
            const acceptHeader = req.headers['accept'] || '';
            const isApiRequest = acceptHeader.includes('application/json') || req.url?.includes('/api/');

            if (isApiRequest) {
              // Return JSON error for API requests
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Service Unavailable',
                message: `The service at ${path} is currently unavailable.`,
                details: nodeEnv === 'development' ? err.message : undefined,
              }));
            } else {
              // Return beautiful HTML page for browser requests
              const html = generateServiceUnavailablePageHtml(appName, path, fallback, config.productName);
              res.writeHead(503, { 'Content-Type': 'text/html' });
              res.end(html);
            }
          }
        },
      },
    };

    const proxy = createProxyMiddleware(proxyOptions);

    // Mount proxy
    app.use(path, proxy);

    // WebSocket upgrade handling
    if (source.ws && httpServer) {
      httpServer.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url?.startsWith(path)) {
          proxy.upgrade?.(req, socket as Socket, head);
        }
      });
    }

    mountedApps.push({ path, type: 'proxy', target: source.target });
  };

  /**
   * Setup static file serving for an app
   */
  const setupStaticApp = (appConfig: MountedAppConfig) => {
    const { path, source } = appConfig;

    if (source.type !== 'static') return;

    logger.debug(`Setting up static: ${path} -> ${source.directory}`);

    if (!existsSync(source.directory)) {
      logger.warn(`Static directory not found: ${source.directory}`);
      return;
    }

    // Serve static files
    app.use(path, express.static(source.directory, { index: false }));

    // SPA fallback
    if (source.spa) {
      const indexPath = join(source.directory, 'index.html');

      // Read and cache index.html with path rewriting
      let cachedHtml: string | null = null;
      const getIndexHtml = (): string => {
        if (cachedHtml) return cachedHtml;
        let html = readFileSync(indexPath, 'utf-8');
        // Rewrite asset paths for non-root mount
        if (path !== '/') {
          html = html.replace(/src="\/assets\//g, `src="${path}/assets/`);
          html = html.replace(/href="\/assets\//g, `href="${path}/assets/`);
        }
        cachedHtml = html;
        return html;
      };

      app.get(`${path}/*`, (_req, res) => {
        res.type('html').send(getIndexHtml());
      });

      if (path !== '/') {
        app.get(path, (_req, res) => {
          res.type('html').send(getIndexHtml());
        });
      }
    }

    mountedApps.push({ path, type: 'static' });
  };

  /**
   * Setup frontend app at root path
   */
  const setupFrontendApp = () => {
    const { frontendApp, logoIconUrl } = config;

    // Default landing page
    if (!frontendApp) {
      logger.debug('Frontend: Serving default landing page');
      app.get('/', (_req, res) => {
        const html = generateDefaultLandingPageHtml(
          config.productName,
          cpPath,
          logoIconUrl
        );
        res.type('html').send(html);
      });
      return;
    }

    const { redirectUrl, staticPath, landingPage } = frontendApp;

    // Priority 1: Redirect
    if (redirectUrl) {
      logger.debug(`Frontend: Redirecting / to ${redirectUrl}`);
      app.get('/', (_req, res) => res.redirect(redirectUrl));
      return;
    }

    // Priority 2: Static files
    if (staticPath && existsSync(staticPath)) {
      logger.debug(`Frontend: Serving static from ${staticPath}`);
      app.use('/', express.static(staticPath));
      app.get('/', (_req, res) => {
        res.sendFile(resolve(staticPath, 'index.html'));
      });
      return;
    }

    // Priority 3: Landing page
    if (landingPage) {
      logger.debug('Frontend: Serving custom landing page');
      app.get('/', (_req, res) => {
        const html = generateLandingPageHtml(landingPage, cpPath);
        res.type('html').send(html);
      });
    }
  };

  /**
   * Start the gateway
   */
  const start = async (): Promise<void> => {
    logger.debug('Starting gateway...');

    // 1. Start internal control panel if enabled
    if (cpEnabled) {
      logger.debug(`Starting control panel on port ${cpPort}...`);

      controlPanelInstance = createControlPanel({
        config: {
          productName: config.productName,
          port: cpPort,
          version,
          logoIconUrl: config.logoIconUrl,
          branding: config.branding,
          cors: config.corsOrigins ? { origins: config.corsOrigins } : undefined,
          mountPath: '/', // Control panel runs at / internally
          guard: cpConfig.guard,
          customUiPath: cpConfig.customUiPath,
          links: cpConfig.links,
        },
        plugins: cpConfig.plugins || [],
        logger,
      });

      await controlPanelInstance.start();
      logger.debug(`Control panel started on port ${cpPort}`);
    }

    // 2. Create HTTP server
    server = app.listen(gatewayPort);

    // 3. Setup mounted apps (proxy and static)
    const apps = config.apps || [];

    // Add control panel as a proxy app if enabled
    if (cpEnabled) {
      setupProxyApp({
        path: cpPath,
        source: { type: 'proxy', target: `http://localhost:${cpPort}` },
      }, server);
    }

    // Setup additional apps
    for (const appConfig of apps) {
      if (appConfig.source.type === 'proxy') {
        setupProxyApp(appConfig, server);
      } else {
        setupStaticApp(appConfig);
      }
    }

    // 4. Setup frontend app at root
    setupFrontendApp();

    // Log startup info
    const authInfo = cpConfig.guard?.type === 'basic'
      ? `(auth: ${cpConfig.guard.username})`
      : cpConfig.guard?.type && cpConfig.guard.type !== 'none'
        ? `(auth: ${cpConfig.guard.type})`
        : '(no auth)';

    logger.info(`${config.productName} gateway started on port ${gatewayPort} ${authInfo}`);

    // Log mounted apps
    for (const mounted of mountedApps) {
      if (mounted.type === 'proxy') {
        logger.debug(`  ${mounted.path}/* -> ${mounted.target}`);
      } else {
        logger.debug(`  ${mounted.path}/* -> [static]`);
      }
    }
  };

  /**
   * Stop the gateway
   */
  const stop = async (): Promise<void> => {
    logger.debug('Shutting down gateway...');

    // Stop control panel
    if (controlPanelInstance) {
      await controlPanelInstance.stop();
    }

    // Stop gateway server
    if (server) {
      await new Promise<void>((resolve) => server!.close(() => resolve()));
    }

    logger.debug('Gateway shutdown complete');
  };

  return {
    app,
    server,
    controlPanel: controlPanelInstance,
    mountedApps,
    start,
    stop,
    port: gatewayPort,
  };
}
