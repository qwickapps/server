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
import { randomBytes } from 'crypto';
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

  /** Path to custom React UI dist folder */
  customUiPath?: string;

  /**
   * API paths to proxy to the internal service.
   * Defaults to ['/api/v1'] if not specified.
   * The gateway always proxies /health to the internal service.
   */
  proxyPaths?: string[];

  /**
   * Authentication mode for the control panel (not the API).
   * - 'none': No authentication (not recommended for production)
   * - 'basic': HTTP Basic Auth with username/password
   * - 'auto': Auto-generate password on startup (default)
   */
  authMode?: 'none' | 'basic' | 'auto';

  /** Basic auth username (defaults to 'admin') */
  basicAuthUser?: string;

  /** Basic auth password (required if authMode is 'basic') */
  basicAuthPassword?: string;

  /** Logger instance (deprecated: use logging config instead) */
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
 * Basic auth middleware for gateway protection (control panel only)
 * - Skips localhost requests
 * - Skips API routes (/api/v1/*) - they have their own service auth
 * - Skips health endpoints - these should be public
 * - Requires valid credentials for non-localhost control panel access
 */
function createBasicAuthMiddleware(
  username: string,
  password: string,
  apiPaths: string[]
) {
  const expectedAuth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  return (req: Request, res: Response, next: NextFunction) => {
    const path = req.path;

    // Skip auth for API routes - they use their own authentication
    for (const apiPath of apiPaths) {
      if (path.startsWith(apiPath)) {
        return next();
      }
    }

    // Skip auth for health endpoints - these should be publicly accessible
    if (path === '/health' || path === '/api/health') {
      return next();
    }

    // Allow localhost without auth
    const remoteAddress = req.ip || req.socket?.remoteAddress || '';
    const host = req.hostname || req.headers.host || '';
    const isLocalhost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('localhost:') ||
      host.startsWith('127.0.0.1:') ||
      remoteAddress === '127.0.0.1' ||
      remoteAddress === '::1' ||
      remoteAddress === '::ffff:127.0.0.1';

    if (isLocalhost) {
      return next();
    }

    // Check for valid basic auth
    const authHeader = req.headers.authorization;
    if (authHeader === expectedAuth) {
      return next();
    }

    // Request authentication
    res.setHeader('WWW-Authenticate', 'Basic realm="Control Panel"');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required.',
    });
  };
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

  // Auth configuration
  const authMode = config.authMode || 'auto';
  const basicAuthUser = config.basicAuthUser || process.env.BASIC_AUTH_USER || 'admin';
  const providedPassword = config.basicAuthPassword || process.env.BASIC_AUTH_PASSWORD;
  const basicAuthPassword = providedPassword || (authMode === 'auto' ? randomBytes(16).toString('base64url') : '');
  const isPasswordAutoGenerated = !providedPassword && authMode === 'auto';

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
      // Disable built-in dashboard if custom UI is provided
      disableDashboard: !!config.customUiPath,
      links: config.links,
    },
    plugins: config.plugins || [],
    logger,
  });

  // Add basic auth middleware if enabled
  if (authMode === 'basic' || authMode === 'auto') {
    controlPanel.app.use(createBasicAuthMiddleware(basicAuthUser, basicAuthPassword, proxyPaths));
  }

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

  // Serve custom React UI if provided
  const setupCustomUI = () => {
    if (config.customUiPath && existsSync(config.customUiPath)) {
      logger.info(`Serving custom UI from ${config.customUiPath}`);
      controlPanel.app.use(express.static(config.customUiPath));

      // SPA fallback
      controlPanel.app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api/') || req.path === '/api') {
          return next();
        }
        res.sendFile(resolve(config.customUiPath!, 'index.html'));
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

    // 3. Setup custom UI (after proxy middleware)
    setupCustomUI();

    // 4. Start control panel gateway
    await controlPanel.start();

    // Log startup info
    logger.info('');
    logger.info('========================================');
    logger.info(`  ${config.productName} Gateway`);
    logger.info('========================================');
    logger.info('');
    logger.info(`  Gateway Port:  ${gatewayPort} (public)`);
    logger.info(`  Service Port:  ${servicePort} (internal)`);
    logger.info('');

    if (authMode === 'basic' || authMode === 'auto') {
      logger.info('  Control Panel Auth: HTTP Basic Auth');
      logger.info('  ----------------------------------------');
      logger.info(`    Username: ${basicAuthUser}`);
      if (isPasswordAutoGenerated) {
        logger.info(`    Password: ${basicAuthPassword}`);
        logger.info('    (auto-generated, set BASIC_AUTH_PASSWORD to use a fixed password)');
      } else {
        logger.info('    Password: ********** (from environment)');
      }
      logger.info('  ----------------------------------------');
    } else {
      logger.info('  Control Panel Auth: None (not recommended)');
    }

    logger.info('');
    logger.info('  Endpoints:');
    logger.info(`    GET  /                    - Control Panel UI`);
    logger.info(`    GET  /api/health          - Gateway health`);
    logger.info(`    GET  /health              - Service health (proxied)`);
    for (const apiPath of proxyPaths) {
      logger.info(`    *    ${apiPath}/*             - Service API (proxied)`);
    }
    logger.info('========================================');
    logger.info('');
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
