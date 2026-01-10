import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PreferencesPage Component
 *
 * User preferences management page with JSON editor.
 * Preferences are stored as flexible JSON objects per user.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Typography, Alert, CircularProgress, Chip, } from '@mui/material';
import { Button } from '@qwickapps/react-framework';
import { api } from '../api/controlPanelApi';
import { MAX_PREFERENCES_SIZE, MAX_NESTING_DEPTH } from '../config/preferences';
/**
 * Check if an object exceeds maximum nesting depth
 */
function exceedsMaxDepth(obj, depth = 0) {
    if (depth > MAX_NESTING_DEPTH)
        return true;
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.values(obj).some(v => exceedsMaxDepth(v, depth + 1));
    }
    if (Array.isArray(obj)) {
        return obj.some(v => exceedsMaxDepth(v, depth + 1));
    }
    return false;
}
export function PreferencesPage() {
    const [jsonText, setJsonText] = useState('{}');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [jsonError, setJsonError] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    // Load preferences on mount
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await api.getPreferences();
                setJsonText(JSON.stringify(response.preferences, null, 2));
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load preferences');
            }
            finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);
    // Handle JSON text changes
    const handleJsonChange = (value) => {
        setJsonText(value);
        setHasChanges(true);
        setSuccess(false);
        // Validate JSON syntax and nesting depth
        try {
            const parsed = JSON.parse(value);
            // Check nesting depth
            if (exceedsMaxDepth(parsed)) {
                setJsonError(`Preferences object too deeply nested (max ${MAX_NESTING_DEPTH} levels)`);
                return;
            }
            setJsonError(null);
        }
        catch (err) {
            setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
        }
    };
    // Save preferences
    const handleSave = async () => {
        if (jsonError) {
            return;
        }
        try {
            const parsedPreferences = JSON.parse(jsonText);
            setSaving(true);
            setError(null);
            const response = await api.updatePreferences(parsedPreferences);
            setJsonText(JSON.stringify(response.preferences, null, 2));
            setSuccess(true);
            setHasChanges(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save preferences');
        }
        finally {
            setSaving(false);
        }
    };
    // Reset to defaults
    const handleReset = async () => {
        if (!confirm('Reset all preferences to defaults? This cannot be undone.')) {
            return;
        }
        try {
            setSaving(true);
            setError(null);
            await api.deletePreferences();
            // Reload preferences after reset
            const response = await api.getPreferences();
            setJsonText(JSON.stringify(response.preferences, null, 2));
            setSuccess(true);
            setHasChanges(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset preferences');
        }
        finally {
            setSaving(false);
        }
    };
    // Format JSON
    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonText);
            setJsonText(JSON.stringify(parsed, null, 2));
            setJsonError(null);
        }
        catch (err) {
            // JSON already invalid, error already shown
        }
    };
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }, children: _jsx(CircularProgress, {}) }));
    }
    const charCount = jsonText.length;
    const sizePercent = (charCount / MAX_PREFERENCES_SIZE) * 100;
    return (_jsxs(Box, { children: [_jsxs(Box, { sx: { mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { color: 'var(--theme-text-primary)' }, children: "Preferences" }), _jsx(Typography, { variant: "body2", sx: { color: 'var(--theme-text-secondary)', mt: 0.5 }, children: "Manage your user preferences as JSON" })] }), _jsx(Box, { sx: { display: 'flex', gap: 1 }, children: _jsx(Chip, { label: `${charCount.toLocaleString()} / ${MAX_PREFERENCES_SIZE.toLocaleString()} bytes`, size: "small", color: sizePercent > 90 ? 'error' : sizePercent > 75 ? 'warning' : 'default' }) })] }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })), success && (_jsx(Alert, { severity: "success", sx: { mb: 2 }, onClose: () => setSuccess(false), children: "Preferences saved successfully" })), _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 2 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }, children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Preferences JSON" }), _jsx(Button, { variant: "outlined", onClick: handleFormat, disabled: !!jsonError, children: "Format JSON" })] }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 20, value: jsonText, onChange: (e) => handleJsonChange(e.target.value), error: !!jsonError, helperText: jsonError || `Edit your preferences as JSON. Max ${MAX_PREFERENCES_SIZE.toLocaleString()} bytes, max ${MAX_NESTING_DEPTH} levels deep.`, sx: {
                                '& .MuiInputBase-root': {
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                },
                            } })] }) }), _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "outlined", onClick: handleReset, disabled: saving, color: "error", children: "Reset to Defaults" }), _jsx(Button, { variant: "contained", onClick: handleSave, disabled: !!jsonError || !hasChanges || saving, loading: saving, children: "Save Preferences" })] })] }));
}
//# sourceMappingURL=PreferencesPage.js.map