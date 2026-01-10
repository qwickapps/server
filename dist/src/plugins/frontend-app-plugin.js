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
import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRouteGuard } from '../core/guards.js';
/**
 * Create a frontend app plugin that handles the root path
 */
export function createFrontendAppPlugin(config) {
    return {
        id: 'frontend-app',
        name: 'Frontend App Plugin',
        version: '1.0.0',
        type: 'system',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('frontend-app');
            const app = registry.getApp();
            // Apply guard if configured
            if (config.guard && config.guard.type !== 'none') {
                const guardMiddleware = createRouteGuard(config.guard);
                // Apply guard only to root path
                app.use('/', (req, res, next) => {
                    // Skip if not at root
                    if (req.path !== '/' && !req.path.startsWith('/?')) {
                        return next();
                    }
                    guardMiddleware(req, res, next);
                });
            }
            // Priority 1: Redirect
            if (config.redirectUrl) {
                logger.info(`Frontend app: Redirecting / to ${config.redirectUrl}`);
                app.get('/', (_req, res) => {
                    res.redirect(config.redirectUrl);
                });
                return;
            }
            // Priority 2: Serve static files
            if (config.staticPath && existsSync(config.staticPath)) {
                logger.info(`Frontend app: Serving static files from ${config.staticPath}`);
                // Serve static assets first
                app.use(express.static(config.staticPath, { index: false }));
                // SPA fallback for all non-API routes
                // This must be registered after static files but handles routes that don't match files
                app.get('*', (req, res, next) => {
                    // Skip API routes, control panel, auth, and MCP endpoints
                    if (req.path.startsWith('/api') ||
                        req.path.startsWith(config.mountPath || '/cpanel') ||
                        req.path.startsWith('/auth') ||
                        req.path.startsWith('/mcp')) {
                        return next();
                    }
                    // Serve index.html for all other routes (SPA routing)
                    const indexPath = resolve(config.staticPath, 'index.html');
                    if (existsSync(indexPath)) {
                        res.sendFile(indexPath);
                    }
                    else {
                        next();
                    }
                });
                return;
            }
            // Priority 3: Landing page
            if (config.landingPage) {
                logger.info(`Frontend app: Serving landing page`);
                app.get('/', (_req, res) => {
                    const html = generateLandingPageHtml(config.landingPage);
                    res.type('html').send(html);
                });
                return;
            }
            // Default: Simple welcome page
            logger.info(`Frontend app: Serving default welcome page`);
            app.get('/', (_req, res) => {
                const html = generateLandingPageHtml({
                    title: config.productName || 'QwickApps Server',
                    heading: `Welcome to ${config.productName || 'QwickApps Server'}`,
                    description: 'Your application is running.',
                    links: [
                        { label: 'Control Panel', url: config.mountPath || '/cpanel' },
                    ],
                });
                res.type('html').send(html);
            });
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
/**
 * Generate landing page HTML
 */
function generateLandingPageHtml(config) {
    const primaryColor = config.branding?.primaryColor || '#6366f1';
    const linksHtml = (config.links || [])
        .map((link) => `<a href="${link.url}" class="link">${link.label}</a>`)
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
    ${config.logoIconUrl ? `
    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 1.5rem;
    }
    ` : ''}
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
    ${config.logoIconUrl ? `<img src="${config.logoIconUrl}" alt="Logo" class="logo">` : ''}
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
//# sourceMappingURL=frontend-app-plugin.js.map