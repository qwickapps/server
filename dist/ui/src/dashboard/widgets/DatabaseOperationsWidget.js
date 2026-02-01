import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Database Operations Widget Component
 * Displays database status and provides manual initialization/recreation controls
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button, Alert, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, } from '@mui/material';
const ConfirmationDialog = ({ open, title, message, confirmText, requiredInput, onConfirm, onCancel, }) => {
    const [inputValue, setInputValue] = useState('');
    const isValid = inputValue === requiredInput;
    return (_jsxs(Dialog, { open: open, onClose: onCancel, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: title }), _jsxs(DialogContent, { children: [_jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: message }), _jsxs(Typography, { variant: "body2", sx: { mb: 1, fontWeight: 'bold' }, children: ["Type \"", requiredInput, "\" to confirm:"] }), _jsx(TextField, { autoFocus: true, fullWidth: true, value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: requiredInput, sx: { fontFamily: 'monospace' } })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onCancel, children: "Cancel" }), _jsx(Button, { onClick: () => {
                            if (isValid) {
                                onConfirm();
                                setInputValue('');
                            }
                        }, disabled: !isValid, variant: "contained", color: "error", children: confirmText })] })] }));
};
const AdminCredentialsDialog = ({ open, onSubmit, onCancel, }) => {
    const [adminUser, setAdminUser] = useState('postgres');
    const [adminPassword, setAdminPassword] = useState('');
    return (_jsxs(Dialog, { open: open, onClose: onCancel, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Admin Credentials Required" }), _jsxs(DialogContent, { children: [_jsx(Typography, { variant: "body2", sx: { mb: 2 }, children: "Provide PostgreSQL admin credentials to perform this operation:" }), _jsx(TextField, { fullWidth: true, label: "Admin User", value: adminUser, onChange: (e) => setAdminUser(e.target.value), sx: { mb: 2 }, placeholder: "postgres" }), _jsx(TextField, { fullWidth: true, type: "password", label: "Admin Password", value: adminPassword, onChange: (e) => setAdminPassword(e.target.value), placeholder: "Enter admin password" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: onCancel, children: "Cancel" }), _jsx(Button, { onClick: () => {
                            if (adminUser && adminPassword) {
                                onSubmit({ adminUser, adminPassword });
                                setAdminUser('postgres');
                                setAdminPassword('');
                            }
                        }, disabled: !adminUser || !adminPassword, variant: "contained", children: "Continue" })] })] }));
};
export const DatabaseOperationsWidget = () => {
    // Use default values since props cannot be passed through WidgetContribution
    const apiPrefix = '/api/postgres:default';
    const instanceName = 'default';
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [operating, setOperating] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmOperation, setConfirmOperation] = useState('initialize');
    const [showAdminDialog, setShowAdminDialog] = useState(false);
    const [adminCredentials, setAdminCredentials] = useState(null);
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${apiPrefix}/status?instance=${instanceName}`);
            if (!response.ok)
                throw new Error('Failed to fetch database status');
            const data = await response.json();
            setStatus(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [apiPrefix, instanceName]);
    const handleInitialize = async (creds) => {
        setOperating(true);
        try {
            const response = await fetch(`${apiPrefix}/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instance: instanceName,
                    ...creds,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || 'Failed to initialize database');
            }
            await fetchStatus();
            alert('Database initialized successfully');
        }
        catch (err) {
            alert(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setOperating(false);
            setShowConfirmDialog(false);
            setShowAdminDialog(false);
            setAdminCredentials(null);
        }
    };
    const handleRecreate = async (creds) => {
        setOperating(true);
        try {
            const response = await fetch(`${apiPrefix}/recreate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instance: instanceName,
                    ...creds,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || 'Failed to recreate database');
            }
            await fetchStatus();
            alert('Database recreated successfully');
        }
        catch (err) {
            alert(`Recreation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setOperating(false);
            setShowConfirmDialog(false);
            setShowAdminDialog(false);
            setAdminCredentials(null);
        }
    };
    const startOperation = (operation) => {
        setConfirmOperation(operation);
        if (!status?.adminCredentialsProvided) {
            setShowAdminDialog(true);
        }
        else if (operation === 'recreate') {
            setShowConfirmDialog(true);
        }
        else {
            handleInitialize();
        }
    };
    const handleAdminCredentialsSubmit = (creds) => {
        setAdminCredentials(creds);
        setShowAdminDialog(false);
        if (confirmOperation === 'recreate') {
            setShowConfirmDialog(true);
        }
        else {
            handleInitialize(creds);
        }
    };
    const handleConfirmDialogConfirm = () => {
        if (confirmOperation === 'recreate') {
            handleRecreate(adminCredentials || undefined);
        }
        else {
            handleInitialize(adminCredentials || undefined);
        }
    };
    if (loading) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(CircularProgress, { size: 20 }), _jsx(Typography, { variant: "body2", children: "Loading database status..." })] }) }) }));
    }
    if (error || !status) {
        return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Typography, { variant: "h6", gutterBottom: true, children: ["Database (", instanceName, ")"] }), _jsx(Alert, { severity: "error", children: error || 'Failed to load database status' })] }) }));
    }
    const requiredInput = status.database
        ? `RECREATE ${status.database.toUpperCase()} DATABASE`
        : 'RECREATE DATABASE';
    const statusColor = status.connected ? 'success' : 'error';
    const statusLabel = status.connected ? 'CONNECTED' : 'ERROR';
    return (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsxs(Typography, { variant: "h6", children: ["Database (", instanceName, ")"] }), _jsx(Chip, { label: statusLabel, color: statusColor, size: "small" })] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: operating
                                ? 'Processing database operation...'
                                : status.connected
                                    ? `Connected to ${status.database}`
                                    : status.errorMessage || 'Database connection error' }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Connection" }), _jsx(Typography, { variant: "body2", fontWeight: "bold", children: statusLabel })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Database" }), _jsx(Typography, { variant: "body2", fontWeight: "bold", children: status.database || 'N/A' })] }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", children: "Host" }), _jsxs(Typography, { variant: "body2", fontWeight: "bold", children: [status.host || 'N/A', ":", status.port || 'N/A'] })] }), !status.connected && !operating && (_jsxs(Box, { sx: { display: 'flex', gap: 1, mt: 2 }, children: [_jsx(Button, { variant: "contained", color: "primary", onClick: () => startOperation('initialize'), size: "small", children: "Initialize Database" }), _jsx(Button, { variant: "contained", color: "error", onClick: () => startOperation('recreate'), size: "small", children: "Recreate Database" })] }))] }) }), _jsx(AdminCredentialsDialog, { open: showAdminDialog, onSubmit: handleAdminCredentialsSubmit, onCancel: () => {
                    setShowAdminDialog(false);
                    setAdminCredentials(null);
                } }), _jsx(ConfirmationDialog, { open: showConfirmDialog, title: "Confirm Database Recreation", message: `This will drop and recreate the database "${status.database}". All data will be lost. This action cannot be undone.`, confirmText: "Recreate", requiredInput: requiredInput, onConfirm: handleConfirmDialogConfirm, onCancel: () => {
                    setShowConfirmDialog(false);
                    setAdminCredentials(null);
                } })] }));
};
export default DatabaseOperationsWidget;
//# sourceMappingURL=DatabaseOperationsWidget.js.map