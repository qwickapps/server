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

  let service: GatewayInstance['service'] = null;

  // Create control panel
  const controlPanel = createControlPanel({
    config: {
      productName: config.productName,
      port: gatewayPort,
      version: config.version || process.env.npm_package_version || '1.0.0',
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

  // Setup frontend app at root path
  const setupFrontendApp = () => {
    if (!config.frontendApp) {
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

    // Calculate API base path
    const apiBasePath = controlPanelPath === '/' ? '/api' : `${controlPanelPath}/api`;

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

    if (config.frontendApp) {
      logger.info(`Frontend App: GET  /`);
    }
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
