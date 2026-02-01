/**
 * Maintenance Plugin
 *
 * Provides operational UI for Payload CMS-based applications:
 * - Seed script management and execution
 * - Service control (start/stop/restart)
 * - Environment variable management
 * - Database backup and restore operations
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import type { Response } from 'express';
import type { Plugin } from '../core/plugin-registry.js';
/**
 * Custom seed task handler
 */
export interface SeedTaskHandler {
    (options?: Record<string, any>, res?: Response): Promise<void>;
}
/**
 * Custom seed task definition
 */
export interface SeedTask {
    /** Unique task identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description of what this task does */
    description: string;
    /** Task handler function */
    handler: SeedTaskHandler;
    /** Optional task options/parameters */
    options?: Record<string, any>;
}
export interface MaintenancePluginConfig {
    /** Path to scripts directory (default: './scripts') */
    scriptsPath?: string;
    /** Path to .env file (default: './.env.local') */
    envFilePath?: string;
    /** Database connection URL (for backup/restore) */
    databaseUrl?: string;
    /** Backup storage path (default: './backups') */
    backupsPath?: string;
    /** Enable seed management (default: true) */
    enableSeeds?: boolean;
    /** Enable service control (default: true) */
    enableServiceControl?: boolean;
    /** Enable environment variable management (default: true) */
    enableEnvManagement?: boolean;
    /** Enable database operations (default: true) */
    enableDatabaseOps?: boolean;
    /** Custom seed tasks */
    customTasks?: SeedTask[];
}
/**
 * Create a maintenance plugin
 */
export declare function createMaintenancePlugin(config?: MaintenancePluginConfig): Plugin;
//# sourceMappingURL=maintenance-plugin.d.ts.map