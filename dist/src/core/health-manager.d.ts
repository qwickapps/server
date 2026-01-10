/**
 * Health Check Manager
 *
 * Manages health checks for various services and provides aggregated status
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { HealthCheck, HealthCheckResult, HealthStatus, Logger } from './types.js';
export declare class HealthManager {
    private checks;
    private results;
    private intervals;
    private logger;
    constructor(logger: Logger);
    /**
     * Register a health check
     */
    register(check: HealthCheck): void;
    /**
     * Run a health check
     */
    private runCheck;
    /**
     * Run HTTP health check
     */
    private runHttpCheck;
    /**
     * Run TCP health check (simplified - just tries to connect)
     */
    private runTcpCheck;
    /**
     * Get all health check results
     */
    getResults(): Record<string, HealthCheckResult>;
    /**
     * Get specific health check result
     */
    getResult(name: string): HealthCheckResult | undefined;
    /**
     * Get aggregated status
     *
     * Returns 'degraded' instead of 'unhealthy' when subsystems fail,
     * allowing the service to remain available even when dependencies are down.
     * This ensures the control panel and other features remain accessible.
     */
    getAggregatedStatus(): HealthStatus;
    /**
     * Force run all checks
     */
    checkAll(): Promise<void>;
    /**
     * Shutdown - clear all intervals
     */
    shutdown(): void;
}
//# sourceMappingURL=health-manager.d.ts.map