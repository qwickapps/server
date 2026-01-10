import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Pagination, Tooltip, Grid, ToggleButton, ToggleButtonGroup, } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import { api } from '../api/controlPanelApi';
function getLevelColor(level) {
    switch (level.toLowerCase()) {
        case 'error':
            return 'var(--theme-error)';
        case 'warn':
        case 'warning':
            return 'var(--theme-warning)';
        case 'info':
            return 'var(--theme-info)';
        case 'debug':
            return 'var(--theme-text-secondary)';
        default:
            return 'var(--theme-text-primary)';
    }
}
export function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters
    const [selectedSource, setSelectedSource] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50;
    // New features
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first
    const autoRefreshRef = useRef(null);
    // Stats - computed from current logs (could be fetched from API if available)
    const stats = {
        total: total,
        errors: logs.filter(l => l.level.toLowerCase() === 'error').length,
        warnings: logs.filter(l => ['warn', 'warning'].includes(l.level.toLowerCase())).length,
        info: logs.filter(l => l.level.toLowerCase() === 'info').length,
        debug: logs.filter(l => l.level.toLowerCase() === 'debug').length,
    };
    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getLogs({
                source: selectedSource || undefined,
                level: selectedLevel || undefined,
                search: searchQuery || undefined,
                limit,
                page,
            });
            // Sort logs based on sortOrder
            const sortedLogs = [...data.logs].sort((a, b) => {
                const dateA = new Date(a.timestamp).getTime();
                const dateB = new Date(b.timestamp).getTime();
                return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
            });
            setLogs(sortedLogs);
            setTotal(data.total);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch logs');
        }
        finally {
            setLoading(false);
        }
    }, [selectedSource, selectedLevel, searchQuery, page, sortOrder]);
    const fetchSources = async () => {
        try {
            const data = await api.getLogSources();
            setSources(data);
        }
        catch {
            // Sources endpoint might not be available
        }
    };
    useEffect(() => {
        fetchSources();
    }, []);
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);
    // Auto-refresh effect
    useEffect(() => {
        if (autoRefresh) {
            autoRefreshRef.current = setInterval(fetchLogs, 5000);
        }
        else if (autoRefreshRef.current) {
            clearInterval(autoRefreshRef.current);
            autoRefreshRef.current = null;
        }
        return () => {
            if (autoRefreshRef.current) {
                clearInterval(autoRefreshRef.current);
            }
        };
    }, [autoRefresh, fetchLogs]);
    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };
    const handleSortOrderChange = (_event, newOrder) => {
        if (newOrder !== null) {
            setSortOrder(newOrder);
        }
    };
    const totalPages = Math.ceil(total / limit);
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 1, color: 'var(--theme-text-primary)' }, children: "Logs" }), _jsx(Typography, { variant: "body2", sx: { mb: 4, color: 'var(--theme-text-secondary)' }, children: "View and search application logs" }), _jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [_jsx(Grid, { size: { xs: 6, sm: 3, md: 2.4 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }, children: [_jsx(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-text-primary)', fontWeight: 600 }, children: stats.total.toLocaleString() }) }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: "Total Logs" })] }) }) }), _jsx(Grid, { size: { xs: 6, sm: 3, md: 2.4 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(ErrorIcon, { sx: { color: 'var(--theme-error)', fontSize: 20 } }), _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-error)', fontWeight: 600 }, children: stats.errors })] }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: "Errors" })] }) }) }), _jsx(Grid, { size: { xs: 6, sm: 3, md: 2.4 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(WarningIcon, { sx: { color: 'var(--theme-warning)', fontSize: 20 } }), _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-warning)', fontWeight: 600 }, children: stats.warnings })] }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: "Warnings" })] }) }) }), _jsx(Grid, { size: { xs: 6, sm: 3, md: 2.4 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(InfoIcon, { sx: { color: 'var(--theme-info)', fontSize: 20 } }), _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-info)', fontWeight: 600 }, children: stats.info })] }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: "Info" })] }) }) }), _jsx(Grid, { size: { xs: 6, sm: 3, md: 2.4 }, children: _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(BugReportIcon, { sx: { color: 'var(--theme-text-secondary)', fontSize: 20 } }), _jsx(Typography, { variant: "h5", sx: { color: 'var(--theme-text-primary)', fontWeight: 600 }, children: stats.debug })] }), _jsx(Typography, { variant: "caption", sx: { color: 'var(--theme-text-secondary)' }, children: "Debug" })] }) }) })] }), _jsx(Card, { sx: { mb: 3, bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }, children: [sources.length > 0 && (_jsxs(FormControl, { size: "small", sx: { minWidth: 150 }, children: [_jsx(InputLabel, { sx: { color: 'var(--theme-text-secondary)' }, children: "Source" }), _jsxs(Select, { value: selectedSource, label: "Source", onChange: (e) => setSelectedSource(e.target.value), sx: { color: 'var(--theme-text-primary)' }, children: [_jsx(MenuItem, { value: "", children: "All Sources" }), sources.map((source) => (_jsx(MenuItem, { value: source.name, children: source.name }, source.name)))] })] })), _jsxs(FormControl, { size: "small", sx: { minWidth: 120 }, children: [_jsx(InputLabel, { sx: { color: 'var(--theme-text-secondary)' }, children: "Level" }), _jsxs(Select, { value: selectedLevel, label: "Level", onChange: (e) => setSelectedLevel(e.target.value), sx: { color: 'var(--theme-text-primary)' }, children: [_jsx(MenuItem, { value: "", children: "All Levels" }), _jsx(MenuItem, { value: "error", children: "Error" }), _jsx(MenuItem, { value: "warn", children: "Warning" }), _jsx(MenuItem, { value: "info", children: "Info" }), _jsx(MenuItem, { value: "debug", children: "Debug" })] })] }), _jsx(TextField, { size: "small", placeholder: "Search logs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleSearch(), sx: {
                                    flex: 1,
                                    minWidth: 200,
                                    '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' },
                                }, InputProps: {
                                    startAdornment: _jsx(SearchIcon, { sx: { mr: 1, color: 'var(--theme-text-secondary)' } }),
                                } }), _jsxs(ToggleButtonGroup, { value: sortOrder, exclusive: true, onChange: handleSortOrderChange, size: "small", "aria-label": "sort order", children: [_jsx(ToggleButton, { value: "desc", "aria-label": "newest first", children: _jsx(Tooltip, { title: "Newest First", children: _jsx(ArrowDownwardIcon, { fontSize: "small" }) }) }), _jsx(ToggleButton, { value: "asc", "aria-label": "oldest first", children: _jsx(Tooltip, { title: "Oldest First", children: _jsx(ArrowUpwardIcon, { fontSize: "small" }) }) })] }), _jsx(Tooltip, { title: autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh (5s)', children: _jsx(IconButton, { onClick: () => setAutoRefresh(!autoRefresh), sx: {
                                        color: autoRefresh ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                                        bgcolor: autoRefresh ? 'var(--theme-success)20' : 'transparent',
                                    }, children: autoRefresh ? _jsx(PauseIcon, {}) : _jsx(PlayArrowIcon, {}) }) }), _jsx(Tooltip, { title: "Refresh", children: _jsx(IconButton, { onClick: fetchLogs, sx: { color: 'var(--theme-primary)' }, children: _jsx(RefreshIcon, {}) }) })] }) }) }), error && (_jsx(Card, { sx: { mb: 3, bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }, children: _jsx(CardContent, { children: _jsx(Typography, { color: "error", children: error }) }) })), _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 4 }, children: _jsx(CircularProgress, {}) })) : logs.length === 0 ? (_jsx(CardContent, { children: _jsx(Typography, { sx: { color: 'var(--theme-text-secondary)', textAlign: 'center' }, children: "No logs found" }) })) : (_jsxs(_Fragment, { children: [_jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 180 }, children: "Timestamp" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 100 }, children: "Level" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 120 }, children: "Component" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Message" })] }) }), _jsx(TableBody, { children: logs.map((log, index) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.75rem' }, children: new Date(log.timestamp).toLocaleString() }), _jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: _jsx(Chip, { label: log.level.toUpperCase(), size: "small", sx: {
                                                            bgcolor: getLevelColor(log.level) + '20',
                                                            color: getLevelColor(log.level),
                                                            fontSize: '0.65rem',
                                                            height: 20,
                                                        } }) }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontSize: '0.75rem' }, children: log.namespace || '-' }), _jsx(TableCell, { sx: { color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }, children: log.message })] }, index))) })] }) }), totalPages > 1 && (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', p: 2 }, children: _jsx(Pagination, { count: totalPages, page: page, onChange: (_, value) => setPage(value), sx: {
                                    '& .MuiPaginationItem-root': {
                                        color: 'var(--theme-text-primary)',
                                    },
                                } }) }))] })) })] }));
}
//# sourceMappingURL=LogsPage.js.map