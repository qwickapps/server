import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CMS Status Widget
 *
 * Displays Payload CMS service status on the dashboard
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Alert, } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';
export function CMSStatusWidget() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/cms/status');
            const data = await response.json();
            setStatus(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch CMS status');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100px", children: _jsx(CircularProgress, { size: 24 }) }) }) }));
    }
    if (error || !status) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Alert, { severity: "error", children: error || 'Failed to load CMS status' }) }) }));
    }
    const isHealthy = status.status === 'running';
    const statusColor = isHealthy ? 'success' : status.status === 'unhealthy' ? 'warning' : 'error';
    const StatusIcon = isHealthy ? CheckCircleIcon : ErrorIcon;
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h6", children: "Payload CMS" }), _jsx(Chip, { label: status.status.toUpperCase(), color: statusColor, size: "small", icon: _jsx(StatusIcon, {}) })] }), _jsxs(Box, { display: "flex", flexDirection: "column", gap: 1, children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(LinkIcon, { fontSize: "small", color: "action" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: status.url })] }), status.error && (_jsx(Alert, { severity: "error", sx: { mt: 1 }, children: status.error })), _jsxs(Typography, { variant: "caption", color: "text.secondary", sx: { mt: 1 }, children: ["Last checked: ", new Date(status.timestamp).toLocaleTimeString()] })] })] }) }));
}
//# sourceMappingURL=CMSStatusWidget.js.map