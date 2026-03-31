/**
 * Seed Executor
 *
 * Executes seed scripts in isolated child processes and streams output via SSE.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { spawn, type ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import { resolve, relative } from 'path';
import type { Response } from 'express';

/**
 * Result of seed execution
 */
export interface SeedExecutionResult {
  exitCode: number;
  duration: number;
  output: string;
  error: string;
}

/**
 * SSE event types
 */
type SSEEventType = 'stdout' | 'stderr' | 'exit' | 'error';

interface SSEEvent {
  type: SSEEventType;
  data: string;
  timestamp: string;
}

/**
 * Maximum output size to store (100KB)
 */
const MAX_OUTPUT_SIZE = 100 * 1024;

/**
 * Validate script path to prevent path traversal attacks
 *
 * @param scriptPath - Relative path to the script (e.g., "database/001.init.mjs" or "01-Setup/seed-data.mjs")
 * @param scriptsPath - Base path for scripts directory
 * @returns Resolved absolute path if valid, null if invalid
 */
export function validateScriptPath(scriptPath: string, scriptsPath: string): string | null {
  // Only allow .mjs and .ts files
  if (!scriptPath.endsWith('.mjs') && !scriptPath.endsWith('.ts')) {
    return null;
  }

  // Resolve paths
  const basePath = resolve(scriptsPath);
  const resolvedScriptPath = resolve(basePath, scriptPath);

  // Ensure resolved path is within scriptsPath (prevent path traversal)
  // Use relative() for platform-agnostic check (works on Windows and Unix)
  const relativePath = relative(basePath, resolvedScriptPath);
  if (relativePath.startsWith('..') || relativePath.includes('../') || relativePath.includes('..\\')) {
    return null;
  }

  // Ensure file exists
  if (!existsSync(resolvedScriptPath)) {
    return null;
  }

  return resolvedScriptPath;
}

/**
 * Send SSE event to client
 */
function sendSSEEvent(res: Response, event: SSEEvent): void {
  const data = JSON.stringify(event);
  res.write(`data: ${data}\n\n`);
}

/**
 * Seed Executor
 *
 * Executes seed scripts in isolated Node.js child processes.
 * Streams stdout/stderr via SSE to frontend for real-time feedback.
 */
export class SeedExecutor {
  private child: ChildProcess | null = null;
  private startTime: number = 0;
  private outputBuffer: string = '';
  private errorBuffer: string = '';
  private outputSize: number = 0;

  /**
   * Execute a seed script
   *
   * @param scriptPath - Absolute path to the script
   * @param res - Express response object (for SSE streaming)
   * @param databaseUrl - Optional database URL to pass to the script
   * @param projectRoot - Optional project root directory (defaults to script's directory)
   * @returns Promise resolving to execution result
   */
  async execute(scriptPath: string, res: Response, databaseUrl?: string, projectRoot?: string): Promise<SeedExecutionResult> {
    this.startTime = Date.now();
    this.outputBuffer = '';
    this.errorBuffer = '';
    this.outputSize = 0;

    return new Promise((resolvePromise, rejectPromise) => {
      // .ts/.mts files require tsx for TypeScript compilation.
      // .mjs files are native ESM and run directly with node — tsx is not
      // available in the system PATH in Docker production builds.
      const needsTsx = scriptPath.match(/\.(ts|mts)$/);
      const execCommand = needsTsx ? 'tsx' : process.execPath;
      const execArgs = [scriptPath];

      // Spawn process with TypeScript support if needed
      this.child = spawn(execCommand, execArgs, {
        env: {
          ...process.env, // Inherit all env vars for tsx to work properly
          NODE_ENV: process.env.NODE_ENV || 'development',
          DATABASE_URI: databaseUrl || process.env.DATABASE_URI,
          DATABASE_URL: databaseUrl || process.env.DATABASE_URL,
          PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
          NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
          API_URL: process.env.API_URL,
          PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'dev-secret-key-change-in-production',
        },
        stdio: ['pipe', 'pipe', 'pipe'], // stdin: pipe, stdout: pipe, stderr: pipe
        cwd: projectRoot || resolve(scriptPath, '..'), // Run from project root (or scripts directory if not provided)
      });

      // Auto-answer interactive prompts (like Drizzle's schema push confirmation)
      // Send 'y\n' every 500ms to handle any prompts that appear
      const stdinInterval = setInterval(() => {
        if (this.child && this.child.stdin && !this.child.stdin.destroyed) {
          try {
            this.child.stdin.write('y\n');
          } catch (err) {
            // Ignore errors - stdin might be closed
          }
        }
      }, 500);

      // Clear interval when process exits
      const cleanupInterval = () => {
        clearInterval(stdinInterval);
        // Close stdin to signal EOF
        if (this.child && this.child.stdin && !this.child.stdin.destroyed) {
          try {
            this.child.stdin.end();
          } catch (err) {
            // Ignore errors
          }
        }
      };

      // Handle stdout
      this.child.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();

        // Send via SSE
        sendSSEEvent(res, {
          type: 'stdout',
          data: text,
          timestamp: new Date().toISOString(),
        });

        // Buffer output (with size limit)
        if (this.outputSize < MAX_OUTPUT_SIZE) {
          const remaining = MAX_OUTPUT_SIZE - this.outputSize;
          const chunk = text.slice(0, remaining);
          this.outputBuffer += chunk;
          this.outputSize += chunk.length;

          if (this.outputSize >= MAX_OUTPUT_SIZE) {
            this.outputBuffer += '\n... (output truncated at 100KB)';
          }
        }
      });

      // Handle stderr
      this.child.stderr?.on('data', (data: Buffer) => {
        const text = data.toString();

        // Send via SSE
        sendSSEEvent(res, {
          type: 'stderr',
          data: text,
          timestamp: new Date().toISOString(),
        });

        // Buffer error output (with size limit)
        if (this.outputSize < MAX_OUTPUT_SIZE) {
          const remaining = MAX_OUTPUT_SIZE - this.outputSize;
          const chunk = text.slice(0, remaining);
          this.errorBuffer += chunk;
          this.outputSize += chunk.length;
        }
      });

      // Handle process exit
      this.child.on('exit', (code, signal) => {
        cleanupInterval(); // Clean up stdin interval

        const exitCode = code ?? (signal ? 1 : 0);
        const duration = Date.now() - this.startTime;

        // Send exit event via SSE
        sendSSEEvent(res, {
          type: 'exit',
          data: JSON.stringify({ exitCode, duration, signal }),
          timestamp: new Date().toISOString(),
        });

        // Resolve with result
        resolvePromise({
          exitCode,
          duration,
          output: this.outputBuffer,
          error: this.errorBuffer,
        });

        this.child = null;
      });

      // Handle spawn errors
      this.child.on('error', (err: Error) => {
        cleanupInterval(); // Clean up stdin interval

        sendSSEEvent(res, {
          type: 'error',
          data: err.message,
          timestamp: new Date().toISOString(),
        });

        rejectPromise(err);
      });

      // Handle SSE connection close - terminate child process
      res.on('close', () => {
        cleanupInterval(); // Clean up stdin interval
        if (this.child && !this.child.killed) {
          this.child.kill('SIGTERM');
        }
      });
    });
  }

  /**
   * Check if executor is currently running a process
   */
  isRunning(): boolean {
    return this.child !== null && !this.child.killed;
  }

  /**
   * Terminate running process
   */
  terminate(): void {
    if (this.child && !this.child.killed) {
      this.child.kill('SIGTERM');
    }
  }
}
