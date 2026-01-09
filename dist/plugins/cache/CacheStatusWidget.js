import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Redis Cache Status Widget Component
 * Displays cache connection status, key count, memory usage, and performance metrics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const CacheStatusWidget = ({ apiPrefix = '/api/plugins/cache', }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${apiPrefix}/stats`);
                if (!response.ok)
                    throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "Redis Cache", status: "healthy", loading: true }));
    }
    if (error || !stats) {
        return (_jsx(PluginStatusWidget, { title: "Redis Cache", status: "error", message: error || 'Failed to load stats' }));
    }
    const widgetStats = [
        {
            label: 'Connection',
            value: stats.connected ? 'Connected' : 'Disconnected',
            status: stats.connected ? 'healthy' : 'error',
        },
        {
            label: 'Cached Keys',
            value: stats.keyCount,
            status: stats.keyCount > 100000 ? 'warning' : 'healthy',
        },
        {
            label: 'Memory Used',
            value: stats.usedMemory,
            status: 'info',
        },
        {
            label: 'Cache Hit Rate',
            value: stats.hitRate,
            unit: '%',
            status: stats.hitRate < 50 ? 'warning' : stats.hitRate < 30 ? 'error' : 'healthy',
        },
        {
            label: 'Operations/sec',
            value: stats.opsPerSec,
            status: 'info',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "Redis Cache", status: stats.health, stats: widgetStats, actions: [
            {
                label: 'View Details',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/cache';
                },
                variant: 'secondary',
            },
        ] }));
};
export default CacheStatusWidget;
//# sourceMappingURL=CacheStatusWidget.js.map