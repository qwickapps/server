/**
 * Health Check Manager
 *
 * Manages health checks for various services and provides aggregated status
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export class HealthManager {
    constructor(logger) {
        this.checks = new Map();
        this.results = new Map();
        this.intervals = new Map();
        this.logger = logger;
    }
    /**
     * Register a health check
     */
    register(check) {
        this.checks.set(check.name, check);
        // Initialize result
        this.results.set(check.name, {
            status: 'unknown',
            lastChecked: new Date(),
        });
        // Start periodic check
        const interval = check.interval || 30000; // Default 30 seconds
        this.runCheck(check.name);
        const timer = setInterval(() => {
            this.runCheck(check.name);
        }, interval);
        this.intervals.set(check.name, timer);
        this.logger.debug(`Health check registered: ${check.name} (${check.type}, ${interval}ms)`);
    }
    /**
     * Run a health check
     */
    async runCheck(name) {
        const check = this.checks.get(name);
        if (!check)
            return;
        const startTime = Date.now();
        const timeout = check.timeout || 5000;
        try {
            let result;
            switch (check.type) {
                case 'http':
                    result = await this.runHttpCheck(check, timeout);
                    break;
                case 'tcp':
                    result = await this.runTcpCheck(check, timeout);
                    break;
                case 'custom':
                    if (check.check) {
                        result = await Promise.race([
                            check.check(),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout)),
                        ]);
                    }
                    else {
                        result = { healthy: false, details: { error: 'No check function provided' } };
                    }
                    break;
                default:
                    result = { healthy: false, details: { error: 'Unknown check type' } };
            }
            const latency = result.latency || Date.now() - startTime;
            this.results.set(name, {
                status: result.healthy ? 'healthy' : 'unhealthy',
                latency,
                lastChecked: new Date(),
                details: result.details,
            });
        }
        catch (error) {
            const latency = Date.now() - startTime;
            const message = error instanceof Error ? error.message : String(error);
            this.results.set(name, {
                status: 'unhealthy',
                latency,
                message,
                lastChecked: new Date(),
            });
            this.logger.warn(`Health check failed: ${name} - ${message}`);
        }
    }
    /**
     * Run HTTP health check
     */
    async runHttpCheck(check, timeout) {
        if (!check.url) {
            return { healthy: false, details: { error: 'No URL provided' } };
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const startTime = Date.now();
            const response = await fetch(check.url, {
                method: 'GET',
                signal: controller.signal,
            });
            const latency = Date.now() - startTime;
            clearTimeout(timeoutId);
            return {
                healthy: response.ok,
                latency,
                details: {
                    status: response.status,
                    statusText: response.statusText,
                },
            };
        }
        catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    /**
     * Run TCP health check (simplified - just tries to connect)
     */
    async runTcpCheck(check, timeout) {
        if (!check.host || !check.port) {
            return { healthy: false, details: { error: 'Host and port required for TCP check' } };
        }
        // Use HTTP check as a proxy for TCP (simplified for browser compatibility)
        // In a real Node.js environment, you'd use net.createConnection
        const url = `http://${check.host}:${check.port}`;
        try {
            return await this.runHttpCheck({ ...check, url }, timeout);
        }
        catch {
            // TCP check failed
            return {
                healthy: false,
                details: { error: `Cannot connect to ${check.host}:${check.port}` },
            };
        }
    }
    /**
     * Get all health check results
     */
    getResults() {
        return Object.fromEntries(this.results);
    }
    /**
     * Get specific health check result
     */
    getResult(name) {
        return this.results.get(name);
    }
    /**
     * Get aggregated status
     *
     * Returns 'degraded' instead of 'unhealthy' when subsystems fail,
     * allowing the service to remain available even when dependencies are down.
     * This ensures the control panel and other features remain accessible.
     */
    getAggregatedStatus() {
        const results = Array.from(this.results.values());
        if (results.length === 0)
            return 'unknown';
        const unhealthyCount = results.filter((r) => r.status === 'unhealthy').length;
        const degradedCount = results.filter((r) => r.status === 'degraded').length;
        // Return 'degraded' instead of 'unhealthy' to keep service available (HTTP 200)
        if (unhealthyCount > 0)
            return 'degraded';
        if (degradedCount > 0)
            return 'degraded';
        const hasUnknown = results.some((r) => r.status === 'unknown');
        if (hasUnknown)
            return 'unknown';
        return 'healthy';
    }
    /**
     * Force run all checks
     */
    async checkAll() {
        const promises = Array.from(this.checks.keys()).map((name) => this.runCheck(name));
        await Promise.all(promises);
    }
    /**
     * Shutdown - clear all intervals
     */
    shutdown() {
        for (const timer of this.intervals.values()) {
            clearInterval(timer);
        }
        this.intervals.clear();
        this.logger.debug('Health manager shutdown complete');
    }
}
//# sourceMappingURL=health-manager.js.map