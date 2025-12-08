/**
 * Gateway Server for @qwickapps/server
 *
 * Provides a production-ready gateway pattern that:
 * 1. Serves the control panel UI (always responsive)
 * 2. Proxies API requests to an internal service
 * 3. Provides health and diagnostics endpoints
 *
 * Architecture:
 *   Internet → Gateway (GATEWAY_PORT, public) → Service (SERVICE_PORT, internal)
 *
 * The gateway is always responsive even if the internal service is down,
 * allowing diagnostics and error visibility.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import type { Application, Request, Response, NextFunction } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Socket } from 'net';
import type { Server } from 'http';
import type { ControlPanelConfig, ControlPanelPlugin, Logger } from './types.js';
import { createControlPanel } from './control-panel.js';
import { initializeLogging, getControlPanelLogger, type LoggingConfig } from './logging.js';
import { createProxyMiddleware, type Options } from 'http-proxy-middleware';
import express from 'express';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Gateway configuration
 */
export interface GatewayConfig {
  /** Port for the gateway (public-facing). Defaults to GATEWAY_PORT env or 3101 */
  gatewayPort?: number;

  /** Port for the internal service. Defaults to SERVICE_PORT env or 3100 */
  servicePort?: number;

  /** Product name for the control panel */
  productName: string;

  /** Product version */
  version?: string;

  /**
   * URL to the product logo image (SVG, PNG, etc.).
   * Used on the default landing page when no frontend app is configured.
   */
  logoUrl?: string;

  /** Branding configuration */
  branding?: ControlPanelConfig['branding'];

  /** CORS origins */
  corsOrigins?: string[];

  /** Control panel plugins */
  plugins?: ControlPanelPlugin[];

  /** Quick links for the control panel */
  links?: ControlPanelConfig['links'];

  /** Path to custom React UI dist folder for the control panel */
  customUiPath?: string;

  /**
   * Mount path for the control panel.
   * Defaults to '/cpanel'.
   */
  controlPanelPath?: string;

  /**
   * Route guard for the control panel.
   * Defaults to auto-generated basic auth.
   */
  controlPanelGuard?: ControlPanelConfig['guard'];

  /**
   * Frontend app configuration for the root path (/).
   * If not provided, root path is not handled by the gateway.
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
    };
  };

  /**
   * API paths to proxy to the internal service.
   * Defaults to ['/api/v1'] if not specified.
   * The gateway always proxies /health to the internal service.
   */
  proxyPaths?: string[];

  /** Logger instance */
  logger?: Logger;

  /** Logging configuration */
  logging?: LoggingConfig;
}

/**
 * Service factory function type
 * Called with the service port, should return an object with:
 * - app: Express application (or compatible)
 * - server: HTTP server (created by calling listen)
 * - shutdown: Async function to gracefully shut down the service
 */
export interface ServiceFactory {
  (port: number): Promise<{
    app: Application;
    server: Server;
    shutdown: () => Promise<void>;
  }>;
}

/**
 * Gateway instance returned by createGateway
 */
export interface GatewayInstance {
  /** The control panel instance */
  controlPanel: ReturnType<typeof createControlPanel>;

  /** The internal service (if started) */
  service: {
    app: Application;
    server: Server;
    shutdown: () => Promise<void>;
  } | null;

  /** Start the gateway and internal service */
  start: () => Promise<void>;

  /** Stop everything gracefully */
  stop: () => Promise<void>;

  /** Gateway port */
  gatewayPort: number;

  /** Service port */
  servicePort: number;
}


/**
 * Generate landing page HTML for the frontend app
 */
function generateLandingPageHtml(
  config: NonNullable<GatewayConfig['frontendApp']>['landingPage'],
  controlPanelPath: string
): string {
  if (!config) return '';

  const primaryColor = '#6366f1';

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
 * Shows system status with animated background
 */
function generateDefaultLandingPageHtml(
  productName: string,
  controlPanelPath: string,
  apiBasePath: string,
  version: string,
  logoUrl?: string
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

    /* Animated gradient background */
    .bg-gradient {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      animation: gradientShift 15s ease-in-out infinite;
    }

    @keyframes gradientShift {
      0%, 100% {
        background-position: 0% 0%, 100% 100%, 50% 50%;
        opacity: 1;
      }
      50% {
        background-position: 100% 0%, 0% 100%, 50% 50%;
        opacity: 0.8;
      }
    }

    /* Floating particles */
    .particles {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--primary);
      border-radius: 50%;
      opacity: 0.3;
      animation: float 20s infinite;
    }

    .particle:nth-child(1) { left: 10%; animation-delay: 0s; animation-duration: 25s; }
    .particle:nth-child(2) { left: 20%; animation-delay: 2s; animation-duration: 20s; }
    .particle:nth-child(3) { left: 30%; animation-delay: 4s; animation-duration: 28s; }
    .particle:nth-child(4) { left: 40%; animation-delay: 1s; animation-duration: 22s; }
    .particle:nth-child(5) { left: 50%; animation-delay: 3s; animation-duration: 24s; }
    .particle:nth-child(6) { left: 60%; animation-delay: 5s; animation-duration: 26s; }
    .particle:nth-child(7) { left: 70%; animation-delay: 2s; animation-duration: 21s; }
    .particle:nth-child(8) { left: 80%; animation-delay: 4s; animation-duration: 23s; }
    .particle:nth-child(9) { left: 90%; animation-delay: 1s; animation-duration: 27s; }

    @keyframes float {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 0.3; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-100vh) scale(1); opacity: 0; }
    }

    /* Grid pattern overlay */
    .grid-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
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

    .logo.custom {
      filter: drop-shadow(0 20px 40px var(--primary-glow));
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
      width: 80px;
      height: 80px;
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

    .status-dot.degraded {
      background: var(--warning);
      box-shadow: 0 0 10px var(--warning);
    }

    .status-dot.unhealthy {
      background: var(--error);
      box-shadow: 0 0 10px var(--error);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
    }

    .status-text {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--text-primary);
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

    .footer a:hover {
      text-decoration: underline;
    }

    /* Loading state */
    .loading .status-dot {
      background: var(--text-secondary);
      box-shadow: none;
      animation: none;
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="particles">
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>
  <div class="grid-overlay"></div>

  <div class="container">
    ${logoUrl
      ? `<div class="logo custom"><img src="${logoUrl}" alt="${productName} logo" /></div>`
      : `<div class="logo default">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>`}

    <h1>${productName}</h1>

    <div class="status-badge loading" id="status-badge">
      <div class="status-dot" id="status-dot"></div>
      <span class="status-text" id="status-text">Checking status...</span>
    </div>

    <p class="description" id="description">
      Enterprise-grade service powered by QwickApps
    </p>

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
    Powered by <a href="https://qwickapps.com" target="_blank">QwickApps Server</a> - <a href="https://github.com/qwickapps/server" target="_blank">Version ${version}</a>
  </div>

  <script>
    async function checkStatus() {
      const badge = document.getElementById('status-badge');
      const dot = document.getElementById('status-dot');
      const text = document.getElementById('status-text');
      const desc = document.getElementById('description');

      try {
        const res = await fetch('${apiBasePath}/health');
        const data = await res.json();

        badge.classList.remove('loading');

        if (data.status === 'healthy') {
          dot.className = 'status-dot';
          text.textContent = 'All systems operational';
          desc.textContent = 'The service is running smoothly and ready to handle requests.';
        } else if (data.status === 'degraded') {
          dot.className = 'status-dot degraded';
          text.textContent = 'Degraded performance';
          desc.textContent = 'Some services may be experiencing issues. Core functionality remains available.';
        } else {
          dot.className = 'status-dot unhealthy';
          text.textContent = 'System maintenance';
          desc.textContent = 'The service is currently undergoing maintenance. Please check back shortly.';
        }
      } catch (e) {
        badge.classList.remove('loading');
        dot.className = 'status-dot unhealthy';
        text.textContent = 'Unable to connect';
        desc.textContent = 'Could not reach the service. Please try again later.';
      }
    }

    // Check status on load and every 30 seconds
    checkStatus();
    setInterval(checkStatus, 30000);
  </script>
</body>
</html>`;
}

/**
 * Create a gateway that proxies to an internal service
 *
 * @param config - Gateway configuration
 * @param serviceFactory - Factory function to create the internal service
 * @returns Gateway instance
 *
 * @example
 * ```typescript
 * import { createGateway } from '@qwickapps/server';
 *
 * const gateway = createGateway(
 *   {
 *     productName: 'My Service',
 *     gatewayPort: 3101,
 *     servicePort: 3100,
 *   },
 *   async (port) => {
 *     const app = createMyApp();
 *     const server = app.listen(port);
 *     return {
 *       app,
 *       server,
 *       shutdown: async () => { server.close(); },
 *     };
 *   }
 * );
 *
 * await gateway.start();
 * ```
 */
export function createGateway(
  config: GatewayConfig,
  serviceFactory: ServiceFactory
): GatewayInstance {
  // Initialize logging subsystem first
  const loggingSubsystem = initializeLogging({
    namespace: config.productName,
    ...config.logging,
  });

  // Use provided logger or get one from the logging subsystem
  const logger = config.logger || getControlPanelLogger('Gateway');

  const gatewayPort = config.gatewayPort || parseInt(process.env.GATEWAY_PORT || process.env.PORT || '3101', 10);
  const servicePort = config.servicePort || parseInt(process.env.SERVICE_PORT || '3100', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Control panel mount path (defaults to /cpanel)
  const controlPanelPath = config.controlPanelPath || '/cpanel';

  // Guard configuration for control panel
  const guardConfig = config.controlPanelGuard;

  // API paths to proxy
  const proxyPaths = config.proxyPaths || ['/api/v1'];

  // Version for display
  const version = config.version || process.env.npm_package_version || '1.0.0';

  let service: GatewayInstance['service'] = null;

  // Create control panel
  const controlPanel = createControlPanel({
    config: {
      productName: config.productName,
      port: gatewayPort,
      version,
      branding: config.branding,
      cors: config.corsOrigins ? { origins: config.corsOrigins } : undefined,
      // Skip body parsing for proxied paths
      skipBodyParserPaths: [...proxyPaths, '/health'],
      // Mount path for control panel
      mountPath: controlPanelPath,
      // Route guard
      guard: guardConfig,
      // Custom UI path
      customUiPath: config.customUiPath,
      links: config.links,
    },
    plugins: config.plugins || [],
    logger,
  });

  // Setup proxy middleware for API paths
  const setupProxyMiddleware = () => {
    const target = `http://localhost:${servicePort}`;

    // Proxy each API path
    for (const apiPath of proxyPaths) {
      const proxyOptions: Options = {
        target,
        changeOrigin: false,
        pathFilter: `${apiPath}/**`,
        on: {
          error: (err: Error, _req: IncomingMessage, res: ServerResponse | Socket) => {
            logger.error('Proxy error', { error: err.message, path: apiPath });
            if (res && 'writeHead' in res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'Service Unavailable',
                  message: 'The service is currently unavailable. Please try again later.',
                  details: nodeEnv === 'development' ? err.message : undefined,
                })
              );
            }
          },
        },
      };
      controlPanel.app.use(createProxyMiddleware(proxyOptions));
    }

    // Proxy /health endpoint to internal service
    const healthProxyOptions: Options = {
      target,
      changeOrigin: false,
      pathFilter: '/health',
      on: {
        error: (_err: Error, _req: IncomingMessage, res: ServerResponse | Socket) => {
          if (res && 'writeHead' in res && !res.headersSent) {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                status: 'unhealthy',
                error: 'Service unavailable',
                gateway: 'healthy',
              })
            );
          }
        },
      },
    };
    controlPanel.app.use(createProxyMiddleware(healthProxyOptions));
  };

  // Calculate API base path for landing page
  const apiBasePath = controlPanelPath === '/' ? '/api' : `${controlPanelPath}/api`;

  // Setup frontend app at root path
  const setupFrontendApp = () => {
    // If no frontend app configured, serve default landing page with status
    if (!config.frontendApp) {
      logger.info('Frontend app: Serving default landing page');
      controlPanel.app.get('/', (_req, res) => {
        const html = generateDefaultLandingPageHtml(
          config.productName,
          controlPanelPath,
          apiBasePath,
          version,
          config.logoUrl
        );
        res.type('html').send(html);
      });
      return;
    }

    const { redirectUrl, staticPath, landingPage } = config.frontendApp;

    // Priority 1: Redirect
    if (redirectUrl) {
      logger.info(`Frontend app: Redirecting / to ${redirectUrl}`);
      controlPanel.app.get('/', (_req, res) => {
        res.redirect(redirectUrl);
      });
      return;
    }

    // Priority 2: Serve static files
    if (staticPath && existsSync(staticPath)) {
      logger.info(`Frontend app: Serving static files from ${staticPath}`);
      controlPanel.app.use('/', express.static(staticPath));

      // SPA fallback for root
      controlPanel.app.get('/', (_req, res) => {
        res.sendFile(resolve(staticPath, 'index.html'));
      });
      return;
    }

    // Priority 3: Landing page
    if (landingPage) {
      logger.info(`Frontend app: Serving landing page`);
      controlPanel.app.get('/', (_req, res) => {
        const html = generateLandingPageHtml(landingPage, controlPanelPath);
        res.type('html').send(html);
      });
    }
  };

  const start = async (): Promise<void> => {
    logger.info('Starting gateway...');

    // 1. Start internal service
    logger.info(`Starting internal service on port ${servicePort}...`);
    service = await serviceFactory(servicePort);
    logger.info(`Internal service started on port ${servicePort}`);

    // 2. Setup proxy middleware (after service is started)
    setupProxyMiddleware();

    // 3. Setup frontend app at root path
    setupFrontendApp();

    // 4. Start control panel gateway
    await controlPanel.start();

    // Log startup info
    logger.info(`${config.productName} Gateway`);
    logger.info(`Gateway Port:  ${gatewayPort} (public)`);
    logger.info(`Service Port:  ${servicePort} (internal)`);
    
    if (guardConfig && guardConfig.type === 'basic') {
      logger.info(`Control Panel Auth: HTTP Basic Auth - Username: ${guardConfig.username}`);
    } else if (guardConfig && guardConfig.type !== 'none') {
      logger.info(`Control Panel Auth: ${guardConfig.type}`);
    } else {
      logger.info('Control Panel Auth: None (not recommended)');
    }

    logger.info(`Frontend App: GET  /`);
    logger.info(`Control Panel UI: GET ${controlPanelPath.padEnd(20)}`);
    logger.info(`Gateway Health: GET ${apiBasePath}/health`);
    logger.info(`Service Health: GET /health`);
    for (const apiPath of proxyPaths) {
      logger.info(`Service API: * ${apiPath}/*`);
    }
  };

  const stop = async (): Promise<void> => {
    logger.info('Shutting down gateway...');

    // Stop control panel
    await controlPanel.stop();

    // Stop internal service
    if (service) {
      await service.shutdown();
      service.server.close();
    }

    logger.info('Gateway shutdown complete');
  };

  return {
    controlPanel,
    service,
    start,
    stop,
    gatewayPort,
    servicePort,
  };
}
