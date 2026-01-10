/**
 * Control Panel Logging Subsystem
 *
 * Provides centralized logging for the control panel and all plugins.
 * Configures @qwickapps/logging to write to files that the LogsPage can display.
 *
 * Environment Variables:
 *   LOG_LEVEL          - Minimum log level (debug, info, warn, error). Default: debug in dev, info in prod
 *   LOG_DIR            - Directory for log files. Default: ./logs
 *   LOG_FILE           - Enable file logging. Default: true
 *   LOG_FILE_PATH      - Path to log file. Default: ./logs/app.log (used by pino if available)
 *   LOG_CONSOLE        - Enable console output. Default: true
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { LogLevel } from '@qwickapps/logging';
import type { Logger } from './types.js';
export interface LoggingConfig {
    /** Product namespace for log entries */
    namespace?: string;
    /** Minimum log level */
    level?: LogLevel;
    /** Directory for log files */
    logDir?: string;
    /** Enable file logging */
    fileLogging?: boolean;
    /** Enable console output */
    consoleOutput?: boolean;
}
/**
 * Logging subsystem instance
 */
declare class LoggingSubsystem {
    private config;
    private rootLogger;
    private fileTransport;
    private initialized;
    constructor();
    /**
     * Initialize the logging subsystem with configuration
     */
    initialize(config?: LoggingConfig): void;
    /**
     * Get a logger for a specific component/plugin
     */
    getLogger(namespace: string): Logger;
    /**
     * Get the root logger
     */
    getRootLogger(): Logger;
    /**
     * Check if file logging is enabled and working
     */
    isFileLoggingEnabled(): boolean;
    /**
     * Get the log directory path
     */
    getLogDir(): string;
    /**
     * Get the default log file paths
     */
    getLogPaths(): {
        appLog: string;
        errorLog: string;
    };
}
/**
 * Get or create the logging subsystem
 */
export declare function getLoggingSubsystem(): LoggingSubsystem;
/**
 * Initialize the logging subsystem with configuration
 */
export declare function initializeLogging(config?: LoggingConfig): LoggingSubsystem;
/**
 * Get a logger for a specific namespace
 */
export declare function getControlPanelLogger(namespace: string): Logger;
/**
 * Export for convenience
 */
export { LoggingSubsystem };
//# sourceMappingURL=logging.d.ts.map