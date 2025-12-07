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
import { resolve, dirname } from 'node:path';
import { Logger as QwickLogger, getLogger, LogLevel, LogTransport } from '@qwickapps/logging';
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

// Default configuration
const DEFAULT_CONFIG: Required<LoggingConfig> = {
  namespace: 'ControlPanel',
  level: (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  logDir: process.env.LOG_DIR || './logs',
  fileLogging: process.env.LOG_FILE !== 'false',
  consoleOutput: process.env.LOG_CONSOLE !== 'false',
};

/**
 * File transport for writing logs to disk
 * Used when pino is not available or as additional transport
 */
class FileLogTransport implements LogTransport {
  private logPath: string;
  private errorLogPath: string;

  constructor(logDir: string) {
    this.logPath = resolve(logDir, 'app.log');
    this.errorLogPath = resolve(logDir, 'error.log');
    this.ensureLogDir(logDir);
  }

  private ensureLogDir(logDir: string): void {
    const resolvedDir = resolve(logDir);
    if (!existsSync(resolvedDir)) {
      mkdirSync(resolvedDir, { recursive: true });
    }
  }

  handle(level: LogLevel, namespace: string, message: string, context?: Record<string, any>): void {
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
    } catch {
      // Silently fail - don't let logging errors break the application
    }
  }
}

/**
 * Logging subsystem instance
 */
class LoggingSubsystem {
  private config: Required<LoggingConfig>;
  private rootLogger: QwickLogger;
  private fileTransport: FileLogTransport | null = null;
  private initialized = false;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.rootLogger = getLogger(this.config.namespace);
  }

  /**
   * Initialize the logging subsystem with configuration
   */
  initialize(config: LoggingConfig = {}): void {
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
    } else {
      this.rootLogger.setConfig({
        level: this.config.level,
        disableConsole: !this.config.consoleOutput,
      });
    }

    this.initialized = true;
    this.rootLogger.info('Logging subsystem initialized', {
      logDir: this.config.logDir,
      level: this.config.level,
      fileLogging: this.config.fileLogging,
      consoleOutput: this.config.consoleOutput,
      usingPino: this.rootLogger.isUsingPino(),
    });
  }

  /**
   * Get a logger for a specific component/plugin
   */
  getLogger(namespace: string): Logger {
    const childLogger = this.rootLogger.child(namespace);

    // Return a Logger interface compatible with control-panel types
    return {
      debug: (message: string, data?: Record<string, unknown>) => {
        childLogger.debug(message, data || {});
      },
      info: (message: string, data?: Record<string, unknown>) => {
        childLogger.info(message, data || {});
      },
      warn: (message: string, data?: Record<string, unknown>) => {
        childLogger.warn(message, data || {});
      },
      error: (message: string, data?: Record<string, unknown>) => {
        childLogger.error(message, data || {});
      },
    };
  }

  /**
   * Get the root logger
   */
  getRootLogger(): Logger {
    return this.getLogger('Core');
  }

  /**
   * Check if file logging is enabled and working
   */
  isFileLoggingEnabled(): boolean {
    return this.config.fileLogging && this.fileTransport !== null;
  }

  /**
   * Get the log directory path
   */
  getLogDir(): string {
    return resolve(this.config.logDir);
  }

  /**
   * Get the default log file paths
   */
  getLogPaths(): { appLog: string; errorLog: string } {
    return {
      appLog: resolve(this.config.logDir, 'app.log'),
      errorLog: resolve(this.config.logDir, 'error.log'),
    };
  }
}

// Singleton instance
let loggingSubsystem: LoggingSubsystem | null = null;

/**
 * Get or create the logging subsystem
 */
export function getLoggingSubsystem(): LoggingSubsystem {
  if (!loggingSubsystem) {
    loggingSubsystem = new LoggingSubsystem();
  }
  return loggingSubsystem;
}

/**
 * Initialize the logging subsystem with configuration
 */
export function initializeLogging(config: LoggingConfig = {}): LoggingSubsystem {
  const subsystem = getLoggingSubsystem();
  subsystem.initialize(config);
  return subsystem;
}

/**
 * Get a logger for a specific namespace
 */
export function getControlPanelLogger(namespace: string): Logger {
  return getLoggingSubsystem().getLogger(namespace);
}

/**
 * Export for convenience
 */
export { LoggingSubsystem };
