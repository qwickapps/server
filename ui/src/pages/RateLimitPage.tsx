import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import CachedIcon from '@mui/icons-material/Cached';
import { api, RateLimitConfig, RateLimitStrategy } from '../api/controlPanelApi';

/**
 * Format milliseconds to human-readable duration
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${ms / 1000}s`;
  if (ms < 3600000) return `${ms / 60000}m`;
  return `${ms / 3600000}h`;
}

export function RateLimitPage() {
  const [config, setConfig] = useState<RateLimitConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable fields
  const [windowMs, setWindowMs] = useState<number>(60000);
  const [maxRequests, setMaxRequests] = useState<number>(100);
  const [strategy, setStrategy] = useState<RateLimitStrategy>('sliding-window');
  const [cleanupEnabled, setCleanupEnabled] = useState<boolean>(true);
  const [cleanupIntervalMs, setCleanupIntervalMs] = useState<number>(300000);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRateLimitConfig();
      setConfig(data);
      // Update editable fields
      setWindowMs(data.windowMs);
      setMaxRequests(data.maxRequests);
      setStrategy(data.strategy);
      setCleanupEnabled(data.cleanupEnabled);
      setCleanupIntervalMs(data.cleanupIntervalMs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch config');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.updateRateLimitConfig({
        windowMs,
        maxRequests,
        strategy,
        cleanupEnabled,
        cleanupIntervalMs,
      });
      setConfig(result.config);
      setSuccess('Configuration saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = config && (
    windowMs !== config.windowMs ||
    maxRequests !== config.maxRequests ||
    strategy !== config.strategy ||
    cleanupEnabled !== config.cleanupEnabled ||
    cleanupIntervalMs !== config.cleanupIntervalMs
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !config) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon sx={{ color: 'var(--theme-primary)', fontSize: 32 }} />
          <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
            Rate Limits
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchConfig} sx={{ color: 'var(--theme-text-secondary)' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !hasChanges}
            sx={{ minWidth: 100 }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Configure rate limiting defaults for your API
      </Typography>

      {/* Success/Error messages */}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && config && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Status Card */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
            System Status
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <StorageIcon sx={{ color: 'var(--theme-text-secondary)' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>Store</Typography>
                <Typography sx={{ color: 'var(--theme-text-primary)' }}>{config?.store}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CachedIcon sx={{ color: config?.cacheAvailable ? 'var(--theme-success)' : 'var(--theme-warning)' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>Cache</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: 'var(--theme-text-primary)' }}>{config?.cache}</Typography>
                  <Chip
                    label={config?.cacheAvailable ? 'Available' : 'Unavailable'}
                    size="small"
                    sx={{
                      bgcolor: config?.cacheAvailable ? 'var(--theme-success)20' : 'var(--theme-warning)20',
                      color: config?.cacheAvailable ? 'var(--theme-success)' : 'var(--theme-warning)',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Rate Limit Settings */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 3 }}>
            Default Rate Limit Settings
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Strategy */}
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'var(--theme-text-secondary)' }}>Strategy</InputLabel>
              <Select
                value={strategy}
                label="Strategy"
                onChange={(e) => setStrategy(e.target.value as RateLimitStrategy)}
                sx={{
                  color: 'var(--theme-text-primary)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--theme-border)' },
                }}
              >
                <MenuItem value="sliding-window">
                  Sliding Window - Smooth rate limiting with weighted overlap
                </MenuItem>
                <MenuItem value="fixed-window">
                  Fixed Window - Simple discrete time windows
                </MenuItem>
                <MenuItem value="token-bucket">
                  Token Bucket - Allows bursts while maintaining average rate
                </MenuItem>
              </Select>
            </FormControl>

            {/* Window and Max Requests */}
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <TextField
                label="Window (ms)"
                type="number"
                value={windowMs}
                onChange={(e) => setWindowMs(Math.max(1000, parseInt(e.target.value) || 60000))}
                helperText={`= ${formatDuration(windowMs)}`}
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{ inputProps: { min: 1000, step: 1000 } }}
              />
              <TextField
                label="Max Requests"
                type="number"
                value={maxRequests}
                onChange={(e) => setMaxRequests(Math.max(1, parseInt(e.target.value) || 100))}
                helperText="Per window per key"
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>

            {/* Summary */}
            <Alert severity="info" sx={{ bgcolor: 'var(--theme-surface)' }}>
              <Typography variant="body2">
                <strong>Current limit:</strong> {maxRequests} requests per {formatDuration(windowMs)} using {strategy} strategy
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>

      {/* Cleanup Settings */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 3 }}>
            Cleanup Job
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={cleanupEnabled}
                  onChange={(e) => setCleanupEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable automatic cleanup of expired rate limits"
              sx={{ color: 'var(--theme-text-primary)' }}
            />

            {cleanupEnabled && (
              <TextField
                label="Cleanup Interval (ms)"
                type="number"
                value={cleanupIntervalMs}
                onChange={(e) => setCleanupIntervalMs(Math.max(60000, parseInt(e.target.value) || 300000))}
                helperText={`= ${formatDuration(cleanupIntervalMs)}`}
                sx={{ maxWidth: 300 }}
                InputProps={{ inputProps: { min: 60000, step: 60000 } }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
