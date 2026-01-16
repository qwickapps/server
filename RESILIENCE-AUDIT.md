# QwickApps Server Resilience Audit

**Date:** 2026-01-13
**Goal:** Ensure qwickapps-server never throws errors and always degrades gracefully

## Critical Issues Found

### 1. cache-plugin.ts (Line 721)

**Issue:** Throws on Redis connection failure during `onStart`

```typescript
// CURRENT (WRONG):
try {
  await instance.getClient().ping();
  logger.debug(`Cache "${instanceName}" connected`);
} catch (err) {
  logger.error(`Cache "${instanceName}" connection failed`);
  throw err;  // ❌ CRASHES SERVER
}
```

**Impact:** Server won't start if Redis is unavailable

**Fix:** Remove throw, register unhealthy health check, continue startup

---

### 2. postgres-plugin.ts (Line 213)

**Issue:** Throws if config has neither `url` nor `pool`

```typescript
// CURRENT (WRONG):
if (!config.url && !config.pool) {
  throw new Error('PostgresPluginConfig must have either url or pool');  // ❌
}
```

**Impact:** Server crashes on invalid plugin config

**Fix:** Return error-state plugin instead of throwing

---

### 3. postgres-plugin.ts (Line 314)

**Issue:** Throws on Postgres connection failure during `onStart`

```typescript
// CURRENT (WRONG):
try {
  await instance.query('SELECT 1');
  logger.debug(`PostgreSQL "${instanceName}" connected`);
} catch (err) {
  logger.error(`PostgreSQL "${instanceName}" connection failed`);
  throw err;  // ❌ CRASHES SERVER
}
```

**Impact:** Server won't start if Postgres is unavailable

**Fix:** Remove throw, register unhealthy health check, continue startup

---

### 4. Product Servers (Multiple Files)

**QwickSecrets (src/index.ts):**
- Line 101: Throws if DATABASE_URL missing
- Line 105: Throws if HSM_PIN missing
- Line 111/114: Throws if credentials missing

**QwickAI (compute-service/src/index.ts):**
- Line 50: Throws if DATABASE_URL missing
- Line 54: Throws if REDIS_URL missing

**Impact:** Products crash on startup if env vars missing

**Fix:** Log errors, continue with degraded functionality

---

## Resilience Pattern

### For Plugin Connection Failures (onStart)

```typescript
async onStart(config, registry) {
  const logger = registry.getLogger(pluginId);

  try {
    await testConnection();
    logger.info('Plugin connected successfully');
  } catch (err) {
    // ✅ DON'T THROW - Log and register unhealthy
    logger.error('Plugin connection failed', { error: err.message });

    // Register unhealthy health check
    registry.registerHealthCheck({
      name: 'plugin-name',
      type: 'custom',
      check: async () => ({
        healthy: false,
        details: {
          error: err.message,
          state: 'connection_failed'
        }
      })
    });

    // ✅ CONTINUE - server stays up, plugin in error state
    return;
  }

  // Normal initialization continues...
}
```

### For Plugin Config Validation

```typescript
export function createPlugin(config: PluginConfig): Plugin {
  // Validate config
  if (!config.url) {
    // ✅ DON'T THROW - Return error-state plugin
    return {
      id: 'plugin-name',
      name: 'Plugin Name (Error State)',
      version: '1.0.0',
      onStart: async (_, registry) => {
        const logger = registry.getLogger('plugin-name');
        logger.error('Plugin unavailable: url not configured');

        registry.registerHealthCheck({
          name: 'plugin-name',
          type: 'custom',
          check: async () => ({
            healthy: false,
            details: { error: 'url not configured' }
          })
        });
      },
      onStop: async () => {},
    };
  }

  // Normal plugin creation...
}
```

### For Product Config Validation

```typescript
// ✅ DON'T THROW - Log and continue
if (!config.databaseUrl) {
  console.warn('[WARNING] DATABASE_URL not configured - database features disabled');
  // Continue without database-dependent plugins
}

// Conditional plugin registration
plugins: [
  // Only include if config available
  ...(config.databaseUrl ? [
    { plugin: createPostgresPlugin({ url: config.databaseUrl }) }
  ] : []),
]
```

---

## Implementation Priority

1. **HIGH:** Fix postgres-plugin.ts (most critical - many plugins depend on it)
2. **HIGH:** Fix cache-plugin.ts (affects performance/sessions)
3. **MEDIUM:** Fix product servers (allow degraded startup)
4. **LOW:** Review other plugins for similar patterns

---

## Testing Scenarios

After fixes, verify these scenarios work:

- [ ] Start with DATABASE_URL missing → Postgres plugin in error state, server runs
- [ ] Start with REDIS_URL missing (prod) → Cache plugin in error state, server runs
- [ ] Start with invalid DATABASE_URL → Postgres reports unhealthy, server runs
- [ ] Start with all configs valid → All plugins healthy
- [ ] Kill Redis mid-operation → Cache reports unhealthy, server continues
- [ ] Kill Postgres mid-operation → DB plugins report unhealthy, server continues
- [ ] Control panel accessible in all scenarios
- [ ] Health endpoint shows accurate plugin states

---

## Success Criteria

✅ Server **NEVER** crashes on plugin initialization failure
✅ Server **NEVER** crashes on connection failure
✅ Server **NEVER** crashes on missing config (may warn)
✅ Plugins report accurate health status
✅ Control panel remains accessible in degraded state
✅ Logs clearly indicate error states
