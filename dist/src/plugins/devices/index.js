/**
 * Devices Plugin
 *
 * Device management plugin with adapter support.
 * Exports all device-related functionality.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Main plugin
export { createDevicesPlugin, getDeviceStore, getDeviceAdapter, registerDevice, verifyDeviceToken, getDeviceById, updateDevice, deleteDevice, regenerateToken, listUserDevices, listOrgDevices, deactivateDevice, activateDevice, cleanupExpiredTokens, } from './devices-plugin.js';
// Stores
export { postgresDeviceStore } from './stores/index.js';
// Adapters
export { computeDeviceAdapter } from './adapters/index.js';
export { mobileDeviceAdapter } from './adapters/index.js';
// Token utilities
export { generateDeviceToken, generatePairingCode, hashToken, verifyToken, isValidTokenFormat, isTokenExpired, getTokenExpiration, DeviceTokens, } from './token-utils.js';
// UI Components
export { DevicesStatusWidget } from './DevicesStatusWidget.js';
export { DevicesManagementPage } from './DevicesManagementPage.js';
//# sourceMappingURL=index.js.map