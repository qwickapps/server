import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Service Health Widget
 *
 * Displays health check status with latency for all registered health checks.
 * This is a built-in widget provided by qwickapps-server.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip } from '@mui/material';
import { GridLayout, Text } from '@qwickapps/react-framework';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { api } from '../../api/controlPanelApi';
function getStatusIcon(status) {
    switch (status) {
        case 'healthy':
            return _jsx(CheckCircleIcon, { sx: { fontSize: 24, color: 'var(--theme-success)' } });
        case 'degraded':
            return _jsx(WarningIcon, { sx: { fontSize: 24, color: 'var(--theme-warning)' } });
        case 'unhealthy':
            return _jsx(ErrorIcon, { sx: { fontSize: 24, color: 'var(--theme-error)' } });
        default:
            return _jsx(WarningIcon, { sx: { fontSize: 24, color: 'var(--theme-text-secondary)' } });
    }
}
function getStatusColor(status) {
    switch (status) {
        case 'healthy':
            return 'var(--theme-success)';
        case 'degraded':
            return 'var(--theme-warning)';
        case 'unhealthy':
            return 'var(--theme-error)';
        default:
            return 'var(--theme-text-secondary)';
    }
}
/** Get grid columns count (1-4) based on item count */
function getGridColumns(count) {
    if (count <= 1)
        return 1;
    if (count === 2)
        return 2;
    if (count === 3)
        return 3;
    return 4;
}
/**
 * Service Health Widget Component
 */
export function ServiceHealthWidget() {
    const [health, setHealth] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const data = await api.getHealth();
                setHealth(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch health');
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);
    if (error) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }, children: _jsx(CardContent, { children: _jsx(Text, { variant: "body2", customColor: "var(--theme-error)", content: error }) }) }));
    }
    const healthChecks = health ? Object.entries(health.checks) : [];
    if (healthChecks.length === 0) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsx(Text, { variant: "body2", customColor: "var(--theme-text-secondary)", content: "No health checks configured" }) }) }));
    }
    // Determine grid columns based on number of health checks (max 4)
    const columns = getGridColumns(healthChecks.length);
    return (_jsx(GridLayout, { columns: columns, spacing: "medium", equalHeight: true, children: healthChecks.map(([name, check]) => (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [getStatusIcon(check.status), _jsxs(Box, { sx: { flex: 1, minWidth: 0 }, children: [_jsx(Text, { variant: "body1", fontWeight: "500", content: name.charAt(0).toUpperCase() + name.slice(1), customColor: "var(--theme-text-primary)" }), _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }, children: [_jsx(Chip, { label: check.status, size: "small", sx: {
                                                bgcolor: getStatusColor(check.status) + '20',
                                                color: getStatusColor(check.status),
                                                fontSize: '0.75rem',
                                                height: 20,
                                            } }), check.latency !== undefined && (_jsx(Text, { variant: "caption", content: `${check.latency}ms`, customColor: "var(--theme-text-secondary)" }))] })] })] }) }) }, name))) }));
}
//# sourceMappingURL=ServiceHealthWidget.js.map