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
import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getLogger } from '@qwickapps/logging';
// Default configuration
const DEFAULT_CONFIG = {
    namespace: 'App',
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    logDir: process.env.LOG_DIR || './logs',
    fileLogging: process.env.LOG_FILE !== 'false',
    consoleOutput: process.env.LOG_CONSOLE !== 'false',
};
/**
 * File transport for writing logs to disk
 * Used when pino is not available or as additional transport
 */
class FileLogTransport {
    constructor(logDir) {
        this.logPath = resolve(logDir, 'app.log');
        this.errorLogPath = resolve(logDir, 'error.log');
        this.ensureLogDir(logDir);
    }
    ensureLogDir(logDir) {
        const resolvedDir = resolve(logDir);
        if (!existsSync(resolvedDir)) {
            mkdirSync(resolvedDir, { recursive: true });
        }
    }
    handle(level, namespace, message, context) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            ns: namespace,
            msg: message,
            ...context,
        };
        const line = JSON.stringify(entry) + '\n';
        try {
            // Write to app.log
            appendFileSync(this.logPath, line);
            // Also write errors to error.log
            if (level === 'error') {
                appendFileSync(this.errorLogPath, line);
            }
        }
        catch {
            // Silently fail - don't let logging errors break the application
        }
    }
}
/**
 * Logging subsystem instance
 */
class LoggingSubsystem {
    constructor() {
        this.fileTransport = null;
        this.initialized = false;
        this.config = { ...DEFAULT_CONFIG };
        this.rootLogger = getLogger(this.config.namespace);
    }
    /**
     * Initialize the logging subsystem with configuration
     */
    initialize(config = {}) {
        if (this.initialized) {
            return;
        }
        this.config = { ...DEFAULT_CONFIG, ...config };
        // Set up file transport if enabled
        if (this.config.fileLogging) {
            this.fileTransport = new FileLogTransport(this.config.logDir);
            // Configure the root logger with file transport
            this.rootLogger.setConfig({
                level: this.config.level,
                disableConsole: !this.config.consoleOutput,
                transports: [this.fileTransport],
            });
            // Set LOG_FILE_PATH for pino (if available)
            if (!process.env.LOG_FILE_PATH) {
                process.env.LOG_FILE = 'true';
                process.env.LOG_FILE_PATH = resolve(this.config.logDir, 'app.log');
            }
        }
        else {
            this.rootLogger.setConfig({
                level: this.config.level,
                disableConsole: !this.config.consoleOutput,
            });
        }
        this.initialized = true;
        this.rootLogger.debug('Logging initialized', {
            level: this.config.level,
        });
    }
    /**
     * Get a logger for a specific component/plugin
     */
    getLogger(namespace) {
        const childLogger = this.rootLogger.child(namespace);
        // Return a Logger interface compatible with control-panel types
        return {
            debug: (message, data) => {
                childLogger.debug(message, data || {});
            },
            info: (message, data) => {
                childLogger.info(message, data || {});
            },
            warn: (message, data) => {
                childLogger.warn(message, data || {});
            },
            error: (message, data) => {
                childLogger.error(message, data || {});
            },
        };
    }
    /**
     * Get the root logger
     */
    getRootLogger() {
        return this.getLogger('Core');
    }
    /**
     * Check if file logging is enabled and working
     */
    isFileLoggingEnabled() {
        return this.config.fileLogging && this.fileTransport !== null;
    }
    /**
     * Get the log directory path
     */
    getLogDir() {
        return resolve(this.config.logDir);
    }
    /**
     * Get the default log file paths
     */
    getLogPaths() {
        return {
            appLog: resolve(this.config.logDir, 'app.log'),
            errorLog: resolve(this.config.logDir, 'error.log'),
        };
    }
}
// Singleton instance
let loggingSubsystem = null;
/**
 * Get or create the logging subsystem
 */
export function getLoggingSubsystem() {
    if (!loggingSubsystem) {
        loggingSubsystem = new LoggingSubsystem();
    }
    return loggingSubsystem;
}
/**
 * Initialize the logging subsystem with configuration
 */
export function initializeLogging(config = {}) {
    const subsystem = getLoggingSubsystem();
    subsystem.initialize(config);
    return subsystem;
}
/**
 * Get a logger for a specific namespace
 */
export function getControlPanelLogger(namespace) {
    return getLoggingSubsystem().getLogger(namespace);
}
/**
 * Export for convenience
 */
export { LoggingSubsystem };
//# sourceMappingURL=logging.js.map