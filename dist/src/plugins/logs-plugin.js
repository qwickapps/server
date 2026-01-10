/**
 * Logs Plugin
 *
 * Provides log viewing capabilities from various sources.
 * If no sources are configured, automatically uses the logging subsystem's log paths.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { existsSync, readFileSync, statSync } from 'fs';
import { resolve } from 'path';
import { getLoggingSubsystem } from '../core/logging.js';
/**
 * Get default log sources from the logging subsystem
 */
function getDefaultSources() {
    const loggingSubsystem = getLoggingSubsystem();
    const logPaths = loggingSubsystem.getLogPaths();
    return [
        { name: 'app', type: 'file', path: logPaths.appLog },
        { name: 'error', type: 'file', path: logPaths.errorLog },
    ];
}
/**
 * Create a logs plugin
 */
export function createLogsPlugin(config = {}) {
    const maxLines = config.retention?.maxLines || 10000;
    // Use provided sources or default to logging subsystem paths
    const getSources = () => {
        if (config.sources && config.sources.length > 0) {
            return config.sources;
        }
        return getDefaultSources();
    };
    return {
        id: 'logs',
        name: 'Logs Plugin',
        version: '1.0.0',
        async onStart(_pluginConfig, registry) {
            const logger = registry.getLogger('logs');
            // Register /sources route (slug prefix added automatically by framework)
            registry.addRoute({
                method: 'get',
                path: '/sources',
                pluginId: 'logs',
                handler: (_req, res) => {
                    const sources = getSources();
                    res.json({
                        sources: sources.map((s) => ({
                            name: s.name,
                            type: s.type,
                        })),
                    });
                },
            });
            // Register root route (slug prefix added automatically by framework)
            registry.addRoute({
                method: 'get',
                path: '/',
                pluginId: 'logs',
                handler: (req, res) => {
                    try {
                        const sources = getSources();
                        const sourceName = req.query.source || sources[0]?.name;
                        const limit = Math.min(parseInt(req.query.limit) || 100, maxLines);
                        const offset = parseInt(req.query.offset) || 0;
                        const level = req.query.level;
                        const search = req.query.search;
                        const order = req.query.order || 'desc';
                        const source = sources.find((s) => s.name === sourceName);
                        if (!source) {
                            return res.status(404).json({ error: `Source "${sourceName}" not found` });
                        }
                        if (source.type === 'file' && source.path) {
                            const logs = readLogsFromFile(source.path, { limit, offset, level, search, order });
                            return res.json(logs);
                        }
                        else if (source.type === 'api' && source.url) {
                            // Proxy to remote API
                            return res.status(501).json({ error: 'API source not yet implemented' });
                        }
                        return res.status(400).json({ error: 'Invalid source configuration' });
                    }
                    catch (error) {
                        return res.status(500).json({
                            error: 'Failed to read logs',
                            message: error instanceof Error ? error.message : String(error),
                        });
                    }
                },
            });
            // Register /stats route (slug prefix added automatically by framework)
            registry.addRoute({
                method: 'get',
                path: '/stats',
                pluginId: 'logs',
                handler: (req, res) => {
                    try {
                        const sources = getSources();
                        const sourceName = req.query.source || sources[0]?.name;
                        const source = sources.find((s) => s.name === sourceName);
                        if (!source) {
                            return res.status(404).json({ error: `Source "${sourceName}" not found` });
                        }
                        if (source.type === 'file' && source.path) {
                            const stats = getLogStats(source.path);
                            return res.json(stats);
                        }
                        return res.status(400).json({ error: 'Stats only available for file sources' });
                    }
                    catch (error) {
                        return res.status(500).json({
                            error: 'Failed to get log stats',
                            message: error instanceof Error ? error.message : String(error),
                        });
                    }
                },
            });
            const sources = getSources();
            logger.debug(`Logs plugin initialized with ${sources.length} sources`);
        },
        async onStop() {
            // Nothing to cleanup
        },
    };
}
/**
 * Read logs from a file
 */
function readLogsFromFile(filePath, options) {
    const resolvedPath = resolve(filePath);
    if (!existsSync(resolvedPath)) {
        return { logs: [], total: 0 };
    }
    const content = readFileSync(resolvedPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    let entries = [];
    let id = 0;
    for (const line of lines) {
        // Try to parse as JSON log entry
        try {
            const parsed = JSON.parse(line);
            if (parsed.msg || parsed.message) {
                entries.push({
                    id: id++,
                    level: parsed.level || 'info',
                    timestamp: parsed.timestamp || parsed.time || new Date().toISOString(),
                    namespace: parsed.ns || parsed.name || 'unknown',
                    message: parsed.msg || parsed.message,
                    ...parsed,
                });
            }
        }
        catch {
            // Try to parse as simple log format: "LEVEL [namespace] message"
            const match = line.match(/^(\d{2}:\d{2}:\d{2})\s+\[([^\]]+)\]\s+(.*)$/);
            if (match) {
                entries.push({
                    id: id++,
                    level: 'info',
                    timestamp: match[1],
                    namespace: match[2],
                    message: match[3],
                });
            }
        }
    }
    // Filter by level
    if (options.level && options.level !== 'all') {
        entries = entries.filter((e) => e.level === options.level);
    }
    // Filter by search
    if (options.search) {
        const searchLower = options.search.toLowerCase();
        entries = entries.filter((e) => e.message.toLowerCase().includes(searchLower) ||
            e.namespace.toLowerCase().includes(searchLower));
    }
    const total = entries.length;
    // Sort
    if (options.order === 'desc') {
        entries.reverse();
    }
    // Paginate
    entries = entries.slice(options.offset, options.offset + options.limit);
    return { logs: entries, total };
}
/**
 * Get log statistics from a file
 */
function getLogStats(filePath) {
    const resolvedPath = resolve(filePath);
    if (!existsSync(resolvedPath)) {
        return {
            totalLogs: 0,
            byLevel: { debug: 0, info: 0, warn: 0, error: 0 },
            fileSize: 0,
            fileSizeFormatted: '0 B',
            oldestLog: null,
            newestLog: null,
        };
    }
    const stats = statSync(resolvedPath);
    const content = readFileSync(resolvedPath, 'utf-8');
    const lines = content.split('\n').filter((line) => line.trim());
    const byLevel = { debug: 0, info: 0, warn: 0, error: 0 };
    let oldestLog = null;
    let newestLog = null;
    for (const line of lines) {
        try {
            const parsed = JSON.parse(line);
            const level = (parsed.level || 'info').toLowerCase();
            if (level in byLevel) {
                byLevel[level]++;
            }
            const timestamp = parsed.timestamp || parsed.time;
            if (timestamp) {
                if (!oldestLog || timestamp < oldestLog) {
                    oldestLog = timestamp;
                }
                if (!newestLog || timestamp > newestLog) {
                    newestLog = timestamp;
                }
            }
        }
        catch {
            byLevel.info++; // Count non-JSON lines as info
        }
    }
    return {
        totalLogs: lines.length,
        byLevel,
        fileSize: stats.size,
        fileSizeFormatted: formatBytes(stats.size),
        oldestLog,
        newestLog,
    };
}
/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
//# sourceMappingURL=logs-plugin.js.map