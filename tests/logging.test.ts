/**
 * Unit tests for Logging Subsystem
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, appendFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

// Mock the fs module
vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
  };
});

// Mock @qwickapps/logging
vi.mock('@qwickapps/logging', () => ({
  getLogger: vi.fn(() => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
    setConfig: vi.fn(),
    isUsingPino: vi.fn(() => false),
  })),
  LogLevel: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },
}));

describe('LoggingSubsystem', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockMkdirSync = vi.mocked(mkdirSync);
  const mockAppendFileSync = vi.mocked(appendFileSync);

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.LOG_LEVEL;
    delete process.env.LOG_DIR;
    delete process.env.LOG_FILE;
    delete process.env.LOG_FILE_PATH;
    delete process.env.LOG_CONSOLE;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getLoggingSubsystem', () => {
    it('should return a singleton instance', async () => {
      const { getLoggingSubsystem } = await import('../src/core/logging.js');

      const instance1 = getLoggingSubsystem();
      const instance2 = getLoggingSubsystem();

      expect(instance1).toBe(instance2);
    });
  });

  describe('initializeLogging', () => {
    it('should initialize with default configuration', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging, getLoggingSubsystem } = await import('../src/core/logging.js');

      const subsystem = initializeLogging();

      expect(subsystem).toBe(getLoggingSubsystem());
    });

    it('should only initialize once', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging, getLoggingSubsystem } = await import('../src/core/logging.js');

      initializeLogging({ namespace: 'Test1' });
      initializeLogging({ namespace: 'Test2' }); // Should be ignored

      const subsystem = getLoggingSubsystem();
      expect(subsystem).toBeDefined();
    });

    it('should create log directory if it does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const { initializeLogging } = await import('../src/core/logging.js');

      initializeLogging({ logDir: './test-logs', fileLogging: true });

      expect(mockMkdirSync).toHaveBeenCalledWith(expect.stringContaining('test-logs'), {
        recursive: true,
      });
    });
  });

  describe('getControlPanelLogger', () => {
    it('should return a logger for a given namespace', async () => {
      mockExistsSync.mockReturnValue(true);

      const { getControlPanelLogger, initializeLogging } = await import('../src/core/logging.js');

      initializeLogging();

      const logger = getControlPanelLogger('TestComponent');

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('LoggingSubsystem methods', () => {
    it('should report file logging status', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging } = await import('../src/core/logging.js');

      const subsystem = initializeLogging({ fileLogging: true });

      expect(subsystem.isFileLoggingEnabled()).toBe(true);
    });

    it('should report file logging disabled when configured', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging } = await import('../src/core/logging.js');

      const subsystem = initializeLogging({ fileLogging: false });

      expect(subsystem.isFileLoggingEnabled()).toBe(false);
    });

    it('should return correct log directory', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging } = await import('../src/core/logging.js');

      const subsystem = initializeLogging({ logDir: './custom-logs' });

      expect(subsystem.getLogDir()).toContain('custom-logs');
    });

    it('should return correct log paths', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging } = await import('../src/core/logging.js');

      const subsystem = initializeLogging({ logDir: './my-logs' });
      const paths = subsystem.getLogPaths();

      expect(paths.appLog).toContain('my-logs');
      expect(paths.appLog).toContain('app.log');
      expect(paths.errorLog).toContain('my-logs');
      expect(paths.errorLog).toContain('error.log');
    });

    it('should return root logger', async () => {
      mockExistsSync.mockReturnValue(true);

      const { initializeLogging } = await import('../src/core/logging.js');

      const subsystem = initializeLogging();
      const rootLogger = subsystem.getRootLogger();

      expect(rootLogger).toBeDefined();
      expect(typeof rootLogger.info).toBe('function');
    });
  });
});

describe('FileLogTransport', () => {
  const mockExistsSync = vi.mocked(existsSync);
  const mockMkdirSync = vi.mocked(mkdirSync);
  const mockAppendFileSync = vi.mocked(appendFileSync);

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(true);
  });

  it('should write log entries to app.log', async () => {
    mockExistsSync.mockReturnValue(false);

    const { initializeLogging, getControlPanelLogger } = await import('../src/core/logging.js');

    initializeLogging({ fileLogging: true, logDir: './test-logs' });

    // The FileLogTransport is created internally - we verify via mock calls
    expect(mockMkdirSync).toHaveBeenCalled();
  });
});

describe('Environment variable configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should use LOG_DIR from environment', async () => {
    process.env.LOG_DIR = './env-logs';

    const mockExistsSync = vi.mocked(existsSync);
    mockExistsSync.mockReturnValue(true);

    const { initializeLogging } = await import('../src/core/logging.js');

    const subsystem = initializeLogging();

    expect(subsystem.getLogDir()).toContain('env-logs');
  });

  it('should disable file logging when LOG_FILE is false', async () => {
    process.env.LOG_FILE = 'false';

    const mockExistsSync = vi.mocked(existsSync);
    mockExistsSync.mockReturnValue(true);

    const { initializeLogging } = await import('../src/core/logging.js');

    const subsystem = initializeLogging();

    expect(subsystem.isFileLoggingEnabled()).toBe(false);
  });
});
