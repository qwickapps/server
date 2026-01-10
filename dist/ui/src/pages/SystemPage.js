import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Chip, IconButton, Tooltip, Snackbar, Alert, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import ComputerIcon from '@mui/icons-material/Computer';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { api } from '../api/controlPanelApi';
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}
function getHealthStatusIcon(status, size = 20) {
    switch (status) {
        case 'healthy':
            return _jsx(CheckCircleIcon, { sx: { color: 'var(--theme-success)', fontSize: size } });
        case 'degraded':
            return _jsx(WarningIcon, { sx: { color: 'var(--theme-warning)', fontSize: size } });
        case 'unhealthy':
            return _jsx(ErrorIcon, { sx: { color: 'var(--theme-error)', fontSize: size } });
        default:
            return _jsx(CircularProgress, { size: size });
    }
}
function getHealthStatusColor(status) {
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
function formatLatency(latency) {
    if (latency === undefined)
        return '-';
    if (latency < 1000)
        return `${latency}ms`;
    return `${(latency / 1000).toFixed(2)}s`;
}
export function SystemPage() {
    const [diagnostics, setDiagnostics] = useState(null);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
    });
    const fetchData = async () => {
        setLoading(true);
        try {
            const [diagData, healthData] = await Promise.all([
                api.getDiagnostics(),
                api.getHealth().catch(() => null), // Health might not be available
            ]);
            setDiagnostics(diagData);
            setHealth(healthData);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch diagnostics');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);
    const handleCopyAll = () => {
        navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
        setSnackbar({ open: true, message: 'Diagnostics copied to clipboard' });
    };
    if (loading && !diagnostics) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }, children: _jsx(CircularProgress, {}) }));
    }
    if (error) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }, children: _jsx(CardContent, { children: _jsx(Typography, { color: "error", children: error }) }) }));
    }
    const memoryUsedPercent = diagnostics
        ? (diagnostics.system.memory.used / diagnostics.system.memory.total) * 100
        : 0;
    return (_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "h4", sx: { color: 'var(--theme-text-primary)' }, children: "System" }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [_jsx(Tooltip, { title: "Copy diagnostics JSON", children: _jsx(IconButton, { onClick: handleCopyAll, sx: { color: 'var(--theme-primary)' }, children: _jsx(ContentCopyIcon, {}) }) }), _jsx(Tooltip, { title: "Refresh", children: _jsx(IconButton, { onClick: fetchData, sx: { color: 'var(--theme-primary)' }, children: _jsx(RefreshIcon, {}) }) })] })] }), _jsx(Typography, { variant: "body2", sx: { mb: 4, color: 'var(--theme-text-secondary)' }, children: "System information and diagnostics" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', height: '100%' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 }, children: [_jsx(ComputerIcon, { sx: { color: 'var(--theme-primary)' } }), _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "System Information" })] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "QwickApps Server" }), _jsx(Chip, { label: diagnostics?.frameworkVersion ? `v${diagnostics.frameworkVersion}` : 'N/A', size: "small", sx: { bgcolor: 'var(--theme-primary)20', color: 'var(--theme-primary)' } })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Node.js" }), _jsx(Chip, { label: diagnostics?.system.nodeVersion, size: "small", sx: { bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' } })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Platform" }), _jsx(Chip, { label: diagnostics?.system.platform, size: "small", sx: { bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' } })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Architecture" }), _jsx(Chip, { label: diagnostics?.system.arch, size: "small", sx: { bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' } })] })] })] }) }) }), _jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', height: '100%' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 }, children: [_jsx(MemoryIcon, { sx: { color: 'var(--theme-warning)' } }), _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Memory Usage" })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', mb: 1 }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Heap Used" }), _jsx(Typography, { sx: { color: 'var(--theme-text-primary)' }, children: formatBytes(diagnostics?.system.memory.used || 0) })] }), _jsx(LinearProgress, { variant: "determinate", value: memoryUsedPercent, sx: {
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: 'var(--theme-background)',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: memoryUsedPercent > 80 ? 'var(--theme-error)' : 'var(--theme-warning)',
                                                        borderRadius: 4,
                                                    },
                                                } })] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Heap Total" }), _jsx(Typography, { sx: { color: 'var(--theme-text-primary)' }, children: formatBytes(diagnostics?.system.memory.total || 0) })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Heap Free" }), _jsx(Typography, { sx: { color: 'var(--theme-text-primary)' }, children: formatBytes(diagnostics?.system.memory.free || 0) })] })] })] }) }) }), _jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', height: '100%' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 }, children: [_jsx(StorageIcon, { sx: { color: 'var(--theme-info)' } }), _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Service Info" })] }), _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2 }, children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Product" }), _jsx(Typography, { sx: { color: 'var(--theme-text-primary)' }, children: diagnostics?.product })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Version" }), _jsx(Chip, { label: diagnostics?.version || 'N/A', size: "small", sx: { bgcolor: 'var(--theme-primary)20', color: 'var(--theme-primary)' } })] }), _jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Timestamp" }), _jsx(Typography, { sx: { color: 'var(--theme-text-primary)', fontSize: '0.875rem' }, children: diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleString() : 'N/A' })] })] })] }) }) }), _jsx(Grid, { size: { xs: 12, md: 6 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', height: '100%' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 }, children: [_jsx(AccessTimeIcon, { sx: { color: 'var(--theme-success)' } }), _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Uptime" })] }), _jsx(Typography, { variant: "h3", sx: { color: 'var(--theme-success)', mb: 1 }, children: formatUptime(diagnostics?.uptime || 0) }), _jsx(Typography, { sx: { color: 'var(--theme-text-secondary)' }, children: "Service has been running without interruption" })] }) }) }), health && (_jsx(Grid, { size: { xs: 12 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 3 }, children: [_jsx(FavoriteIcon, { sx: { color: getHealthStatusColor(health.status) } }), _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Health Checks" }), _jsx(Chip, { label: health.status, size: "small", sx: {
                                                    bgcolor: getHealthStatusColor(health.status) + '20',
                                                    color: getHealthStatusColor(health.status),
                                                    textTransform: 'capitalize',
                                                    ml: 'auto',
                                                } })] }), _jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Check" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Status" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Latency" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Last Checked" })] }) }), _jsx(TableBody, { children: Object.entries(health.checks).map(([name, check]) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [getHealthStatusIcon(check.status), _jsx(Typography, { fontWeight: 500, children: name })] }) }), _jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: _jsx(Chip, { label: check.status, size: "small", sx: {
                                                                        bgcolor: getHealthStatusColor(check.status) + '20',
                                                                        color: getHealthStatusColor(check.status),
                                                                        textTransform: 'capitalize',
                                                                    } }) }), _jsx(TableCell, { sx: { color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }, children: formatLatency(check.latency) }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: new Date(check.lastChecked).toLocaleTimeString() })] }, name))) })] }) })] }) }) })), _jsx(Grid, { size: { xs: 12 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Raw Diagnostics JSON (for AI agents)" }), _jsx(Box, { component: "pre", sx: {
                                            bgcolor: 'var(--theme-background)',
                                            p: 2,
                                            borderRadius: 1,
                                            overflow: 'auto',
                                            maxHeight: 300,
                                            color: 'var(--theme-text-primary)',
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                        }, children: JSON.stringify(diagnostics, null, 2) })] }) }) })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 2000, onClose: () => setSnackbar({ ...snackbar, open: false }), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "success", variant: "filled", children: snackbar.message }) })] }));
}
//# sourceMappingURL=SystemPage.js.map