import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Cache Maintenance Widget
 *
 * Provides cache management operations:
 * - View cache statistics
 * - Clear cache (flush all keys)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Alert, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, Chip, } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
export function CacheMaintenanceWidget() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flushing, setFlushing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/cache:default/stats');
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Cache plugin not configured');
                }
                throw new Error('Failed to fetch cache stats');
            }
            const data = await response.json();
            setStats(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch cache stats');
            setStats(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStats();
    }, []);
    const handleFlushCache = async () => {
        setConfirmOpen(false);
        setFlushing(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/cache:default/flush', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to flush cache');
            }
            const data = await response.json();
            setSuccess(data.message + (data.deletedCount !== undefined ? ` (${data.deletedCount} keys deleted)` : ''));
            // Refresh stats
            await fetchStats();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to flush cache');
        }
        finally {
            setFlushing(false);
        }
    };
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Cache Management" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View cache statistics and clear cache" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(null), children: success })), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 }, children: _jsx(CircularProgress, { size: 30 }) })) : stats ? (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: _jsx("strong", { children: "Status:" }) }), _jsx(Chip, { size: "small", icon: stats.connected ? _jsx(CheckCircleIcon, {}) : _jsx(ErrorIcon, {}), label: stats.connected ? 'Connected' : 'Disconnected', color: stats.connected ? 'success' : 'error' })] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Key Count:" }), " ", stats.keyCount.toLocaleString()] }), stats.usedMemory && (_jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Memory Used:" }), " ", stats.usedMemory] }))] })) : null, _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "outlined", color: "primary", size: "small", startIcon: _jsx(RefreshIcon, {}), onClick: fetchStats, disabled: loading, children: "Refresh" }), _jsx(Button, { variant: "contained", color: "error", size: "small", startIcon: flushing ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(DeleteIcon, {}), onClick: () => setConfirmOpen(true), disabled: !stats || !stats.connected || flushing || loading, children: "Flush Cache" })] }), _jsxs(Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [_jsx(DialogTitle, { children: "Flush Cache" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to flush the cache? This will delete", ' ', stats?.keyCount.toLocaleString(), " keys. This action cannot be undone."] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirmOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleFlushCache, color: "error", variant: "contained", children: "Flush" })] })] })] }) }));
}
//# sourceMappingURL=CacheMaintenanceWidget.js.map