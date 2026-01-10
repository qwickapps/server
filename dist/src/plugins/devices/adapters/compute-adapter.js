/**
 * Compute Device Adapter
 *
 * Adapter for computing devices (laptops, desktops, containers).
 * Used by QwickForge for CLI device management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
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
export function computeDeviceAdapter(config = {}) {
    const { tokenPrefix = 'qwf_dev', requireHostname = false, allowedOS, } = config;
    return {
        name: 'compute',
        tokenPrefix,
        validateDeviceInput(input) {
            const errors = [];
            const metadata = input.metadata;
            // Validate name
            if (!input.name || input.name.trim().length === 0) {
                errors.push('Device name is required');
            }
            if (input.name && input.name.length > 255) {
                errors.push('Device name must be 255 characters or less');
            }
            // Validate hostname if required
            if (requireHostname && (!metadata?.hostname || metadata.hostname.trim().length === 0)) {
                errors.push('Hostname is required for compute devices');
            }
            // Validate OS if allowedOS is specified
            if (allowedOS && metadata?.os) {
                if (!allowedOS.includes(metadata.os)) {
                    errors.push(`OS '${metadata.os}' is not allowed. Allowed: ${allowedOS.join(', ')}`);
                }
            }
            // Validate architecture
            if (metadata?.arch) {
                const validArchs = ['x64', 'arm64', 'ia32', 'arm'];
                if (!validArchs.includes(metadata.arch)) {
                    errors.push(`Invalid architecture '${metadata.arch}'. Valid: ${validArchs.join(', ')}`);
                }
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
            };
        },
        transformForStorage(input) {
            const metadata = (input.metadata || {});
            // Ensure compute-specific defaults
            return {
                hostname: metadata.hostname || null,
                os: metadata.os || null,
                os_version: metadata.os_version || null,
                arch: metadata.arch || null,
                cli_capabilities: metadata.cli_capabilities || [],
                container_id: metadata.container_id || null,
                node_version: metadata.node_version || null,
            };
        },
        transformFromStorage(row) {
            const metadata = (row.metadata || {});
            // Extract compute-specific fields from metadata
            return {
                hostname: metadata.hostname,
                os: metadata.os,
                os_version: metadata.os_version,
                arch: metadata.arch,
                cli_capabilities: metadata.cli_capabilities || [],
                container_id: metadata.container_id,
                node_version: metadata.node_version,
            };
        },
        async onDeviceCreated(device) {
            // Optional: Log device creation, send notifications, etc.
            console.log(`[ComputeAdapter] Device created: ${device.name} (${device.id})`);
        },
        async onDeviceDeleted(device) {
            // Optional: Cleanup, revoke certificates, etc.
            console.log(`[ComputeAdapter] Device deleted: ${device.name} (${device.id})`);
        },
        async onDeviceVerified(device, ip) {
            // Optional: Log device verification, track activity
            console.log(`[ComputeAdapter] Device verified: ${device.name} from ${ip || 'unknown'}`);
        },
    };
}
//# sourceMappingURL=compute-adapter.js.map