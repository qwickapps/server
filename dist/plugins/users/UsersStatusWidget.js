import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Users Status Widget Component
 * Displays user statistics and recent activity
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const UsersStatusWidget = ({ apiPrefix = '/api/users', }) => {
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
        const interval = setInterval(fetchStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "User Management", status: "healthy", loading: true }));
    }
    if (error || !stats) {
        return (_jsx(PluginStatusWidget, { title: "User Management", status: "error", message: error || 'Failed to load user stats' }));
    }
    const widgetStats = [
        {
            label: 'Total Users',
            value: stats.totalUsers,
            status: 'info',
        },
        {
            label: 'Active',
            value: stats.activeUsers,
            status: 'healthy',
        },
        {
            label: 'Invited',
            value: stats.invitedUsers,
            status: stats.invitedUsers > 0 ? 'info' : 'healthy',
        },
        {
            label: 'Suspended',
            value: stats.suspendedUsers,
            status: stats.suspendedUsers > 0 ? 'warning' : 'healthy',
        },
        {
            label: 'Recent (7d)',
            value: stats.recentSignups,
            status: 'info',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "User Management", status: stats.health, stats: widgetStats, actions: [
            {
                label: 'Manage Users',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/users';
                },
                variant: 'secondary',
            },
        ] }));
};
export default UsersStatusWidget;
//# sourceMappingURL=UsersStatusWidget.js.map