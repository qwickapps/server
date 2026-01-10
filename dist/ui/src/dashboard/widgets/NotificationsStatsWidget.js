import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Notifications Stats Widget
 *
 * Displays realtime notifications connection statistics on the Control Panel dashboard.
 * Shows active clients, events processed, and connection health.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { GridLayout, Text } from '@qwickapps/react-framework';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../../api/controlPanelApi';
import { StatCard } from '@qwickapps/react-framework';
import { formatNumber, formatDuration } from '../../utils/formatters';
/**
 * Notifications Stats Widget Component
 */
export function NotificationsStatsWidget() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getNotificationsStats();
                setStats(data);
                setError(null);
            }
            catch (err) {
                // Check if it's a 404 (plugin not enabled)
                if (err instanceof Error && err.message.includes('404')) {
                    setError('Notifications plugin not enabled');
                }
                else {
                    setError(err instanceof Error ? err.message : 'Failed to fetch stats');
                }
            }
            finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsx(LinearProgress, {}) }) }));
    }
    if (error) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(WifiOffIcon, { sx: { color: 'var(--theme-text-secondary)' } }), _jsx(Text, { variant: "body2", customColor: "var(--theme-text-secondary)", content: error })] }) }) }));
    }
    if (!stats) {
        return null;
    }
    const isHealthy = stats.connectionHealth.isHealthy;
    const healthColor = isHealthy ? 'var(--theme-success)' : 'var(--theme-warning)';
    return (_jsxs(Box, { children: [_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 2 }, children: _jsx(CardContent, { sx: { py: 1, '&:last-child': { pb: 1 } }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [isHealthy ? (_jsx(WifiIcon, { sx: { color: healthColor, fontSize: 20 } })) : (_jsx(WifiOffIcon, { sx: { color: healthColor, fontSize: 20 } })), _jsx(Text, { variant: "body2", content: isHealthy ? 'Connected' : 'Reconnecting...', customColor: healthColor, fontWeight: "500" }), stats.connectionHealth.isReconnecting && (_jsx(Chip, { label: `Attempt ${stats.connectionHealth.reconnectAttempts}`, size: "small", sx: {
                                            bgcolor: 'var(--theme-warning)20',
                                            color: 'var(--theme-warning)',
                                            fontSize: '0.7rem',
                                            height: 18,
                                        } }))] }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Text, { variant: "caption", content: `${stats.channels.length} channel${stats.channels.length !== 1 ? 's' : ''}`, customColor: "var(--theme-text-secondary)" }), stats.lastEventAt && (_jsx(Text, { variant: "caption", content: `Last event: ${formatDuration(stats.connectionHealth.timeSinceLastEvent)} ago`, customColor: "var(--theme-text-secondary)" }))] })] }) }) }), _jsxs(GridLayout, { columns: 4, spacing: "small", equalHeight: true, children: [_jsx(StatCard, { icon: _jsx(DevicesIcon, { sx: { fontSize: 28 } }), label: "Active Clients", value: stats.currentConnections, subValue: `${stats.totalConnections} total`, color: "var(--theme-primary)" }), _jsx(StatCard, { icon: _jsx(PersonIcon, { sx: { fontSize: 28 } }), label: "By Device", value: stats.clientsByType.device, subValue: `${stats.clientsByType.user} by user`, color: "var(--theme-info)" }), _jsx(StatCard, { icon: _jsx(SendIcon, { sx: { fontSize: 28 } }), label: "Events Routed", value: formatNumber(stats.eventsRouted), subValue: `${formatNumber(stats.eventsProcessed)} processed`, color: "var(--theme-success)" }), _jsx(StatCard, { icon: _jsx(ErrorIcon, { sx: { fontSize: 28 } }), label: "Dropped", value: formatNumber(stats.eventsDroppedNoClients), subValue: `${stats.eventsParseFailed} parse errors`, color: stats.eventsDroppedNoClients > 0 ? 'var(--theme-warning)' : 'var(--theme-text-secondary)' })] })] }));
}
//# sourceMappingURL=NotificationsStatsWidget.js.map