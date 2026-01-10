import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AcceptInvitationPage Component
 *
 * Standalone page for users to accept invitations and activate their accounts.
 * Can be used in control panel or frontend applications.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { Text, Button } from '@qwickapps/react-framework';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../api/controlPanelApi';
export function AcceptInvitationPage({ token: tokenProp, title = 'Accept Invitation', subtitle = 'Activate your account', successMessage = 'Your account has been activated successfully!', redirectUrl, redirectLabel = 'Go to App', onSuccess, onError, }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const acceptInvitation = async () => {
            // Get token from prop or URL query parameter
            let inviteToken = tokenProp;
            if (!inviteToken) {
                const params = new URLSearchParams(window.location.search);
                inviteToken = params.get('token') || '';
            }
            if (!inviteToken) {
                setError('No invitation token provided');
                setLoading(false);
                onError?.('No invitation token provided');
                return;
            }
            try {
                const result = await api.acceptInvitation(inviteToken);
                setUser(result.user);
                setSuccess(true);
                onSuccess?.(result.user);
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
                setError(errorMessage);
                onError?.(errorMessage);
            }
            finally {
                setLoading(false);
            }
        };
        acceptInvitation();
    }, [tokenProp, onSuccess, onError]);
    const handleRedirect = () => {
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    };
    return (_jsx(Box, { sx: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'var(--theme-background)',
            p: 3,
        }, children: _jsx(Card, { sx: { maxWidth: 500, width: '100%', bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { p: 4 }, children: [_jsxs(Box, { sx: { textAlign: 'center', mb: 4 }, children: [_jsx(Text, { variant: "h4", content: title, customColor: "var(--theme-text-primary)", style: { marginBottom: '8px' } }), _jsx(Text, { variant: "body2", content: subtitle, customColor: "var(--theme-text-secondary)" })] }), loading && (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }, children: [_jsx(CircularProgress, {}), _jsx(Text, { variant: "body2", content: "Activating your account...", customColor: "var(--theme-text-secondary)" })] })), error && !loading && (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }, children: [_jsx(ErrorIcon, { sx: { fontSize: 64, color: 'var(--theme-error)' } }), _jsx(Alert, { severity: "error", sx: { width: '100%' }, children: error }), _jsx(Text, { variant: "body2", content: "The invitation may have expired or is invalid. Please contact support.", customColor: "var(--theme-text-secondary)", style: { textAlign: 'center' } })] })), success && !loading && (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }, children: [_jsx(CheckCircleIcon, { sx: { fontSize: 64, color: 'var(--theme-success)' } }), _jsx(Alert, { severity: "success", sx: { width: '100%' }, children: successMessage }), user && (_jsxs(Box, { sx: { width: '100%', textAlign: 'center' }, children: [_jsx(Text, { variant: "body1", content: `Welcome, ${user.name || user.email}!`, customColor: "var(--theme-text-primary)", fontWeight: "500", style: { marginBottom: '4px' } }), _jsx(Text, { variant: "body2", content: "Your account is now active and ready to use.", customColor: "var(--theme-text-secondary)" })] })), redirectUrl && (_jsx(Button, { variant: "primary", label: redirectLabel, icon: "arrow_forward", onClick: handleRedirect, fullWidth: true }))] }))] }) }) }));
}
//# sourceMappingURL=AcceptInvitationPage.js.map