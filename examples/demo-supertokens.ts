/**
 * Demo: Supertokens Auth Adapter
 *
 * This demo shows how to configure the Supertokens adapter with:
 * - Email/password authentication
 * - Social logins (Google, GitHub, Apple)
 *
 * Prerequisites:
 * 1. Start Supertokens Core:
 *    docker run -d --name supertokens -p 3567:3567 registry.supertokens.io/supertokens/supertokens-postgresql:latest
 *
 * 2. Run this demo:
 *    npx tsx examples/demo-supertokens.ts
 *
 * 3. Open http://localhost:3000/auth in your browser
 *
 * For social logins, you need real OAuth credentials from:
 * - Google Cloud Console (for Google)
 * - GitHub Developer Settings (for GitHub)
 * - Apple Developer Portal (for Apple)
 */

import express from 'express';
import cors from 'cors';
import {
  supertokensAdapter,
  type SupertokensAdapterConfig,
  type AuthAdapter,
} from '../src/plugins/auth/index.js';

const PORT = 3000;
const SUPERTOKENS_CORE = 'http://localhost:3567';

// ============================================
// CONFIGURATION EXAMPLES
// ============================================

/**
 * Example 1: Basic email/password only
 */
const basicConfig: SupertokensAdapterConfig = {
  connectionUri: SUPERTOKENS_CORE,
  appName: 'My App',
  apiDomain: `http://localhost:${PORT}`,
  websiteDomain: `http://localhost:${PORT}`,
};

/**
 * Example 2: Email/password + Google social login
 */
const googleConfig: SupertokensAdapterConfig = {
  connectionUri: SUPERTOKENS_CORE,
  appName: 'My App',
  apiDomain: `http://localhost:${PORT}`,
  websiteDomain: `http://localhost:${PORT}`,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    },
  },
};

/**
 * Example 3: Full configuration with all social providers
 */
const fullConfig: SupertokensAdapterConfig = {
  connectionUri: SUPERTOKENS_CORE,
  apiKey: process.env.SUPERTOKENS_API_KEY, // Optional: for managed Supertokens
  appName: 'My App',
  apiDomain: `http://localhost:${PORT}`,
  websiteDomain: `http://localhost:${PORT}`,
  apiBasePath: '/auth', // Where Supertokens APIs are mounted
  websiteBasePath: '/auth', // Where UI routes are
  enableEmailPassword: true, // Can be disabled if only using social
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-secret',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'github-secret',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || 'apple-client-id',
      clientSecret: process.env.APPLE_PRIVATE_KEY || 'apple-private-key',
      keyId: process.env.APPLE_KEY_ID || 'apple-key-id',
      teamId: process.env.APPLE_TEAM_ID || 'apple-team-id',
    },
  },
};

/**
 * Example 4: Social-only (no email/password)
 */
const socialOnlyConfig: SupertokensAdapterConfig = {
  connectionUri: SUPERTOKENS_CORE,
  appName: 'Social Only App',
  apiDomain: `http://localhost:${PORT}`,
  websiteDomain: `http://localhost:${PORT}`,
  enableEmailPassword: false, // Disable email/password
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-secret',
    },
  },
};

// ============================================
// DEMO SERVER
// ============================================

async function main() {
  const app = express();

  // Enable CORS for frontend
  app.use(
    cors({
      origin: `http://localhost:${PORT}`,
      credentials: true,
      allowedHeaders: ['content-type', ...['rid', 'fdi-version', 'anti-csrf', 'st-auth-mode']],
    })
  );

  // Choose which config to demo (change this to try different configs)
  const selectedConfig = basicConfig;

  // Create Supertokens adapter directly
  const adapter: AuthAdapter = supertokensAdapter(selectedConfig);

  // Initialize auth middleware
  const authMiddleware = adapter.initialize();
  authMiddleware.forEach((mw) => app.use(mw));

  // ============================================
  // API ROUTES
  // ============================================

  // Public route
  app.get('/api/public', (_req, res) => {
    res.json({ message: 'This is a public endpoint' });
  });

  // Protected route - requires authentication
  app.get('/api/protected', async (req, res) => {
    const user = await adapter.getUser(req);
    if (!user) {
      return adapter.onUnauthorized(req, res);
    }
    res.json({
      message: 'You are authenticated!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    });
  });

  // User info route
  app.get('/api/me', async (req, res) => {
    const user = await adapter.getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(user);
  });

  // ============================================
  // UI - Supertokens provides prebuilt UI
  // ============================================

  // Serve interactive demo UI
  app.get('/', (_req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Supertokens Auth Demo</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f0f0f0; }
    h1 { color: #333; margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .card h2 { margin-top: 0; color: #333; font-size: 1.1em; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .full-width { grid-column: 1 / -1; }
    input { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; margin: 5px 5px 5px 0; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-social { background: white; border: 1px solid #ddd; display: flex; align-items: center; gap: 10px; width: 100%; justify-content: center; margin: 8px 0; }
    .btn-social:hover { background: #f5f5f5; }
    .btn-google { border-color: #ea4335; color: #ea4335; }
    .btn-github { border-color: #333; color: #333; }
    .btn-apple { border-color: #000; color: #000; }
    .status { padding: 10px; border-radius: 6px; margin: 10px 0; font-size: 13px; }
    .status.success { background: #d1fae5; color: #065f46; }
    .status.error { background: #fee2e2; color: #991b1b; }
    .status.info { background: #dbeafe; color: #1e40af; }
    #userInfo { background: #f8f8f8; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; max-height: 200px; overflow: auto; }
    .config-section { background: #f8f8f8; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .config-section h3 { margin: 0 0 10px 0; font-size: 0.9em; color: #666; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; overflow-x: auto; font-size: 12px; margin: 0; }
    .provider-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; margin: 2px; }
    .provider-badge.enabled { background: #d1fae5; color: #065f46; }
    .provider-badge.disabled { background: #f3f4f6; color: #9ca3af; }
    .tab-buttons { display: flex; gap: 5px; margin-bottom: 15px; }
    .tab-btn { padding: 8px 16px; border: none; background: #e5e7eb; border-radius: 6px 6px 0 0; cursor: pointer; }
    .tab-btn.active { background: #4f46e5; color: white; }
    .tab-content { display: none; }
    .tab-content.active { display: block; }
  </style>
</head>
<body>
  <h1>🔐 Supertokens Auth Demo</h1>
  <p class="subtitle">Testing the @qwickapps/server Supertokens adapter</p>

  <div class="grid">
    <!-- Auth Actions Card -->
    <div class="card">
      <h2>Authentication</h2>

      <div class="tab-buttons">
        <button class="tab-btn active" onclick="showTab('email')">Email/Password</button>
        <button class="tab-btn" onclick="showTab('social')">Social Login</button>
      </div>

      <div id="tab-email" class="tab-content active">
        <input type="email" id="email" placeholder="Email" value="demo@example.com">
        <input type="password" id="password" placeholder="Password" value="demoPassword123">
        <div>
          <button class="btn-primary" onclick="signup()">Sign Up</button>
          <button class="btn-primary" onclick="signin()">Sign In</button>
          <button onclick="signout()">Sign Out</button>
        </div>
      </div>

      <div id="tab-social" class="tab-content">
        <p style="font-size: 13px; color: #666;">Social providers configured on backend:</p>
        <div id="socialProviders">
          <span class="provider-badge disabled">Google (not configured)</span>
          <span class="provider-badge disabled">GitHub (not configured)</span>
          <span class="provider-badge disabled">Apple (not configured)</span>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 15px;">
          To enable social login, set environment variables and restart the server.
          See configuration section below.
        </p>
      </div>

      <div id="authStatus" class="status info">Not authenticated</div>
    </div>

    <!-- User Info Card -->
    <div class="card">
      <h2>Current User</h2>
      <button class="btn-primary" onclick="getUser()">Get User Info</button>
      <button onclick="testProtected()">Test Protected Route</button>
      <div id="userInfo">No user data</div>
    </div>

    <!-- Configuration Card -->
    <div class="card full-width">
      <h2>Backend Configuration</h2>
      <p style="font-size: 13px; color: #666;">This is how the Supertokens adapter is configured in the demo server:</p>

      <div class="config-section">
        <h3>Basic Configuration (Email/Password Only)</h3>
        <pre>import { supertokensAdapter } from '@qwickapps/server/plugins';

const adapter = supertokensAdapter({
  connectionUri: 'http://localhost:3567',  // Supertokens Core
  appName: 'My App',
  apiDomain: 'http://localhost:3000',
  websiteDomain: 'http://localhost:3000',
});</pre>
      </div>

      <div class="config-section">
        <h3>With Social Providers</h3>
        <pre>const adapter = supertokensAdapter({
  connectionUri: 'http://localhost:3567',
  appName: 'My App',
  apiDomain: 'http://localhost:3000',
  websiteDomain: 'http://localhost:3000',
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_PRIVATE_KEY,
      keyId: process.env.APPLE_KEY_ID,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },
});</pre>
      </div>

      <div class="config-section">
        <h3>Social-Only Mode (No Email/Password)</h3>
        <pre>const adapter = supertokensAdapter({
  connectionUri: 'http://localhost:3567',
  appName: 'My App',
  apiDomain: 'http://localhost:3000',
  websiteDomain: 'http://localhost:3000',
  enableEmailPassword: false,  // Disable email/password
  socialProviders: {
    google: { clientId: '...', clientSecret: '...' },
  },
});</pre>
      </div>
    </div>
  </div>

  <script>
    const API = 'http://localhost:${PORT}';

    function showTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      document.querySelector(\`[onclick="showTab('\${tab}')"]\`).classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    }

    function setStatus(msg, type = 'info') {
      const el = document.getElementById('authStatus');
      el.textContent = msg;
      el.className = 'status ' + type;
    }

    async function signup() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const res = await fetch(API + '/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            formFields: [
              { id: 'email', value: email },
              { id: 'password', value: password }
            ]
          })
        });
        const data = await res.json();
        if (data.status === 'OK') {
          setStatus('✓ Signed up as ' + data.user.emails[0], 'success');
          document.getElementById('userInfo').textContent = JSON.stringify(data.user, null, 2);
        } else {
          setStatus('✗ ' + (data.message || data.status), 'error');
        }
      } catch (e) {
        setStatus('✗ Error: ' + e.message, 'error');
      }
    }

    async function signin() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try {
        const res = await fetch(API + '/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            formFields: [
              { id: 'email', value: email },
              { id: 'password', value: password }
            ]
          })
        });
        const data = await res.json();
        if (data.status === 'OK') {
          setStatus('✓ Signed in as ' + data.user.emails[0], 'success');
          document.getElementById('userInfo').textContent = JSON.stringify(data.user, null, 2);
        } else if (data.status === 'WRONG_CREDENTIALS_ERROR') {
          setStatus('✗ Wrong email or password', 'error');
        } else {
          setStatus('✗ ' + (data.message || data.status), 'error');
        }
      } catch (e) {
        setStatus('✗ Error: ' + e.message, 'error');
      }
    }

    async function signout() {
      try {
        await fetch(API + '/auth/signout', {
          method: 'POST',
          credentials: 'include'
        });
        setStatus('Signed out', 'info');
        document.getElementById('userInfo').textContent = 'No user data';
      } catch (e) {
        setStatus('✗ Error: ' + e.message, 'error');
      }
    }

    async function getUser() {
      try {
        const res = await fetch(API + '/api/me', { credentials: 'include' });
        const data = await res.json();
        if (data.error) {
          setStatus('Not authenticated', 'info');
          document.getElementById('userInfo').textContent = 'Not authenticated';
        } else {
          setStatus('✓ Authenticated as ' + data.email, 'success');
          document.getElementById('userInfo').textContent = JSON.stringify(data, null, 2);
        }
      } catch (e) {
        setStatus('✗ Error: ' + e.message, 'error');
      }
    }

    async function testProtected() {
      try {
        const res = await fetch(API + '/api/protected', { credentials: 'include' });
        const data = await res.json();
        document.getElementById('userInfo').textContent = JSON.stringify(data, null, 2);
        if (data.error) {
          setStatus('✗ ' + data.message, 'error');
        } else {
          setStatus('✓ Access granted!', 'success');
        }
      } catch (e) {
        setStatus('✗ Error: ' + e.message, 'error');
      }
    }

    // Check session on load
    getUser();
  </script>
</body>
</html>
    `);
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Supertokens Auth Demo Server                       ║
╠══════════════════════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}                           ║
║  ST Core:    http://localhost:3567                           ║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║    GET  /              - Demo page with instructions         ║
║    GET  /api/public    - Public endpoint                     ║
║    GET  /api/protected - Protected endpoint                  ║
║    GET  /api/me        - Get current user                    ║
║    POST /auth/signup   - Create account                      ║
║    POST /auth/signin   - Sign in                             ║
╚══════════════════════════════════════════════════════════════╝
    `);
  });
}

main().catch(console.error);
