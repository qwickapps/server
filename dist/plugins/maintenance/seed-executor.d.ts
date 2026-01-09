/**
 * Seed Executor
 *
 * Executes seed scripts in isolated child processes and streams output via SSE.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
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
 * Validate script path to prevent path traversal attacks
 *
 * @param scriptName - Name of the script (e.g., "seed-products.mjs")
 * @param scriptsPath - Base path for scripts directory
 * @returns Resolved path if valid, null if invalid
 */
export declare function validateScriptPath(scriptName: string, scriptsPath: string): string | null;
/**
 * Seed Executor
 *
 * Executes seed scripts in isolated Node.js child processes.
 * Streams stdout/stderr via SSE to frontend for real-time feedback.
 */
export declare class SeedExecutor {
    private child;
    private startTime;
    private outputBuffer;
    private errorBuffer;
    private outputSize;
    /**
     * Execute a seed script
     *
     * @param scriptPath - Absolute path to the script
     * @param res - Express response object (for SSE streaming)
     * @returns Promise resolving to execution result
     */
    execute(scriptPath: string, res: Response): Promise<SeedExecutionResult>;
    /**
     * Check if executor is currently running a process
     */
    isRunning(): boolean;
    /**
     * Terminate running process
     */
    terminate(): void;
}
//# sourceMappingURL=seed-executor.d.ts.map