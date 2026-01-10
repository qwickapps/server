/**
 * Devices Plugin
 *
 * Device management plugin for @qwickapps/server.
 * Supports different device types through adapters (compute, mobile, IoT).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Plugin } from '../../core/plugin-registry.js';
import type { DevicesPluginConfig, DeviceStore, DeviceAdapter, Device, DeviceWithToken, CreateDeviceInput, UpdateDeviceInput, TokenVerificationResult } from './types.js';
/**
 * Create the Devices plugin
 */
export declare function createDevicesPlugin(config: DevicesPluginConfig): Plugin;
/**
 * Get the current device store instance
 */
export declare function getDeviceStore(): DeviceStore | null;
/**
 * Get the current device adapter instance
 */
export declare function getDeviceAdapter(): DeviceAdapter | null;
/**
 * Register a new device
 */
export declare function registerDevice(input: CreateDeviceInput): Promise<DeviceWithToken>;
/**
 * Verify a device token
 */
export declare function verifyDeviceToken(token: string, clientIp?: string): Promise<TokenVerificationResult>;
/**
 * Get a device by ID
 */
export declare function getDeviceById(id: string): Promise<Device | null>;
/**
 * Update a device
 */
export declare function updateDevice(id: string, input: UpdateDeviceInput): Promise<Device | null>;
/**
 * Delete a device
 */
export declare function deleteDevice(id: string): Promise<boolean>;
/**
 * Regenerate token for a device
 */
export declare function regenerateToken(deviceId: string, validityDays?: number): Promise<{
    token: string;
    expiresAt: Date;
} | null>;
/**
 * List devices for a user
 */
export declare function listUserDevices(userId: string): Promise<Device[]>;
/**
 * List devices for an organization
 */
export declare function listOrgDevices(orgId: string): Promise<Device[]>;
/**
 * Deactivate a device
 */
export declare function deactivateDevice(id: string): Promise<boolean>;
/**
 * Activate a device
 */
export declare function activateDevice(id: string): Promise<boolean>;
/**
 * Cleanup expired device tokens
 */
export declare function cleanupExpiredTokens(): Promise<number>;
//# sourceMappingURL=devices-plugin.d.ts.map