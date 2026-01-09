/**
 * Devices Plugin
 *
 * Device management plugin for @qwickapps/server.
 * Supports different device types through adapters (compute, mobile, IoT).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { generateDeviceToken, hashToken, isValidTokenFormat, isTokenExpired, getTokenExpiration, } from './token-utils.js';
// Store instances for helper access
let currentStore = null;
let currentAdapter = null;
let currentConfig = null;
/**
 * Create the Devices plugin
 */
export function createDevicesPlugin(config) {
    const debug = config.debug || false;
    const defaultTokenValidityDays = config.defaultTokenValidityDays || 90;
    const apiPrefix = config.api?.prefix || '/'; // Framework adds /devices prefix automatically
    function log(message, data) {
        if (debug) {
            console.log(`[DevicesPlugin] ${message}`, data || '');
        }
    }
    return {
        id: 'devices',
        name: 'Devices',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            log('Starting devices plugin', { adapter: config.adapter.name });
            // Initialize the store (creates tables if needed)
            await config.store.initialize();
            log('Devices plugin migrations complete');
            // Store references for helper access
            currentStore = config.store;
            currentAdapter = config.adapter;
            currentConfig = config;
            // Register health check
            registry.registerHealthCheck({
                name: 'devices-store',
                type: 'custom',
                check: async () => {
                    try {
                        await config.store.search({ limit: 1 });
                        return {
                            healthy: true,
                            details: {
                                adapter: config.adapter.name,
                                tokenPrefix: config.adapter.tokenPrefix,
                            },
                        };
                    }
                    catch {
                        return { healthy: false };
                    }
                },
            });
            // Add API routes if enabled
            if (config.api?.crud !== false) {
                // List/Search devices
                registry.addRoute({
                    method: 'get',
                    path: apiPrefix,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const params = {
                                org_id: req.query.org_id,
                                user_id: req.query.user_id,
                                adapter_type: req.query.adapter_type,
                                is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
                                query: req.query.q,
                                page: parseInt(req.query.page) || 1,
                                limit: Math.min(parseInt(req.query.limit) || 20, 100),
                                sortBy: req.query.sortBy || 'created_at',
                                sortOrder: req.query.sortOrder || 'desc',
                            };
                            const result = await config.store.search(params);
                            res.json(result);
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Search error:', error);
                            res.status(500).json({ error: 'Failed to search devices' });
                        }
                    },
                });
                // Get device by ID
                registry.addRoute({
                    method: 'get',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const device = await config.store.getById(req.params.id);
                            if (!device) {
                                return res.status(404).json({ error: 'Device not found' });
                            }
                            res.json(device);
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Get device error:', error);
                            res.status(500).json({ error: 'Failed to get device' });
                        }
                    },
                });
                // Create device
                registry.addRoute({
                    method: 'post',
                    path: apiPrefix,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const input = {
                                org_id: req.body.org_id,
                                user_id: req.body.user_id,
                                name: req.body.name,
                                token_validity_days: req.body.token_validity_days,
                                metadata: req.body.metadata,
                            };
                            // Validate using adapter
                            const validation = config.adapter.validateDeviceInput(input);
                            if (!validation.valid) {
                                return res.status(400).json({
                                    error: 'Validation failed',
                                    details: validation.errors,
                                });
                            }
                            // Create the device
                            const result = await registerDevice(input);
                            res.status(201).json(result);
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Create device error:', error);
                            res.status(500).json({ error: 'Failed to create device' });
                        }
                    },
                });
                // Update device
                registry.addRoute({
                    method: 'put',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const input = {
                                name: req.body.name,
                                is_active: req.body.is_active,
                                metadata: req.body.metadata,
                            };
                            const device = await config.store.update(req.params.id, input);
                            if (!device) {
                                return res.status(404).json({ error: 'Device not found' });
                            }
                            res.json(device);
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Update device error:', error);
                            res.status(500).json({ error: 'Failed to update device' });
                        }
                    },
                });
                // Delete device
                registry.addRoute({
                    method: 'delete',
                    path: `${apiPrefix}/:id`,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const device = await config.store.getById(req.params.id);
                            if (!device) {
                                return res.status(404).json({ error: 'Device not found' });
                            }
                            const deleted = await config.store.delete(req.params.id);
                            if (!deleted) {
                                return res.status(404).json({ error: 'Device not found' });
                            }
                            // Call adapter hook
                            if (config.adapter.onDeviceDeleted) {
                                await config.adapter.onDeviceDeleted(device);
                            }
                            res.status(204).send();
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Delete device error:', error);
                            res.status(500).json({ error: 'Failed to delete device' });
                        }
                    },
                });
                // Regenerate token
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/:id/regenerate-token`,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const device = await config.store.getById(req.params.id);
                            if (!device) {
                                return res.status(404).json({ error: 'Device not found' });
                            }
                            const validityDays = req.body.token_validity_days || defaultTokenValidityDays;
                            const result = await regenerateToken(req.params.id, validityDays);
                            if (!result) {
                                return res.status(500).json({ error: 'Failed to regenerate token' });
                            }
                            res.json({
                                token: result.token,
                                expires_at: result.expiresAt,
                                message: 'Token regenerated successfully. Store this token securely - it will not be shown again.',
                            });
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Regenerate token error:', error);
                            res.status(500).json({ error: 'Failed to regenerate token' });
                        }
                    },
                });
            }
            // Token verification endpoint
            if (config.api?.verify !== false) {
                registry.addRoute({
                    method: 'post',
                    path: `${apiPrefix}/verify`,
                    pluginId: 'devices',
                    handler: async (req, res) => {
                        try {
                            const { token } = req.body;
                            if (!token) {
                                return res.status(400).json({ error: 'Token is required' });
                            }
                            const clientIp = req.ip || req.socket.remoteAddress;
                            const result = await verifyDeviceToken(token, clientIp);
                            if (!result.valid) {
                                return res.status(401).json({
                                    valid: false,
                                    error: result.error,
                                });
                            }
                            res.json({
                                valid: true,
                                device: result.device,
                            });
                        }
                        catch (error) {
                            console.error('[DevicesPlugin] Verify token error:', error);
                            res.status(500).json({ error: 'Failed to verify token' });
                        }
                    },
                });
            }
            log('Devices plugin started');
        },
        async onStop() {
            log('Stopping devices plugin');
            await config.store.shutdown();
            currentStore = null;
            currentAdapter = null;
            currentConfig = null;
            log('Devices plugin stopped');
        },
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Get the current device store instance
 */
export function getDeviceStore() {
    return currentStore;
}
/**
 * Get the current device adapter instance
 */
export function getDeviceAdapter() {
    return currentAdapter;
}
/**
 * Register a new device
 */
export async function registerDevice(input) {
    if (!currentStore || !currentAdapter || !currentConfig) {
        throw new Error('Devices plugin not initialized');
    }
    // Validate using adapter
    const validation = currentAdapter.validateDeviceInput(input);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }
    // Transform metadata using adapter
    const transformedMetadata = currentAdapter.transformForStorage(input);
    // Generate token
    const tokenValidityDays = input.token_validity_days || currentConfig.defaultTokenValidityDays || 90;
    const { token, hash, prefix } = await generateDeviceToken(currentAdapter.tokenPrefix);
    const expiresAt = getTokenExpiration(tokenValidityDays);
    // Create device in store
    const device = await currentStore.create({
        ...input,
        metadata: transformedMetadata,
        tokenHash: hash,
        tokenPrefix: prefix,
        tokenExpiresAt: expiresAt,
        adapterType: currentAdapter.name,
    });
    // Call adapter hook
    if (currentAdapter.onDeviceCreated) {
        await currentAdapter.onDeviceCreated(device);
    }
    // Return device with token (token only shown once)
    return {
        ...device,
        token,
    };
}
/**
 * Verify a device token
 */
export async function verifyDeviceToken(token, clientIp) {
    if (!currentStore || !currentAdapter) {
        return { valid: false, error: 'Devices plugin not initialized' };
    }
    // Validate token format
    if (!isValidTokenFormat(token, currentAdapter.tokenPrefix)) {
        return { valid: false, error: 'Invalid token format' };
    }
    // Hash the token
    const tokenHash = await hashToken(token);
    // Look up device by token hash
    const device = await currentStore.getByTokenHash(tokenHash);
    if (!device) {
        return { valid: false, error: 'Token not found or expired' };
    }
    // Check if token is expired
    if (isTokenExpired(device.token_expires_at)) {
        return { valid: false, error: 'Token has expired' };
    }
    // Check if device is active
    if (!device.is_active) {
        return { valid: false, error: 'Device is not active' };
    }
    // Update last seen
    await currentStore.updateLastSeen(device.id, clientIp);
    // Call adapter hook
    if (currentAdapter.onDeviceVerified) {
        await currentAdapter.onDeviceVerified(device, clientIp);
    }
    return { valid: true, device };
}
/**
 * Get a device by ID
 */
export async function getDeviceById(id) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    return currentStore.getById(id);
}
/**
 * Update a device
 */
export async function updateDevice(id, input) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    return currentStore.update(id, input);
}
/**
 * Delete a device
 */
export async function deleteDevice(id) {
    if (!currentStore || !currentAdapter) {
        throw new Error('Devices plugin not initialized');
    }
    const device = await currentStore.getById(id);
    if (!device) {
        return false;
    }
    const deleted = await currentStore.delete(id);
    if (deleted && currentAdapter.onDeviceDeleted) {
        await currentAdapter.onDeviceDeleted(device);
    }
    return deleted;
}
/**
 * Regenerate token for a device
 */
export async function regenerateToken(deviceId, validityDays) {
    if (!currentStore || !currentAdapter || !currentConfig) {
        throw new Error('Devices plugin not initialized');
    }
    const device = await currentStore.getById(deviceId);
    if (!device) {
        return null;
    }
    const days = validityDays || currentConfig.defaultTokenValidityDays || 90;
    const { token, hash, prefix } = await generateDeviceToken(currentAdapter.tokenPrefix);
    const expiresAt = getTokenExpiration(days);
    const updated = await currentStore.updateToken(deviceId, hash, prefix, expiresAt);
    if (!updated) {
        return null;
    }
    return { token, expiresAt };
}
/**
 * List devices for a user
 */
export async function listUserDevices(userId) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    const result = await currentStore.search({ user_id: userId, limit: 100 });
    return result.devices;
}
/**
 * List devices for an organization
 */
export async function listOrgDevices(orgId) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    const result = await currentStore.search({ org_id: orgId, limit: 100 });
    return result.devices;
}
/**
 * Deactivate a device
 */
export async function deactivateDevice(id) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    const device = await currentStore.update(id, { is_active: false });
    return device !== null;
}
/**
 * Activate a device
 */
export async function activateDevice(id) {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    const device = await currentStore.update(id, { is_active: true });
    return device !== null;
}
/**
 * Cleanup expired device tokens
 */
export async function cleanupExpiredTokens() {
    if (!currentStore) {
        throw new Error('Devices plugin not initialized');
    }
    return currentStore.cleanupExpired();
}
//# sourceMappingURL=devices-plugin.js.map