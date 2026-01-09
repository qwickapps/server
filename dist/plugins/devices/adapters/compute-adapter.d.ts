/**
 * Compute Device Adapter
 *
 * Adapter for computing devices (laptops, desktops, containers).
 * Used by QwickForge for CLI device management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { DeviceAdapter } from '../types.js';
/**
 * Compute adapter configuration
 */
export interface ComputeAdapterConfig {
    /** Token prefix (default: 'qwf_dev') */
    tokenPrefix?: string;
    /** Require hostname in metadata */
    requireHostname?: boolean;
    /** Allowed OS types (optional, allows all if not specified) */
    allowedOS?: string[];
}
/**
 * Create a compute device adapter
 *
 * @param config - Adapter configuration
 * @returns DeviceAdapter for compute devices
 *
 * @example
 * ```ts
 * const adapter = computeDeviceAdapter({
 *   tokenPrefix: 'qwf_dev',
 *   requireHostname: true,
 * });
 * ```
 */
export declare function computeDeviceAdapter(config?: ComputeAdapterConfig): DeviceAdapter;
//# sourceMappingURL=compute-adapter.d.ts.map