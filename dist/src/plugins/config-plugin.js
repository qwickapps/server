/**
 * Config Plugin
 *
 * Displays configuration and environment variables with secret masking
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Create a config display plugin
 */
export function createConfigPlugin(config) {
    return {
        id: 'config',
        name: 'Config Plugin',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('config');
            // Register root route (framework adds /config prefix automatically)
            registry.addRoute({
                method: 'get',
                path: '/',
                pluginId: 'config',
                handler: (_req, res) => {
                    const envVars = {};
                    // Get visible env vars
                    for (const key of config.show) {
                        const value = process.env[key];
                        if (value !== undefined) {
                            // Mask if in mask list
                            if (config.mask.some((m) => key.toLowerCase().includes(m.toLowerCase()))) {
                                envVars[key] = maskValue(value);
                            }
                            else {
                                envVars[key] = value;
                            }
                        }
                        else {
                            envVars[key] = '<not set>';
                        }
                    }
                    res.json({
                        environment: process.env.NODE_ENV || 'development',
                        config: envVars,
                    });
                },
            });
            // Register /validate route (framework adds /config prefix automatically)
            registry.addRoute({
                method: 'get',
                path: '/validate',
                pluginId: 'config',
                handler: (_req, res) => {
                    const results = [];
                    let allValid = true;
                    if (config.validate) {
                        for (const rule of config.validate) {
                            const value = process.env[rule.key];
                            let valid = true;
                            let message;
                            // Required check
                            if (rule.required && !value) {
                                valid = false;
                                message = `Required environment variable "${rule.key}" is not set`;
                            }
                            // Pattern check
                            if (valid && value && rule.pattern && !rule.pattern.test(value)) {
                                valid = false;
                                message = `Environment variable "${rule.key}" does not match expected pattern`;
                            }
                            // Min length check
                            if (valid && value && rule.minLength && value.length < rule.minLength) {
                                valid = false;
                                message = `Environment variable "${rule.key}" is too short (min ${rule.minLength} chars)`;
                            }
                            if (!valid) {
                                allValid = false;
                            }
                            results.push({ key: rule.key, valid, message });
                        }
                    }
                    res.json({
                        valid: allValid,
                        results,
                    });
                },
            });
            logger.debug(`Config plugin initialized with ${config.show.length} vars`);
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
/**
 * Mask a sensitive value
 */
function maskValue(value) {
    if (value.length <= 4) {
        return '****';
    }
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
}
//# sourceMappingURL=config-plugin.js.map