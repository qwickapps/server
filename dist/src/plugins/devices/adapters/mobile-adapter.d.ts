/**
 * Mobile Device Adapter
 *
 * Adapter for mobile devices (phones, tablets).
 * Used by QwickBot for mobile app device management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { DeviceAdapter } from '../types.js';
/**
 * Mobile adapter configuration
 */
export interface MobileAdapterConfig {
    /** Token prefix (default: 'qwb_mob') */
    tokenPrefix?: string;
    /** Require device model in metadata */
    requireDeviceModel?: boolean;
    /** Require app version in metadata */
    requireAppVersion?: boolean;
    /** Allowed OS names (optional, allows all if not specified) */
    allowedOS?: string[];
    /** Minimum app version (optional, uses semver) */
    minAppVersion?: string;
}
/**
 * Create a mobile device adapter
 *
 * @param config - Adapter configuration
 * @returns DeviceAdapter for mobile devices
 *
 * @example
 * ```ts
 * const adapter = mobileDeviceAdapter({
 *   tokenPrefix: 'qwb_mob',
 *   requireDeviceModel: true,
 *   allowedOS: ['iOS', 'Android'],
 * });
 * ```
 */
export declare function mobileDeviceAdapter(config?: MobileAdapterConfig): DeviceAdapter;
//# sourceMappingURL=mobile-adapter.d.ts.map