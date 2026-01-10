import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Auth Status Widget
 *
 * Displays the authentication plugin status on the dashboard.
 * Shows whether auth is enabled, the adapter type, and configuration status.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BlockIcon from '@mui/icons-material/Block';
import { api } from '../../api/controlPanelApi';
const adapterLabels = {
    supertokens: 'SuperTokens',
    auth0: 'Auth0',
    supabase: 'Supabase',
    basic: 'Basic Auth',
};
export function AuthStatusWidget() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const data = await api.fetch('/auth/config/status');
                setStatus(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch auth status');
            }
            finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, []);
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 20 }) }));
    }
    if (error) {
        return (_jsx(Alert, { severity: "warning", sx: { py: 0.5, fontSize: 13 }, children: "Unable to load auth status" }));
    }
    if (!status)
        return null;
    const getStateIcon = () => {
        switch (status.state) {
            case 'enabled':
                return _jsx(CheckCircleIcon, { sx: { color: 'var(--theme-success)', fontSize: 32 } });
            case 'error':
                return _jsx(ErrorIcon, { sx: { color: 'var(--theme-error)', fontSize: 32 } });
            case 'disabled':
            default:
                return _jsx(BlockIcon, { sx: { color: 'var(--theme-text-secondary)', fontSize: 32 } });
        }
    };
    const getStateColor = () => {
        switch (status.state) {
            case 'enabled':
                return 'var(--theme-success)';
            case 'error':
                return 'var(--theme-error)';
            case 'disabled':
            default:
                return 'var(--theme-text-secondary)';
        }
    };
    return (_jsxs(Box, { sx: {
            bgcolor: 'var(--theme-surface)',
            borderRadius: 2,
            p: 2,
            border: '1px solid var(--theme-border)',
        }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [getStateIcon(), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }, children: [_jsx(Typography, { variant: "subtitle1", sx: { color: 'var(--theme-text-primary)', fontWeight: 600 }, children: status.state === 'enabled' && status.adapter
                                            ? adapterLabels[status.adapter] || status.adapter
                                            : status.state === 'disabled'
                                                ? 'Not Configured'
                                                : 'Configuration Error' }), _jsx(Chip, { label: status.state.toUpperCase(), size: "small", sx: {
                                            bgcolor: `${getStateColor()}20`,
                                            color: getStateColor(),
                                            fontWeight: 600,
                                            fontSize: 10,
                                            height: 20,
                                        } })] }), _jsx(Typography, { variant: "body2", sx: { color: 'var(--theme-text-secondary)' }, children: status.state === 'enabled'
                                    ? 'Authentication is active'
                                    : status.state === 'disabled'
                                        ? 'Set AUTH_ADAPTER environment variable'
                                        : status.error || 'Check configuration' })] })] }), status.missingVars && status.missingVars.length > 0 && (_jsxs(Alert, { severity: "warning", sx: { mt: 2, py: 0.5, '& .MuiAlert-message': { fontSize: 12 } }, children: ["Missing: ", status.missingVars.join(', ')] }))] }));
}
//# sourceMappingURL=AuthStatusWidget.js.map