/**
 * Mobile Device Adapter
 *
 * Adapter for mobile devices (phones, tablets).
 * Used by QwickBot for mobile app device management.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Compare semver versions (simplified)
 */
function compareSemver(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2)
            return 1;
        if (p1 < p2)
            return -1;
    }
    return 0;
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
export function mobileDeviceAdapter(config = {}) {
    const { tokenPrefix = 'qwb_mob', requireDeviceModel = false, requireAppVersion = false, allowedOS, minAppVersion, } = config;
    return {
        name: 'mobile',
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
            // Validate device model if required
            if (requireDeviceModel && (!metadata?.device_model || metadata.device_model.trim().length === 0)) {
                errors.push('Device model is required for mobile devices');
            }
            // Validate app version if required
            if (requireAppVersion && (!metadata?.app_version || metadata.app_version.trim().length === 0)) {
                errors.push('App version is required for mobile devices');
            }
            // Validate OS if allowedOS is specified
            if (allowedOS && metadata?.os_name) {
                if (!allowedOS.includes(metadata.os_name)) {
                    errors.push(`OS '${metadata.os_name}' is not supported. Supported: ${allowedOS.join(', ')}`);
                }
            }
            // Validate minimum app version
            if (minAppVersion && metadata?.app_version) {
                if (compareSemver(metadata.app_version, minAppVersion) < 0) {
                    errors.push(`App version ${metadata.app_version} is below minimum required version ${minAppVersion}`);
                }
            }
            // Validate screen dimensions if provided
            if (metadata?.screen_width !== undefined && metadata.screen_width <= 0) {
                errors.push('Screen width must be a positive number');
            }
            if (metadata?.screen_height !== undefined && metadata.screen_height <= 0) {
                errors.push('Screen height must be a positive number');
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
            };
        },
        transformForStorage(input) {
            const metadata = (input.metadata || {});
            // Ensure mobile-specific defaults
            return {
                device_model: metadata.device_model || null,
                os_name: metadata.os_name || null,
                os_version: metadata.os_version || null,
                app_version: metadata.app_version || null,
                push_token: metadata.push_token || null,
                screen_width: metadata.screen_width || null,
                screen_height: metadata.screen_height || null,
            };
        },
        transformFromStorage(row) {
            const metadata = (row.metadata || {});
            // Extract mobile-specific fields from metadata
            return {
                device_model: metadata.device_model,
                os_name: metadata.os_name,
                os_version: metadata.os_version,
                app_version: metadata.app_version,
                push_token: metadata.push_token,
                screen_width: metadata.screen_width,
                screen_height: metadata.screen_height,
            };
        },
        async onDeviceCreated(device) {
            // Optional: Log device creation, track in analytics, etc.
            console.log(`[MobileAdapter] Device registered: ${device.name} (${device.id})`);
        },
        async onDeviceDeleted(device) {
            // Optional: Unregister push token, cleanup, etc.
            const metadata = device.metadata;
            if (metadata?.push_token) {
                console.log(`[MobileAdapter] Should unregister push token for device: ${device.id}`);
            }
            console.log(`[MobileAdapter] Device deleted: ${device.name} (${device.id})`);
        },
        async onDeviceVerified(device, ip) {
            // Optional: Log device verification, track activity
            console.log(`[MobileAdapter] Device verified: ${device.name} from ${ip || 'unknown'}`);
        },
    };
}
//# sourceMappingURL=mobile-adapter.js.map