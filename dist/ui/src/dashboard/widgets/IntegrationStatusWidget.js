import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Integration Status Widget
 *
 * Displays the status of configured integrations with their connection status.
 * Used in the dashboard to show a quick overview of integration health.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../../api/controlPanelApi';
export function IntegrationStatusWidget() {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await api.fetch('/ai-proxy/config');
                setConfig(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch integrations');
            }
            finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 20 }) }));
    }
    if (error) {
        return (_jsx(Alert, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load integrations" }));
    }
    if (!config)
        return null;
    const configuredCount = config.integrations.filter((i) => i.configured).length;
    const totalCount = config.integrations.length;
    return (_jsxs(Box, { sx: {
            bgcolor: 'var(--theme-surface)',
            borderRadius: 2,
            p: 2,
            border: '1px solid var(--theme-border)',
        }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "subtitle2", sx: { color: 'var(--theme-text-secondary)' }, children: [configuredCount, " of ", totalCount, " configured"] }), _jsxs(Typography, { variant: "subtitle2", sx: { color: 'var(--theme-text-secondary)' }, children: [config.stats.totalRequests, " requests"] })] }), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1.5 }, children: config.integrations.map((integration) => (_jsxs(Box, { sx: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        bgcolor: 'var(--theme-background)',
                        borderRadius: 1,
                    }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [integration.configured ? (_jsx(CheckCircleIcon, { sx: { color: 'var(--theme-success)', fontSize: 18 } })) : (_jsx(ErrorIcon, { sx: { color: 'var(--theme-text-secondary)', fontSize: 18 } })), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", sx: { color: 'var(--theme-text-primary)', fontWeight: 500 }, children: integration.name }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: integration.description })] })] }), _jsx(Chip, { label: integration.configured ? 'Connected' : 'Not Configured', size: "small", sx: {
                                bgcolor: integration.configured ? 'var(--theme-success)20' : 'transparent',
                                color: integration.configured ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                                border: integration.configured ? 'none' : '1px solid var(--theme-border)',
                                fontWeight: 500,
                                fontSize: 11,
                            } })] }, integration.id))) })] }));
}
//# sourceMappingURL=IntegrationStatusWidget.js.map