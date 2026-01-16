import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Logs Maintenance Widget
 *
 * Provides log management operations:
 * - View log statistics
 * - Clear log files
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Alert, Box, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
export function LogsMaintenanceWidget() {
    const [sources, setSources] = useState([]);
    const [selectedSource, setSelectedSource] = useState('');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const fetchSources = async () => {
        try {
            const response = await fetch('/api/logs/sources');
            if (!response.ok)
                throw new Error('Failed to fetch log sources');
            const data = await response.json();
            setSources(data.sources || []);
            if (data.sources && data.sources.length > 0 && !selectedSource) {
                setSelectedSource(data.sources[0].name);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch log sources');
        }
    };
    const fetchStats = async () => {
        if (!selectedSource)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/logs/stats?source=${selectedSource}`);
            if (!response.ok)
                throw new Error('Failed to fetch log stats');
            const data = await response.json();
            setStats(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch log stats');
            setStats(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchSources();
    }, []);
    useEffect(() => {
        if (selectedSource) {
            fetchStats();
        }
    }, [selectedSource]);
    const handleClearLogs = async () => {
        setConfirmOpen(false);
        setClearing(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/logs/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ source: selectedSource }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to clear logs');
            }
            const data = await response.json();
            setSuccess(data.message || 'Logs cleared successfully');
            // Refresh stats
            await fetchStats();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear logs');
        }
        finally {
            setClearing(false);
        }
    };
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Log Management" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View log statistics and clear log files" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(null), children: success })), _jsx(Box, { sx: { mb: 2 }, children: _jsxs(FormControl, { fullWidth: true, size: "small", children: [_jsx(InputLabel, { children: "Log Source" }), _jsx(Select, { value: selectedSource, label: "Log Source", onChange: (e) => setSelectedSource(e.target.value), disabled: sources.length === 0, children: sources.map((source) => (_jsxs(MenuItem, { value: source.name, children: [source.name, " (", source.type, ")"] }, source.name))) })] }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 }, children: _jsx(CircularProgress, { size: 30 }) })) : stats ? (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "Total Logs:" }), " ", stats.totalLogs.toLocaleString()] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [_jsx("strong", { children: "File Size:" }), " ", stats.fileSizeFormatted] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: _jsx("strong", { children: "By Level:" }) }), _jsxs(Box, { sx: { pl: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Debug: ", stats.byLevel.debug.toLocaleString()] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Info: ", stats.byLevel.info.toLocaleString()] }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Warn: ", stats.byLevel.warn.toLocaleString()] }), _jsxs(Typography, { variant: "body2", color: "error", children: ["Error: ", stats.byLevel.error.toLocaleString()] })] })] })) : null, _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Button, { variant: "outlined", color: "primary", size: "small", startIcon: _jsx(RefreshIcon, {}), onClick: fetchStats, disabled: !selectedSource || loading, children: "Refresh" }), _jsx(Button, { variant: "contained", color: "error", size: "small", startIcon: clearing ? _jsx(CircularProgress, { size: 16, color: "inherit" }) : _jsx(DeleteIcon, {}), onClick: () => setConfirmOpen(true), disabled: !selectedSource || clearing || loading, children: "Clear Logs" })] }), _jsxs(Dialog, { open: confirmOpen, onClose: () => setConfirmOpen(false), children: [_jsx(DialogTitle, { children: "Clear Log File" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to clear the \"", selectedSource, "\" log file? This action cannot be undone."] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setConfirmOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleClearLogs, color: "error", variant: "contained", children: "Clear" })] })] })] }) }));
}
//# sourceMappingURL=LogsMaintenanceWidget.js.map