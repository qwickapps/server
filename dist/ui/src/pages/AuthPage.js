import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Alert, IconButton, Tooltip, Button, TextField, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch, Divider, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { api, } from '../api/controlPanelApi';
/**
 * Get the status color for the auth state
 */
function getStateColor(state) {
    switch (state) {
        case 'enabled':
            return 'var(--theme-success)';
        case 'error':
            return 'var(--theme-error)';
        case 'disabled':
        default:
            return 'var(--theme-text-secondary)';
    }
}
/**
 * Get the status icon for the auth state
 */
function getStateIcon(state) {
    switch (state) {
        case 'enabled':
            return _jsx(CheckCircleIcon, { sx: { color: 'var(--theme-success)' } });
        case 'error':
            return _jsx(ErrorIcon, { sx: { color: 'var(--theme-error)' } });
        case 'disabled':
        default:
            return _jsx(BlockIcon, { sx: { color: 'var(--theme-text-secondary)' } });
    }
}
// Default empty configs for each adapter type
const defaultAuth0Config = {
    domain: '',
    clientId: '',
    clientSecret: '',
    baseUrl: '',
    secret: '',
    audience: '',
    scopes: ['openid', 'profile', 'email'],
    allowedRoles: [],
    allowedDomains: [],
};
const defaultSupabaseConfig = {
    url: '',
    anonKey: '',
};
const defaultBasicConfig = {
    username: '',
    password: '',
    realm: 'Protected Area',
};
const defaultSupertokensConfig = {
    connectionUri: '',
    apiKey: '',
    appName: '',
    apiDomain: '',
    websiteDomain: '',
    apiBasePath: '/auth',
    websiteBasePath: '/auth',
    enableEmailPassword: true,
    socialProviders: {},
};
export function AuthPage() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(null);
    // Edit mode state
    const [editMode, setEditMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    // Form state
    const [selectedAdapter, setSelectedAdapter] = useState('');
    const [auth0Config, setAuth0Config] = useState(defaultAuth0Config);
    const [supabaseConfig, setSupabaseConfig] = useState(defaultSupabaseConfig);
    const [basicConfig, setBasicConfig] = useState(defaultBasicConfig);
    const [supertokensConfig, setSupertokensConfig] = useState(defaultSupertokensConfig);
    const [authRequired, setAuthRequired] = useState(true);
    const [excludePaths, setExcludePaths] = useState('');
    // Social providers state (for SuperTokens)
    const [googleProvider, setGoogleProvider] = useState({
        enabled: false,
        clientId: '',
        clientSecret: '',
    });
    const [githubProvider, setGithubProvider] = useState({
        enabled: false,
        clientId: '',
        clientSecret: '',
    });
    const [appleProvider, setAppleProvider] = useState({
        enabled: false,
        clientId: '',
        clientSecret: '',
        keyId: '',
        teamId: '',
    });
    // UI state
    const [showSocialProviders, setShowSocialProviders] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const fetchStatus = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAuthConfig();
            setStatus(data);
            // Initialize form from runtime config if available
            if (data.runtimeConfig) {
                const rc = data.runtimeConfig;
                setSelectedAdapter(rc.adapter || '');
                setAuthRequired(rc.settings.authRequired ?? true);
                setExcludePaths(rc.settings.excludePaths?.join(', ') || '');
                if (rc.config.auth0)
                    setAuth0Config({ ...defaultAuth0Config, ...rc.config.auth0 });
                if (rc.config.supabase)
                    setSupabaseConfig({ ...defaultSupabaseConfig, ...rc.config.supabase });
                if (rc.config.basic)
                    setBasicConfig({ ...defaultBasicConfig, ...rc.config.basic });
                if (rc.config.supertokens) {
                    const st = rc.config.supertokens;
                    setSupertokensConfig({ ...defaultSupertokensConfig, ...st });
                    if (st.socialProviders?.google) {
                        setGoogleProvider({
                            enabled: true,
                            clientId: st.socialProviders.google.clientId,
                            clientSecret: st.socialProviders.google.clientSecret,
                        });
                    }
                    if (st.socialProviders?.github) {
                        setGithubProvider({
                            enabled: true,
                            clientId: st.socialProviders.github.clientId,
                            clientSecret: st.socialProviders.github.clientSecret,
                        });
                    }
                    if (st.socialProviders?.apple) {
                        setAppleProvider({
                            enabled: true,
                            clientId: st.socialProviders.apple.clientId,
                            clientSecret: st.socialProviders.apple.clientSecret,
                            keyId: st.socialProviders.apple.keyId,
                            teamId: st.socialProviders.apple.teamId,
                        });
                    }
                }
            }
            else if (data.adapter) {
                // Initialize from current adapter if no runtime config
                setSelectedAdapter(data.adapter);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch auth status');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);
    const handleCopy = (key, value) => {
        navigator.clipboard.writeText(value);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };
    const handleEnterEditMode = () => {
        setEditMode(true);
        setTestResult(null);
    };
    const handleCancelEdit = () => {
        setEditMode(false);
        setTestResult(null);
        // Reset form to current status
        fetchStatus();
    };
    // Helper to convert typed config to plain object for API calls
    // Uses JSON round-trip to ensure clean serialization
    const toPlainObject = (obj) => JSON.parse(JSON.stringify(obj));
    const getCurrentConfig = () => {
        switch (selectedAdapter) {
            case 'auth0':
                return toPlainObject(auth0Config);
            case 'supabase':
                return toPlainObject(supabaseConfig);
            case 'basic':
                return toPlainObject(basicConfig);
            case 'supertokens': {
                const config = { ...supertokensConfig };
                const socialProviders = {};
                if (googleProvider.enabled) {
                    socialProviders.google = {
                        clientId: googleProvider.clientId,
                        clientSecret: googleProvider.clientSecret,
                    };
                }
                if (githubProvider.enabled) {
                    socialProviders.github = {
                        clientId: githubProvider.clientId,
                        clientSecret: githubProvider.clientSecret,
                    };
                }
                if (appleProvider.enabled) {
                    socialProviders.apple = {
                        clientId: appleProvider.clientId,
                        clientSecret: appleProvider.clientSecret,
                        keyId: appleProvider.keyId || '',
                        teamId: appleProvider.teamId || '',
                    };
                }
                if (Object.keys(socialProviders).length > 0) {
                    config.socialProviders = socialProviders;
                }
                return toPlainObject(config);
            }
            default:
                return {};
        }
    };
    const handleTestConnection = async () => {
        if (!selectedAdapter)
            return;
        setTesting(true);
        setTestResult(null);
        try {
            const result = await api.testAuthProvider({
                adapter: selectedAdapter,
                config: getCurrentConfig(),
            });
            setTestResult(result);
        }
        catch (err) {
            setTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Test failed',
            });
        }
        finally {
            setTesting(false);
        }
    };
    // Test the current connection (env-based or runtime config)
    const handleTestCurrentConnection = async () => {
        if (!status?.adapter)
            return;
        setTesting(true);
        setTestResult(null);
        try {
            // Call the test endpoint with "current" flag to test existing config
            const result = await api.testCurrentAuthProvider();
            setTestResult(result);
        }
        catch (err) {
            setTestResult({
                success: false,
                message: err instanceof Error ? err.message : 'Test failed',
            });
        }
        finally {
            setTesting(false);
        }
    };
    const handleSave = async () => {
        if (!selectedAdapter)
            return;
        setSaving(true);
        setError(null);
        try {
            const request = {
                adapter: selectedAdapter,
                config: getCurrentConfig(),
                settings: {
                    authRequired,
                    excludePaths: excludePaths
                        .split(',')
                        .map((p) => p.trim())
                        .filter(Boolean),
                },
            };
            await api.updateAuthConfig(request);
            setEditMode(false);
            await fetchStatus();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save configuration');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async () => {
        setSaving(true);
        setError(null);
        try {
            await api.deleteAuthConfig();
            setDeleteDialogOpen(false);
            setEditMode(false);
            await fetchStatus();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete configuration');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }, children: _jsx(CircularProgress, {}) }));
    }
    const configEntries = status?.config ? Object.entries(status.config) : [];
    return (_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }, children: [_jsx(Typography, { variant: "h4", sx: { color: 'var(--theme-text-primary)' }, children: "Authentication" }), _jsx(Box, { sx: { display: 'flex', gap: 1 }, children: !editMode && (_jsxs(_Fragment, { children: [_jsx(Tooltip, { title: "Edit Configuration", children: _jsx(IconButton, { onClick: handleEnterEditMode, sx: { color: 'var(--theme-primary)' }, children: _jsx(EditIcon, {}) }) }), _jsx(Tooltip, { title: "Refresh", children: _jsx(IconButton, { onClick: fetchStatus, sx: { color: 'var(--theme-text-secondary)' }, children: _jsx(RefreshIcon, {}) }) })] })) })] }), _jsx(Typography, { variant: "body2", sx: { mb: 4, color: 'var(--theme-text-secondary)' }, children: editMode ? 'Configure authentication provider' : 'Auth plugin configuration status' }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error })), editMode ? (_jsxs(Box, { children: [_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Provider Selection" }), _jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [_jsx(InputLabel, { sx: { color: 'var(--theme-text-secondary)' }, children: "Auth Provider" }), _jsxs(Select, { value: selectedAdapter, onChange: (e) => setSelectedAdapter(e.target.value), label: "Auth Provider", sx: { color: 'var(--theme-text-primary)' }, children: [_jsx(MenuItem, { value: "", children: _jsx("em", { children: "None (Disabled)" }) }), _jsx(MenuItem, { value: "supertokens", children: "SuperTokens" }), _jsx(MenuItem, { value: "auth0", children: "Auth0" }), _jsx(MenuItem, { value: "supabase", children: "Supabase" }), _jsx(MenuItem, { value: "basic", children: "Basic Auth" })] })] }), _jsxs(Box, { sx: { display: 'flex', gap: 2, alignItems: 'center' }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: authRequired, onChange: (e) => setAuthRequired(e.target.checked), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } } }), label: "Auth Required", sx: { color: 'var(--theme-text-primary)' } }), _jsx(TextField, { label: "Exclude Paths (comma-separated)", value: excludePaths, onChange: (e) => setExcludePaths(e.target.value), size: "small", sx: { flex: 1, '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }, placeholder: "/api/health, /api/public/*" })] })] }) }), selectedAdapter === 'auth0' && (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Auth0 Configuration" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }, children: [_jsx(TextField, { label: "Domain", value: auth0Config.domain, onChange: (e) => setAuth0Config({ ...auth0Config, domain: e.target.value }), required: true, placeholder: "your-tenant.auth0.com", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Client ID", value: auth0Config.clientId, onChange: (e) => setAuth0Config({ ...auth0Config, clientId: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Client Secret", type: "password", value: auth0Config.clientSecret, onChange: (e) => setAuth0Config({ ...auth0Config, clientSecret: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Base URL", value: auth0Config.baseUrl, onChange: (e) => setAuth0Config({ ...auth0Config, baseUrl: e.target.value }), required: true, placeholder: "https://your-app.com", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Session Secret", type: "password", value: auth0Config.secret, onChange: (e) => setAuth0Config({ ...auth0Config, secret: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "API Audience (optional)", value: auth0Config.audience || '', onChange: (e) => setAuth0Config({ ...auth0Config, audience: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] })] }) })), selectedAdapter === 'supabase' && (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Supabase Configuration" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }, children: [_jsx(TextField, { label: "Project URL", value: supabaseConfig.url, onChange: (e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value }), required: true, placeholder: "https://your-project.supabase.co", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Anon Key", type: "password", value: supabaseConfig.anonKey, onChange: (e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] })] }) })), selectedAdapter === 'basic' && (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Basic Auth Configuration" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }, children: [_jsx(TextField, { label: "Username", value: basicConfig.username, onChange: (e) => setBasicConfig({ ...basicConfig, username: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Password", type: "password", value: basicConfig.password, onChange: (e) => setBasicConfig({ ...basicConfig, password: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Realm (optional)", value: basicConfig.realm || '', onChange: (e) => setBasicConfig({ ...basicConfig, realm: e.target.value }), placeholder: "Protected Area", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] })] }) })), selectedAdapter === 'supertokens' && (_jsxs(_Fragment, { children: [_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "SuperTokens Configuration" }), _jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }, children: [_jsx(TextField, { label: "Connection URI", value: supertokensConfig.connectionUri, onChange: (e) => setSupertokensConfig({ ...supertokensConfig, connectionUri: e.target.value }), required: true, placeholder: "http://localhost:3567", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "API Key (optional)", type: "password", value: supertokensConfig.apiKey || '', onChange: (e) => setSupertokensConfig({ ...supertokensConfig, apiKey: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "App Name", value: supertokensConfig.appName, onChange: (e) => setSupertokensConfig({ ...supertokensConfig, appName: e.target.value }), required: true, sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "API Domain", value: supertokensConfig.apiDomain, onChange: (e) => setSupertokensConfig({ ...supertokensConfig, apiDomain: e.target.value }), required: true, placeholder: "http://localhost:3000", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Website Domain", value: supertokensConfig.websiteDomain, onChange: (e) => setSupertokensConfig({ ...supertokensConfig, websiteDomain: e.target.value }), required: true, placeholder: "http://localhost:3000", sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "API Base Path", value: supertokensConfig.apiBasePath || '/auth', onChange: (e) => setSupertokensConfig({ ...supertokensConfig, apiBasePath: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] }), _jsx(Box, { sx: { mt: 2 }, children: _jsx(FormControlLabel, { control: _jsx(Switch, { checked: supertokensConfig.enableEmailPassword ?? true, onChange: (e) => setSupertokensConfig({ ...supertokensConfig, enableEmailPassword: e.target.checked }), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } } }), label: "Enable Email/Password Auth", sx: { color: 'var(--theme-text-primary)' } }) })] }) }), _jsxs(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: [_jsx(CardContent, { sx: { pb: showSocialProviders ? 2 : 0 }, children: _jsxs(Box, { sx: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                            }, onClick: () => setShowSocialProviders(!showSocialProviders), children: [_jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: "Social Login Providers" }), showSocialProviders ? _jsx(ExpandLessIcon, {}) : _jsx(ExpandMoreIcon, {})] }) }), _jsx(Collapse, { in: showSocialProviders, children: _jsxs(CardContent, { sx: { pt: 0 }, children: [_jsx(Divider, { sx: { mb: 2 } }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: googleProvider.enabled, onChange: (e) => setGoogleProvider({ ...googleProvider, enabled: e.target.checked }), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } } }), label: "Google", sx: { color: 'var(--theme-text-primary)', mb: 1 } }), googleProvider.enabled && (_jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }, children: [_jsx(TextField, { label: "Client ID", size: "small", value: googleProvider.clientId, onChange: (e) => setGoogleProvider({ ...googleProvider, clientId: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Client Secret", size: "small", type: "password", value: googleProvider.clientSecret, onChange: (e) => setGoogleProvider({ ...googleProvider, clientSecret: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] }))] }), _jsxs(Box, { sx: { mb: 3 }, children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: githubProvider.enabled, onChange: (e) => setGithubProvider({ ...githubProvider, enabled: e.target.checked }), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } } }), label: "GitHub", sx: { color: 'var(--theme-text-primary)', mb: 1 } }), githubProvider.enabled && (_jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }, children: [_jsx(TextField, { label: "Client ID", size: "small", value: githubProvider.clientId, onChange: (e) => setGithubProvider({ ...githubProvider, clientId: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Client Secret", size: "small", type: "password", value: githubProvider.clientSecret, onChange: (e) => setGithubProvider({ ...githubProvider, clientSecret: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] }))] }), _jsxs(Box, { children: [_jsx(FormControlLabel, { control: _jsx(Switch, { checked: appleProvider.enabled, onChange: (e) => setAppleProvider({ ...appleProvider, enabled: e.target.checked }), sx: { '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } } }), label: "Apple", sx: { color: 'var(--theme-text-primary)', mb: 1 } }), appleProvider.enabled && (_jsxs(Box, { sx: { display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }, children: [_jsx(TextField, { label: "Client ID", size: "small", value: appleProvider.clientId, onChange: (e) => setAppleProvider({ ...appleProvider, clientId: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Client Secret", size: "small", type: "password", value: appleProvider.clientSecret, onChange: (e) => setAppleProvider({ ...appleProvider, clientSecret: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Key ID", size: "small", value: appleProvider.keyId || '', onChange: (e) => setAppleProvider({ ...appleProvider, keyId: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } }), _jsx(TextField, { label: "Team ID", size: "small", value: appleProvider.teamId || '', onChange: (e) => setAppleProvider({ ...appleProvider, teamId: e.target.value }), sx: { '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } } })] }))] })] }) })] })] })), testResult && (_jsxs(Alert, { severity: testResult.success ? 'success' : 'error', sx: { mb: 3 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: testResult.success ? 'Connection Successful' : 'Connection Failed' }), _jsx(Typography, { variant: "body2", children: testResult.message }), testResult.details?.latency && (_jsxs(Typography, { variant: "caption", sx: { display: 'block', mt: 0.5 }, children: ["Latency: ", testResult.details.latency, "ms"] }))] })), _jsxs(Box, { sx: { display: 'flex', gap: 2, justifyContent: 'space-between' }, children: [_jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(CancelIcon, {}), onClick: handleCancelEdit, disabled: saving, sx: {
                                            color: 'var(--theme-text-secondary)',
                                            borderColor: 'var(--theme-border)',
                                        }, children: "Cancel" }), status?.runtimeConfig && (_jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: () => setDeleteDialogOpen(true), disabled: saving, children: "Reset to Env Vars" }))] }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(Button, { variant: "outlined", startIcon: testing ? _jsx(CircularProgress, { size: 16 }) : _jsx(PlayArrowIcon, {}), onClick: handleTestConnection, disabled: !selectedAdapter || testing || saving, sx: {
                                            color: 'var(--theme-text-primary)',
                                            borderColor: 'var(--theme-border)',
                                        }, children: "Test Connection" }), _jsx(Button, { variant: "contained", startIcon: saving ? _jsx(CircularProgress, { size: 16, sx: { color: 'white' } }) : _jsx(SaveIcon, {}), onClick: handleSave, disabled: saving, sx: {
                                            bgcolor: 'var(--theme-primary)',
                                            '&:hover': { bgcolor: 'var(--theme-primary-dark)' },
                                        }, children: "Save Configuration" })] })] })] })) : (_jsxs(_Fragment, { children: [_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2, mb: 2 }, children: [getStateIcon(status?.state || 'disabled'), _jsxs(Box, { sx: { flex: 1 }, children: [_jsxs(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: ["Status:", ' ', _jsx(Chip, { label: status?.state?.toUpperCase() || 'UNKNOWN', size: "small", sx: {
                                                                bgcolor: `${getStateColor(status?.state || 'disabled')}20`,
                                                                color: getStateColor(status?.state || 'disabled'),
                                                                fontWeight: 600,
                                                            } })] }), status?.adapter && (_jsxs(Typography, { variant: "body2", sx: { color: 'var(--theme-text-secondary)', mt: 0.5 }, children: ["Adapter: ", _jsx("strong", { children: status.adapter })] }))] }), status?.state === 'enabled' && status?.adapter && (_jsx(Button, { variant: "outlined", size: "small", startIcon: testing ? _jsx(CircularProgress, { size: 14 }) : _jsx(PlayArrowIcon, {}), onClick: handleTestCurrentConnection, disabled: testing, sx: {
                                                color: 'var(--theme-text-primary)',
                                                borderColor: 'var(--theme-border)',
                                            }, children: "Test Connection" }))] }), testResult && !editMode && (_jsxs(Alert, { severity: testResult.success ? 'success' : 'error', sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: testResult.success ? 'Connection Successful' : 'Connection Failed' }), _jsx(Typography, { variant: "body2", children: testResult.message }), testResult.details?.latency && (_jsxs(Typography, { variant: "caption", sx: { display: 'block', mt: 0.5 }, children: ["Latency: ", testResult.details.latency, "ms"] }))] })), status?.state === 'enabled' && !status?.runtimeConfig && (_jsxs(Alert, { severity: "success", sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600 }, children: "Configured via Environment Variables" }), _jsx(Typography, { variant: "body2", children: "Authentication is configured using environment variables. Click \"Edit\" to override with runtime configuration (requires PostgreSQL)." })] })), status?.runtimeConfig && (_jsx(Chip, { label: "Runtime Configuration Active", size: "small", sx: {
                                        bgcolor: 'var(--theme-primary)',
                                        color: 'white',
                                        mb: 2,
                                    } })), status?.state === 'error' && status.error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: status.error })), status?.missingVars && status.missingVars.length > 0 && (_jsxs(Alert, { severity: "warning", sx: { mb: 2 }, children: [_jsx(Typography, { variant: "body2", sx: { fontWeight: 600, mb: 1 }, children: "Missing environment variables:" }), _jsx(Box, { component: "ul", sx: { m: 0, pl: 2 }, children: status.missingVars.map((v) => (_jsx("li", { children: _jsx("code", { children: v }) }, v))) })] })), status?.state === 'disabled' && (_jsxs(Alert, { severity: "info", children: [_jsxs(Typography, { variant: "body2", children: ["Authentication is disabled. Click the edit button to configure a provider, or set the", ' ', _jsx("code", { children: "AUTH_ADAPTER" }), " environment variable."] }), _jsxs(Typography, { variant: "body2", sx: { mt: 1 }, children: ["Valid options: ", _jsx("code", { children: "supertokens" }), ", ", _jsx("code", { children: "auth0" }), ", ", _jsx("code", { children: "supabase" }), ",", ' ', _jsx("code", { children: "basic" })] })] }))] }) }), configEntries.length > 0 && (_jsxs(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: [_jsx(CardContent, { sx: { pb: 0 }, children: _jsx(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)', mb: 2 }, children: "Current Configuration" }) }), _jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Variable" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Value" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 60 }, children: "Actions" })] }) }), _jsx(TableBody, { children: configEntries.map(([key, value]) => (_jsxs(TableRow, { children: [_jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: _jsx(Typography, { sx: { color: 'var(--theme-text-primary)', fontFamily: 'monospace', fontSize: 13 }, children: key }) }), _jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: _jsx(Typography, { sx: {
                                                                color: value.includes('*') ? 'var(--theme-text-secondary)' : 'var(--theme-text-primary)',
                                                                fontFamily: 'monospace',
                                                                fontSize: 13,
                                                            }, children: value }) }), _jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: _jsx(Tooltip, { title: copied === key ? 'Copied!' : 'Copy value', children: _jsx(IconButton, { size: "small", onClick: () => handleCopy(key, value), sx: { color: copied === key ? 'var(--theme-success)' : 'var(--theme-text-secondary)' }, children: _jsx(ContentCopyIcon, { fontSize: "small" }) }) }) })] }, key))) })] }) })] })), status?.state === 'enabled' && configEntries.length === 0 && (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsx(Typography, { sx: { color: 'var(--theme-text-secondary)', textAlign: 'center' }, children: "No configuration details available" }) }) }))] })), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [_jsx(DialogTitle, { children: "Reset to Environment Variables?" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "This will delete the runtime configuration from the database. The auth plugin will fall back to environment variables on the next request." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleDelete, color: "error", disabled: saving, children: saving ? _jsx(CircularProgress, { size: 20 }) : 'Reset' })] })] })] }));
}
//# sourceMappingURL=AuthPage.js.map