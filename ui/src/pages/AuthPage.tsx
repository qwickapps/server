import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
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
import {
  api,
  AuthConfigStatus,
  AuthAdapterType,
  Auth0AdapterConfig,
  SupabaseAdapterConfig,
  SupertokensAdapterConfig,
  BasicAdapterConfig,
  UpdateAuthConfigRequest,
  TestProviderResponse,
} from '../api/controlPanelApi';

/**
 * Get the status color for the auth state
 */
function getStateColor(state: string): string {
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
function getStateIcon(state: string) {
  switch (state) {
    case 'enabled':
      return <CheckCircleIcon sx={{ color: 'var(--theme-success)' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'var(--theme-error)' }} />;
    case 'disabled':
    default:
      return <BlockIcon sx={{ color: 'var(--theme-text-secondary)' }} />;
  }
}

// Default empty configs for each adapter type
const defaultAuth0Config: Auth0AdapterConfig = {
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

const defaultSupabaseConfig: SupabaseAdapterConfig = {
  url: '',
  anonKey: '',
};

const defaultBasicConfig: BasicAdapterConfig = {
  username: '',
  password: '',
  realm: 'Protected Area',
};

const defaultSupertokensConfig: SupertokensAdapterConfig = {
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

interface SocialProvider {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  keyId?: string;
  teamId?: string;
}

export function AuthPage() {
  const [status, setStatus] = useState<AuthConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestProviderResponse | null>(null);

  // Form state
  const [selectedAdapter, setSelectedAdapter] = useState<AuthAdapterType | ''>('');
  const [auth0Config, setAuth0Config] = useState<Auth0AdapterConfig>(defaultAuth0Config);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseAdapterConfig>(defaultSupabaseConfig);
  const [basicConfig, setBasicConfig] = useState<BasicAdapterConfig>(defaultBasicConfig);
  const [supertokensConfig, setSupertokensConfig] = useState<SupertokensAdapterConfig>(defaultSupertokensConfig);
  const [authRequired, setAuthRequired] = useState(true);
  const [excludePaths, setExcludePaths] = useState('');

  // Social providers state (for SuperTokens)
  const [googleProvider, setGoogleProvider] = useState<SocialProvider>({
    enabled: false,
    clientId: '',
    clientSecret: '',
  });
  const [githubProvider, setGithubProvider] = useState<SocialProvider>({
    enabled: false,
    clientId: '',
    clientSecret: '',
  });
  const [appleProvider, setAppleProvider] = useState<SocialProvider>({
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

        if (rc.config.auth0) setAuth0Config({ ...defaultAuth0Config, ...rc.config.auth0 });
        if (rc.config.supabase) setSupabaseConfig({ ...defaultSupabaseConfig, ...rc.config.supabase });
        if (rc.config.basic) setBasicConfig({ ...defaultBasicConfig, ...rc.config.basic });
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
      } else if (data.adapter) {
        // Initialize from current adapter if no runtime config
        setSelectedAdapter(data.adapter as AuthAdapterType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auth status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCopy = (key: string, value: string) => {
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
  const toPlainObject = <T extends object>(obj: T): Record<string, unknown> =>
    JSON.parse(JSON.stringify(obj));

  const getCurrentConfig = (): Record<string, unknown> => {
    switch (selectedAdapter) {
      case 'auth0':
        return toPlainObject(auth0Config);
      case 'supabase':
        return toPlainObject(supabaseConfig);
      case 'basic':
        return toPlainObject(basicConfig);
      case 'supertokens': {
        const config: SupertokensAdapterConfig = { ...supertokensConfig };
        const socialProviders: SupertokensAdapterConfig['socialProviders'] = {};
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
    if (!selectedAdapter) return;

    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testAuthProvider({
        adapter: selectedAdapter,
        config: getCurrentConfig(),
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  // Test the current connection (env-based or runtime config)
  const handleTestCurrentConnection = async () => {
    if (!status?.adapter) return;

    setTesting(true);
    setTestResult(null);
    try {
      // Call the test endpoint with "current" flag to test existing config
      const result = await api.testCurrentAuthProvider();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAdapter) return;

    setSaving(true);
    setError(null);
    try {
      const request: UpdateAuthConfigRequest = {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const configEntries = status?.config ? Object.entries(status.config) : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
          Authentication
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!editMode && (
            <>
              <Tooltip title="Edit Configuration">
                <IconButton onClick={handleEnterEditMode} sx={{ color: 'var(--theme-primary)' }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton onClick={fetchStatus} sx={{ color: 'var(--theme-text-secondary)' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        {editMode ? 'Configure authentication provider' : 'Auth plugin configuration status'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Edit Mode */}
      {editMode ? (
        <Box>
          {/* Adapter Selection */}
          <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                Provider Selection
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'var(--theme-text-secondary)' }}>Auth Provider</InputLabel>
                <Select
                  value={selectedAdapter}
                  onChange={(e) => setSelectedAdapter(e.target.value as AuthAdapterType | '')}
                  label="Auth Provider"
                  sx={{ color: 'var(--theme-text-primary)' }}
                >
                  <MenuItem value="">
                    <em>None (Disabled)</em>
                  </MenuItem>
                  <MenuItem value="supertokens">SuperTokens</MenuItem>
                  <MenuItem value="auth0">Auth0</MenuItem>
                  <MenuItem value="supabase">Supabase</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={authRequired}
                      onChange={(e) => setAuthRequired(e.target.checked)}
                      sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } }}
                    />
                  }
                  label="Auth Required"
                  sx={{ color: 'var(--theme-text-primary)' }}
                />
                <TextField
                  label="Exclude Paths (comma-separated)"
                  value={excludePaths}
                  onChange={(e) => setExcludePaths(e.target.value)}
                  size="small"
                  sx={{ flex: 1, '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  placeholder="/api/health, /api/public/*"
                />
              </Box>
            </CardContent>
          </Card>

          {/* Auth0 Config */}
          {selectedAdapter === 'auth0' && (
            <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                  Auth0 Configuration
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Domain"
                    value={auth0Config.domain}
                    onChange={(e) => setAuth0Config({ ...auth0Config, domain: e.target.value })}
                    required
                    placeholder="your-tenant.auth0.com"
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Client ID"
                    value={auth0Config.clientId}
                    onChange={(e) => setAuth0Config({ ...auth0Config, clientId: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Client Secret"
                    type="password"
                    value={auth0Config.clientSecret}
                    onChange={(e) => setAuth0Config({ ...auth0Config, clientSecret: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Base URL"
                    value={auth0Config.baseUrl}
                    onChange={(e) => setAuth0Config({ ...auth0Config, baseUrl: e.target.value })}
                    required
                    placeholder="https://your-app.com"
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Session Secret"
                    type="password"
                    value={auth0Config.secret}
                    onChange={(e) => setAuth0Config({ ...auth0Config, secret: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="API Audience (optional)"
                    value={auth0Config.audience || ''}
                    onChange={(e) => setAuth0Config({ ...auth0Config, audience: e.target.value })}
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Supabase Config */}
          {selectedAdapter === 'supabase' && (
            <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                  Supabase Configuration
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Project URL"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                    required
                    placeholder="https://your-project.supabase.co"
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Anon Key"
                    type="password"
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Basic Auth Config */}
          {selectedAdapter === 'basic' && (
            <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                  Basic Auth Configuration
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Username"
                    value={basicConfig.username}
                    onChange={(e) => setBasicConfig({ ...basicConfig, username: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={basicConfig.password}
                    onChange={(e) => setBasicConfig({ ...basicConfig, password: e.target.value })}
                    required
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                  <TextField
                    label="Realm (optional)"
                    value={basicConfig.realm || ''}
                    onChange={(e) => setBasicConfig({ ...basicConfig, realm: e.target.value })}
                    placeholder="Protected Area"
                    sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}

          {/* SuperTokens Config */}
          {selectedAdapter === 'supertokens' && (
            <>
              <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                    SuperTokens Configuration
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Connection URI"
                      value={supertokensConfig.connectionUri}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, connectionUri: e.target.value })}
                      required
                      placeholder="http://localhost:3567"
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                    <TextField
                      label="API Key (optional)"
                      type="password"
                      value={supertokensConfig.apiKey || ''}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, apiKey: e.target.value })}
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                    <TextField
                      label="App Name"
                      value={supertokensConfig.appName}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, appName: e.target.value })}
                      required
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                    <TextField
                      label="API Domain"
                      value={supertokensConfig.apiDomain}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, apiDomain: e.target.value })}
                      required
                      placeholder="http://localhost:3000"
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                    <TextField
                      label="Website Domain"
                      value={supertokensConfig.websiteDomain}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, websiteDomain: e.target.value })}
                      required
                      placeholder="http://localhost:3000"
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                    <TextField
                      label="API Base Path"
                      value={supertokensConfig.apiBasePath || '/auth'}
                      onChange={(e) => setSupertokensConfig({ ...supertokensConfig, apiBasePath: e.target.value })}
                      sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={supertokensConfig.enableEmailPassword ?? true}
                          onChange={(e) =>
                            setSupertokensConfig({ ...supertokensConfig, enableEmailPassword: e.target.checked })
                          }
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } }}
                        />
                      }
                      label="Enable Email/Password Auth"
                      sx={{ color: 'var(--theme-text-primary)' }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Social Providers */}
              <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
                <CardContent sx={{ pb: showSocialProviders ? 2 : 0 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowSocialProviders(!showSocialProviders)}
                  >
                    <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                      Social Login Providers
                    </Typography>
                    {showSocialProviders ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </CardContent>
                <Collapse in={showSocialProviders}>
                  <CardContent sx={{ pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Google */}
                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={googleProvider.enabled}
                            onChange={(e) => setGoogleProvider({ ...googleProvider, enabled: e.target.checked })}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } }}
                          />
                        }
                        label="Google"
                        sx={{ color: 'var(--theme-text-primary)', mb: 1 }}
                      />
                      {googleProvider.enabled && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }}>
                          <TextField
                            label="Client ID"
                            size="small"
                            value={googleProvider.clientId}
                            onChange={(e) => setGoogleProvider({ ...googleProvider, clientId: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                          <TextField
                            label="Client Secret"
                            size="small"
                            type="password"
                            value={googleProvider.clientSecret}
                            onChange={(e) => setGoogleProvider({ ...googleProvider, clientSecret: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* GitHub */}
                    <Box sx={{ mb: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={githubProvider.enabled}
                            onChange={(e) => setGithubProvider({ ...githubProvider, enabled: e.target.checked })}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } }}
                          />
                        }
                        label="GitHub"
                        sx={{ color: 'var(--theme-text-primary)', mb: 1 }}
                      />
                      {githubProvider.enabled && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }}>
                          <TextField
                            label="Client ID"
                            size="small"
                            value={githubProvider.clientId}
                            onChange={(e) => setGithubProvider({ ...githubProvider, clientId: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                          <TextField
                            label="Client Secret"
                            size="small"
                            type="password"
                            value={githubProvider.clientSecret}
                            onChange={(e) => setGithubProvider({ ...githubProvider, clientSecret: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                        </Box>
                      )}
                    </Box>

                    {/* Apple */}
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={appleProvider.enabled}
                            onChange={(e) => setAppleProvider({ ...appleProvider, enabled: e.target.checked })}
                            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--theme-primary)' } }}
                          />
                        }
                        label="Apple"
                        sx={{ color: 'var(--theme-text-primary)', mb: 1 }}
                      />
                      {appleProvider.enabled && (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, ml: 4 }}>
                          <TextField
                            label="Client ID"
                            size="small"
                            value={appleProvider.clientId}
                            onChange={(e) => setAppleProvider({ ...appleProvider, clientId: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                          <TextField
                            label="Client Secret"
                            size="small"
                            type="password"
                            value={appleProvider.clientSecret}
                            onChange={(e) => setAppleProvider({ ...appleProvider, clientSecret: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                          <TextField
                            label="Key ID"
                            size="small"
                            value={appleProvider.keyId || ''}
                            onChange={(e) => setAppleProvider({ ...appleProvider, keyId: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                          <TextField
                            label="Team ID"
                            size="small"
                            value={appleProvider.teamId || ''}
                            onChange={(e) => setAppleProvider({ ...appleProvider, teamId: e.target.value })}
                            sx={{ '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' } }}
                          />
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            </>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </Typography>
              <Typography variant="body2">{testResult.message}</Typography>
              {testResult.details?.latency && (
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                  Latency: {testResult.details.latency}ms
                </Typography>
              )}
            </Alert>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancelEdit}
                disabled={saving}
                sx={{
                  color: 'var(--theme-text-secondary)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                Cancel
              </Button>
              {status?.runtimeConfig && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={saving}
                >
                  Reset to Env Vars
                </Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={testing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                onClick={handleTestConnection}
                disabled={!selectedAdapter || testing || saving}
                sx={{
                  color: 'var(--theme-text-primary)',
                  borderColor: 'var(--theme-border)',
                }}
              >
                Test Connection
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  bgcolor: 'var(--theme-primary)',
                  '&:hover': { bgcolor: 'var(--theme-primary-dark)' },
                }}
              >
                Save Configuration
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <>
          {/* Status Card (Read-only view) */}
          <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {getStateIcon(status?.state || 'disabled')}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                    Status:{' '}
                    <Chip
                      label={status?.state?.toUpperCase() || 'UNKNOWN'}
                      size="small"
                      sx={{
                        bgcolor: `${getStateColor(status?.state || 'disabled')}20`,
                        color: getStateColor(status?.state || 'disabled'),
                        fontWeight: 600,
                      }}
                    />
                  </Typography>
                  {status?.adapter && (
                    <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mt: 0.5 }}>
                      Adapter: <strong>{status.adapter}</strong>
                    </Typography>
                  )}
                </Box>
                {/* Test Current Connection Button */}
                {status?.state === 'enabled' && status?.adapter && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={testing ? <CircularProgress size={14} /> : <PlayArrowIcon />}
                    onClick={handleTestCurrentConnection}
                    disabled={testing}
                    sx={{
                      color: 'var(--theme-text-primary)',
                      borderColor: 'var(--theme-border)',
                    }}
                  >
                    Test Connection
                  </Button>
                )}
              </Box>

              {/* Test Result for current connection */}
              {testResult && !editMode && (
                <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                  </Typography>
                  <Typography variant="body2">{testResult.message}</Typography>
                  {testResult.details?.latency && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                      Latency: {testResult.details.latency}ms
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Environment Variables Config Badge */}
              {status?.state === 'enabled' && !status?.runtimeConfig && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Configured via Environment Variables
                  </Typography>
                  <Typography variant="body2">
                    Authentication is configured using environment variables. Click "Edit" to override with runtime
                    configuration (requires PostgreSQL).
                  </Typography>
                </Alert>
              )}

              {/* Runtime Config Badge */}
              {status?.runtimeConfig && (
                <Chip
                  label="Runtime Configuration Active"
                  size="small"
                  sx={{
                    bgcolor: 'var(--theme-primary)',
                    color: 'white',
                    mb: 2,
                  }}
                />
              )}

              {/* Error Message */}
              {status?.state === 'error' && status.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {status.error}
                </Alert>
              )}

              {/* Missing Variables */}
              {status?.missingVars && status.missingVars.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    Missing environment variables:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {status.missingVars.map((v) => (
                      <li key={v}>
                        <code>{v}</code>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}

              {/* Disabled State Info */}
              {status?.state === 'disabled' && (
                <Alert severity="info">
                  <Typography variant="body2">
                    Authentication is disabled. Click the edit button to configure a provider, or set the{' '}
                    <code>AUTH_ADAPTER</code> environment variable.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Valid options: <code>supertokens</code>, <code>auth0</code>, <code>supabase</code>,{' '}
                    <code>basic</code>
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Table */}
          {configEntries.length > 0 && (
            <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent sx={{ pb: 0 }}>
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                  Current Configuration
                </Typography>
              </CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        Variable
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        Value
                      </TableCell>
                      <TableCell
                        sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 60 }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {configEntries.map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                          <Typography
                            sx={{ color: 'var(--theme-text-primary)', fontFamily: 'monospace', fontSize: 13 }}
                          >
                            {key}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                          <Typography
                            sx={{
                              color: value.includes('*') ? 'var(--theme-text-secondary)' : 'var(--theme-text-primary)',
                              fontFamily: 'monospace',
                              fontSize: 13,
                            }}
                          >
                            {value}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                          <Tooltip title={copied === key ? 'Copied!' : 'Copy value'}>
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(key, value)}
                              sx={{ color: copied === key ? 'var(--theme-success)' : 'var(--theme-text-secondary)' }}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* No Configuration */}
          {status?.state === 'enabled' && configEntries.length === 0 && (
            <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                <Typography sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
                  No configuration details available
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Reset to Environment Variables?</DialogTitle>
        <DialogContent>
          <Typography>
            This will delete the runtime configuration from the database. The auth plugin will fall back to environment
            variables on the next request.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
