import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CMS Maintenance Widget
 *
 * Provides CMS service control and seed management for the maintenance page
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, CircularProgress, Alert, Divider, List, ListItem, ListItemText, IconButton, } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
export function CMSMaintenanceWidget() {
    const [status, setStatus] = useState(null);
    const [seeds, setSeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/cms/status');
            const data = await response.json();
            setStatus(data);
        }
        catch (err) {
            console.error('Failed to fetch CMS status:', err);
        }
    };
    const fetchSeeds = async () => {
        try {
            const response = await fetch('/api/cms/seeds');
            const data = await response.json();
            setSeeds(data.seeds || []);
        }
        catch (err) {
            console.error('Failed to fetch seeds:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStatus();
        fetchSeeds();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, []);
    const handleRestart = async () => {
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/cms/restart', { method: 'POST' });
            const data = await response.json();
            if (response.ok) {
                setSuccess('CMS service restarted successfully');
                setTimeout(() => fetchStatus(), 2000);
            }
            else {
                setError(data.message || 'Restart not implemented');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restart CMS');
        }
    };
    const handleRunSeed = async (seedName) => {
        setExecuting(seedName);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch(`/api/cms/seeds/${seedName}/execute`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                setSuccess(`Seed "${seedName}" executed successfully`);
            }
            else {
                setError(data.error || 'Seed execution failed');
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to execute seed');
        }
        finally {
            setExecuting(null);
        }
    };
    if (loading) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }) }) }));
    }
    const isHealthy = status?.status === 'running';
    const statusColor = isHealthy ? 'success' : status?.status === 'unhealthy' ? 'warning' : 'error';
    const StatusIcon = isHealthy ? CheckCircleIcon : ErrorIcon;
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h6", children: "CMS Service Control" }), status && (_jsx(Chip, { label: status.status.toUpperCase(), color: statusColor, size: "small", icon: _jsx(StatusIcon, {}) }))] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(null), children: success })), _jsxs(Box, { mb: 3, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Service Control" }), _jsx(Typography, { variant: "body2", color: "text.secondary", mb: 2, children: "Manage the Payload CMS service" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshIcon, {}), onClick: handleRestart, disabled: !status, children: "Restart CMS Service" })] }), _jsx(Divider, { sx: { my: 2 } }), _jsxs(Box, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, children: [_jsx(Typography, { variant: "subtitle2", children: "Seed Scripts" }), _jsx(IconButton, { size: "small", onClick: fetchSeeds, children: _jsx(RefreshIcon, { fontSize: "small" }) })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", mb: 2, children: "Execute database seed scripts for initial data setup" }), seeds.length > 0 ? (_jsx(List, { dense: true, children: seeds.map((seed) => (_jsx(ListItem, { secondaryAction: _jsx(Button, { variant: "outlined", size: "small", startIcon: executing === seed.name ? _jsx(CircularProgress, { size: 16 }) : _jsx(PlayArrowIcon, {}), onClick: () => handleRunSeed(seed.name), disabled: executing !== null, children: executing === seed.name ? 'Running...' : 'Run' }), children: _jsx(ListItemText, { primary: seed.name, secondary: seed.file }) }, seed.name))) })) : (_jsx(Alert, { severity: "info", children: "No seed scripts found. Place seed scripts in the configured seeds directory." }))] })] }) }));
}
//# sourceMappingURL=CMSMaintenanceWidget.js.map