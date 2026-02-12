import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Seed Management Widget
 *
 * Displays available seed scripts grouped by folder and allows executing them.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Checkbox, CircularProgress, Alert, Box, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions, Paper, LinearProgress, } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
export function SeedManagementWidget() {
    const [seeds, setSeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [selected, setSelected] = useState(new Set());
    // Execution dialog state
    const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
    const [executionResults, setExecutionResults] = useState([]);
    const [currentlyExecuting, setCurrentlyExecuting] = useState(null);
    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    // Database reset state
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetting, setResetting] = useState(false);
    useEffect(() => {
        fetchSeeds();
    }, []);
    const fetchSeeds = async () => {
        try {
            const basePath = window.__API_BASE_PATH__ || '';
            const response = await fetch(`${basePath}/maintenance/seeds/discover`);
            if (!response.ok)
                throw new Error('Failed to fetch seeds');
            const data = await response.json();
            setSeeds(data.seeds || []);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch seeds');
        }
        finally {
            setLoading(false);
        }
    };
    const getSeedKey = (seed) => {
        return seed.type === 'file' ? seed.path : seed.id;
    };
    const getFriendlyName = (seed) => {
        if (seed.type === 'task')
            return seed.name;
        // Extract filename without folder and extension
        // "01-Database/001.initialize-schema.mjs" -> "Initialize Schema"
        const filename = seed.name.replace('.mjs', '');
        const withoutNumber = filename.replace(/^\d+\./, ''); // Remove number prefix
        // Convert kebab-case/snake-case to Title Case
        return withoutNumber
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };
    const groupByFolder = () => {
        const folderMap = new Map();
        seeds.forEach(seed => {
            let folderName = 'Ungrouped';
            if (seed.type === 'file' && seed.path) {
                const parts = seed.path.split('/');
                if (parts.length > 1) {
                    folderName = parts[0];
                }
            }
            if (!folderMap.has(folderName)) {
                folderMap.set(folderName, []);
            }
            folderMap.get(folderName).push(seed);
        });
        return Array.from(folderMap.entries())
            .map(([name, seeds]) => ({ name, seeds }))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    };
    const handleToggleSeed = (seedKey) => {
        const newSelected = new Set(selected);
        if (newSelected.has(seedKey)) {
            newSelected.delete(seedKey);
        }
        else {
            newSelected.add(seedKey);
        }
        setSelected(newSelected);
    };
    const handleToggleFolder = (folder) => {
        const folderKeys = folder.seeds.map(getSeedKey);
        const allSelected = folderKeys.every(key => selected.has(key));
        const newSelected = new Set(selected);
        if (allSelected) {
            folderKeys.forEach(key => newSelected.delete(key));
        }
        else {
            folderKeys.forEach(key => newSelected.add(key));
        }
        setSelected(newSelected);
    };
    // Execute a single seed and handle SSE stream
    const executeSeed = async (seedKey, friendlyName, seedType) => {
        const basePath = window.__API_BASE_PATH__ || '';
        const response = await fetch(`${basePath}/maintenance/seeds/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: seedKey, type: seedType }),
        });
        if (!response.ok && !response.headers.get('content-type')?.includes('text/event-stream')) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to start execution' }));
            throw new Error(errorData.error || 'Failed to start execution');
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let output = '';
        let error = '';
        let exitCode = 1;
        if (reader) {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const eventData = JSON.parse(line.slice(6));
                                if (eventData.type === 'stdout') {
                                    output += eventData.data;
                                }
                                else if (eventData.type === 'stderr') {
                                    error += eventData.data;
                                }
                                else if (eventData.type === 'exit') {
                                    const exitData = JSON.parse(eventData.data);
                                    exitCode = exitData.exitCode;
                                }
                            }
                            catch (e) {
                                // Ignore malformed SSE events
                            }
                        }
                    }
                }
            }
            finally {
                reader.releaseLock();
            }
        }
        return {
            seedName: friendlyName,
            success: exitCode === 0,
            output: output || undefined,
            error: error || (exitCode !== 0 ? 'Execution failed' : undefined),
        };
    };
    const handleDatabaseReset = async () => {
        setResetting(true);
        setResetDialogOpen(false);
        try {
            const basePath = window.__API_BASE_PATH__ || '';
            const response = await fetch(`${basePath}/maintenance/database/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset database');
            }
            setSnackbarMessage('Database reset successfully. All tables and data have been deleted.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            // Refresh seeds list after reset
            await fetchSeeds();
        }
        catch (err) {
            setSnackbarMessage(err instanceof Error ? err.message : 'Database reset failed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
        finally {
            setResetting(false);
        }
    };
    const executeSelected = async () => {
        if (selected.size === 0)
            return;
        setExecuting(true);
        setExecutionDialogOpen(true);
        setExecutionResults([]);
        const selectedSeeds = seeds.filter(seed => selected.has(getSeedKey(seed)));
        const results = [];
        for (const seed of selectedSeeds) {
            const seedKey = getSeedKey(seed);
            const friendlyName = getFriendlyName(seed);
            setCurrentlyExecuting(friendlyName);
            try {
                const result = await executeSeed(seedKey, friendlyName, seed.type);
                results.push(result);
            }
            catch (err) {
                results.push({
                    seedName: friendlyName,
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
            setExecutionResults([...results]);
        }
        setCurrentlyExecuting(null);
        setExecuting(false);
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        if (failCount === 0) {
            setSnackbarMessage(`Successfully executed ${successCount} seed${successCount > 1 ? 's' : ''}`);
            setSnackbarSeverity('success');
            setSelected(new Set());
            await fetchSeeds();
        }
        else {
            setSnackbarMessage(`Completed with ${failCount} error${failCount > 1 ? 's' : ''}`);
            setSnackbarSeverity('error');
        }
        setSnackbarOpen(true);
    };
    if (loading) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 24 }) }) }) }));
    }
    const folders = groupByFolder();
    return (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h6", children: "Seed Management" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Manage and execute seed scripts" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [selected.size > 0 && (_jsxs(Button, { variant: "contained", color: "primary", startIcon: executing ? _jsx(CircularProgress, { size: 16 }) : _jsx(PlayArrowIcon, {}), onClick: executeSelected, disabled: executing || resetting, children: ["Run Selected (", selected.size, ")"] })), _jsx(Button, { variant: "outlined", color: "error", onClick: () => setResetDialogOpen(true), disabled: executing || resetting, children: "Reset Database" })] })] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error })), seeds.length === 0 ? (_jsx(Alert, { severity: "info", children: "No seed scripts found" })) : (_jsx(Box, { children: folders.map((folder) => {
                                const folderKeys = folder.seeds.map(getSeedKey);
                                const allSelected = folderKeys.every(key => selected.has(key));
                                const someSelected = folderKeys.some(key => selected.has(key));
                                return (_jsxs(Accordion, { defaultExpanded: true, children: [_jsx(AccordionSummary, { expandIcon: _jsx(ExpandMoreIcon, {}), children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, width: '100%' }, children: [_jsx(Checkbox, { checked: allSelected, indeterminate: someSelected && !allSelected, onClick: (e) => {
                                                            e.stopPropagation();
                                                            handleToggleFolder(folder);
                                                        } }), _jsx(FolderIcon, { color: "primary" }), _jsx(Typography, { variant: "subtitle1", sx: { flexGrow: 1 }, children: folder.name }), _jsx(Chip, { label: `${folder.seeds.length} seed${folder.seeds.length > 1 ? 's' : ''}`, size: "small" })] }) }), _jsx(AccordionDetails, { children: _jsx(List, { dense: true, children: folder.seeds.map((seed) => {
                                                    const seedKey = getSeedKey(seed);
                                                    const isSelected = selected.has(seedKey);
                                                    return (_jsx(ListItem, { disablePadding: true, secondaryAction: _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(PlayArrowIcon, {}), onClick: async () => {
                                                                const friendlyName = getFriendlyName(seed);
                                                                setExecuting(true);
                                                                setExecutionDialogOpen(true);
                                                                setExecutionResults([]);
                                                                setCurrentlyExecuting(friendlyName);
                                                                try {
                                                                    const result = await executeSeed(seedKey, friendlyName, seed.type);
                                                                    setExecutionResults([result]);
                                                                    if (result.success) {
                                                                        setSnackbarMessage(`${friendlyName} executed successfully`);
                                                                        setSnackbarSeverity('success');
                                                                        await fetchSeeds();
                                                                    }
                                                                    else {
                                                                        setSnackbarMessage(`${friendlyName} execution failed`);
                                                                        setSnackbarSeverity('error');
                                                                    }
                                                                }
                                                                catch (err) {
                                                                    setExecutionResults([{
                                                                            seedName: friendlyName,
                                                                            success: false,
                                                                            error: err instanceof Error ? err.message : 'Unknown error',
                                                                        }]);
                                                                    setSnackbarMessage(`${friendlyName} execution failed`);
                                                                    setSnackbarSeverity('error');
                                                                }
                                                                finally {
                                                                    setCurrentlyExecuting(null);
                                                                    setExecuting(false);
                                                                    setSnackbarOpen(true);
                                                                }
                                                            }, disabled: executing, children: "Run" }), children: _jsxs(ListItemButton, { onClick: () => handleToggleSeed(seedKey), children: [_jsx(ListItemIcon, { children: _jsx(Checkbox, { edge: "start", checked: isSelected, tabIndex: -1, disableRipple: true }) }), _jsx(ListItemText, { primary: getFriendlyName(seed), secondary: seed.description || seed.name })] }) }, seedKey));
                                                }) }) })] }, folder.name));
                            }) }))] }) }), _jsxs(Dialog, { open: executionDialogOpen, onClose: () => !executing && setExecutionDialogOpen(false), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["Seed Execution", !executing && (_jsx(Button, { onClick: () => setExecutionDialogOpen(false), sx: { position: 'absolute', right: 8, top: 8 }, size: "small", children: _jsx(CloseIcon, {}) }))] }), _jsxs(DialogContent, { children: [executing && currentlyExecuting && (_jsxs(Box, { sx: { mb: 2 }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: ["Currently executing: ", currentlyExecuting] }), _jsx(LinearProgress, {})] })), executionResults.length > 0 && (_jsx(Box, { children: executionResults.map((result, index) => (_jsxs(Paper, { sx: {
                                        p: 2,
                                        mb: 1,
                                        backgroundColor: result.success ? 'success.dark' : 'error.dark',
                                        color: 'white',
                                    }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 1 }, children: [result.success ? (_jsx(CheckCircleIcon, { color: "inherit" })) : (_jsx(ErrorIcon, { color: "inherit" })), _jsx(Typography, { variant: "subtitle2", fontWeight: "bold", children: result.seedName })] }), result.output && (_jsx(Typography, { variant: "body2", sx: { whiteSpace: 'pre-wrap', fontFamily: 'monospace' }, children: result.output })), result.error && (_jsx(Typography, { variant: "body2", sx: { whiteSpace: 'pre-wrap', fontFamily: 'monospace' }, children: result.error }))] }, index))) }))] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setExecutionDialogOpen(false), disabled: executing, children: "Close" }) })] }), _jsxs(Dialog, { open: resetDialogOpen, onClose: () => !resetting && setResetDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { sx: { color: 'error.main' }, children: "Reset Database?" }), _jsxs(DialogContent, { children: [_jsx(Alert, { severity: "warning", sx: { mb: 2 }, children: "This action cannot be undone!" }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: "This will permanently delete:" }), _jsxs(Box, { component: "ul", sx: { pl: 2 }, children: [_jsx("li", { children: "All database tables" }), _jsx("li", { children: "All stored data" }), _jsx("li", { children: "All seed execution history" }), _jsx("li", { children: "All application content" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 2 }, children: "You will need to run the database initialization seeds again to recreate the schema." })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setResetDialogOpen(false), disabled: resetting, children: "Cancel" }), _jsx(Button, { onClick: handleDatabaseReset, color: "error", variant: "contained", disabled: resetting, startIcon: resetting ? _jsx(CircularProgress, { size: 16 }) : undefined, children: resetting ? 'Resetting...' : 'Reset Database' })] })] }), _jsx(Snackbar, { open: snackbarOpen, autoHideDuration: 6000, onClose: () => setSnackbarOpen(false), anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, children: _jsx(Alert, { onClose: () => setSnackbarOpen(false), severity: snackbarSeverity, sx: { width: '100%' }, children: snackbarMessage }) })] }));
}
//# sourceMappingURL=SeedManagementWidget.js.map