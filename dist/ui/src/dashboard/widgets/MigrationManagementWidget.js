import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Migration Management Widget
 *
 * Allows executing Payload CMS database migrations from the control panel.
 * Part of the maintenance plugin.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, CircularProgress, Alert, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';
export function MigrationManagementWidget() {
    const [error, setError] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [output, setOutput] = useState('');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [historyLimit] = useState(10);
    useEffect(() => {
        fetchHistory();
    }, []);
    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const basePath = window.__API_BASE_PATH__ || '';
            const response = await fetch(`${basePath}/maintenance/migrations/history?limit=${historyLimit}`);
            if (!response.ok)
                throw new Error('Failed to fetch migration history');
            const data = await response.json();
            setHistory(data.executions || []);
        }
        catch (err) {
            console.error('Failed to fetch migration history:', err);
        }
        finally {
            setHistoryLoading(false);
        }
    };
    const handleExecute = async () => {
        setExecuting(true);
        setOutput('Starting migrations...\n');
        setError(null);
        try {
            const basePath = window.__API_BASE_PATH__ || '';
            const eventSource = new EventSource(`${basePath}/maintenance/migrations/execute`, {
                withCredentials: true,
            });
            eventSource.addEventListener('message', (e) => {
                try {
                    const data = JSON.parse(e.data);
                    if (data.type === 'output') {
                        setOutput(prev => prev + data.data);
                    }
                    else if (data.type === 'error') {
                        setOutput(prev => prev + '[ERROR] ' + data.data);
                    }
                    else if (data.type === 'complete') {
                        setOutput(prev => prev + `\n\n✓ Migrations completed in ${data.duration}ms (exit code: ${data.exitCode})`);
                        setExecuting(false);
                        eventSource.close();
                        fetchHistory(); // Refresh history
                    }
                }
                catch (err) {
                    console.error('Failed to parse SSE message:', err);
                }
            });
            eventSource.onerror = (err) => {
                console.error('SSE error:', err);
                setError('Connection lost or migration failed. Check console for details.');
                setExecuting(false);
                eventSource.close();
            };
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Migration execution failed');
            setExecuting(false);
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    const formatDuration = (ms) => {
        if (!ms)
            return '-';
        if (ms < 1000)
            return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };
    const getStatusChip = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(Chip, { label: "Success", color: "success", size: "small", icon: _jsx(CheckCircleIcon, {}) });
            case 'failed':
                return _jsx(Chip, { label: "Failed", color: "error", size: "small", icon: _jsx(ErrorIcon, {}) });
            case 'running':
                return _jsx(Chip, { label: "Running", color: "primary", size: "small" });
            default:
                return _jsx(Chip, { label: status, size: "small" });
        }
    };
    const handleViewDetails = (execution) => {
        setSelectedExecution(execution);
        setDialogOpen(true);
    };
    return (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Database Migrations" }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "Execute Payload CMS database schema migrations" }), error && (_jsx(Alert, { severity: "error", sx: { mt: 2, mb: 2 }, children: error })), _jsx(Box, { sx: { mt: 2, mb: 2 }, children: _jsx(Button, { variant: "contained", color: "primary", onClick: handleExecute, disabled: executing, startIcon: executing ? _jsx(CircularProgress, { size: 20 }) : _jsx(PlayArrowIcon, {}), fullWidth: true, children: executing ? 'Running Migrations...' : 'Run Migrations' }) }), output && (_jsx(Paper, { elevation: 0, sx: {
                                p: 2,
                                bgcolor: '#1e1e1e',
                                color: '#d4d4d4',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                maxHeight: '400px',
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }, children: output })), _jsxs(Typography, { variant: "h6", sx: { mt: 4, mb: 2 }, children: [_jsx(HistoryIcon, { sx: { mr: 1, verticalAlign: 'middle' } }), "Recent Executions"] }), historyLoading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 3 }, children: _jsx(CircularProgress, {}) })) : history.length === 0 ? (_jsx(Alert, { severity: "info", children: "No migration executions yet" })) : (_jsx(TableContainer, { component: Paper, variant: "outlined", children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Status" }), _jsx(TableCell, { children: "Started" }), _jsx(TableCell, { children: "Duration" }), _jsx(TableCell, { children: "Exit Code" }), _jsx(TableCell, { align: "right", children: "Actions" })] }) }), _jsx(TableBody, { children: history.map((execution) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: getStatusChip(execution.status) }), _jsx(TableCell, { children: formatDate(execution.started_at) }), _jsx(TableCell, { children: formatDuration(execution.duration_ms) }), _jsx(TableCell, { children: execution.exit_code ?? '-' }), _jsx(TableCell, { align: "right", children: _jsx(Button, { size: "small", onClick: () => handleViewDetails(execution), children: "View Details" }) })] }, execution.id))) })] }) }))] }) }), _jsxs(Dialog, { open: dialogOpen, onClose: () => setDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: "Migration Execution Details" }), _jsx(DialogContent, { children: selectedExecution && (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Status:" }), getStatusChip(selectedExecution.status)] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Started:" }), _jsx(Typography, { variant: "body2", children: formatDate(selectedExecution.started_at) })] }), selectedExecution.completed_at && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Completed:" }), _jsx(Typography, { variant: "body2", children: formatDate(selectedExecution.completed_at) })] })), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Duration:" }), _jsx(Typography, { variant: "body2", children: formatDuration(selectedExecution.duration_ms) })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Exit Code:" }), _jsx(Typography, { variant: "body2", children: selectedExecution.exit_code ?? 'N/A' })] }), selectedExecution.output && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Output:" }), _jsx(Paper, { elevation: 0, sx: {
                                                p: 2,
                                                bgcolor: '#1e1e1e',
                                                color: '#d4d4d4',
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                maxHeight: '300px',
                                                overflow: 'auto',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }, children: selectedExecution.output })] })), selectedExecution.error && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", children: "Error:" }), _jsx(Alert, { severity: "error", children: _jsx("pre", { style: { margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }, children: selectedExecution.error }) })] }))] })) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setDialogOpen(false), children: "Close" }) })] })] }));
}
//# sourceMappingURL=MigrationManagementWidget.js.map