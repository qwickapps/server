import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import ComputerIcon from '@mui/icons-material/Computer';
import StorageIcon from '@mui/icons-material/Storage';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { api, DiagnosticsResponse } from '../api/controlPanelApi';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const data = await api.getDiagnostics();
      setDiagnostics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
    setSnackbar({ open: true, message: 'Diagnostics copied to clipboard' });
  };

  if (loading && !diagnostics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const memoryUsedPercent = diagnostics
    ? (diagnostics.system.memory.used / diagnostics.system.memory.total) * 100
    : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
          Diagnostics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Copy diagnostics JSON">
            <IconButton onClick={handleCopyAll} sx={{ color: 'var(--theme-primary)' }}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDiagnostics} sx={{ color: 'var(--theme-primary)' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        System information and health diagnostics for AI agents and troubleshooting
      </Typography>

      <Grid container spacing={3}>
        {/* System Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ComputerIcon sx={{ color: 'var(--theme-primary)' }} />
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                  System Information
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Node.js</Typography>
                  <Chip
                    label={diagnostics?.system.nodeVersion}
                    size="small"
                    sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Platform</Typography>
                  <Chip
                    label={diagnostics?.system.platform}
                    size="small"
                    sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Architecture</Typography>
                  <Chip
                    label={diagnostics?.system.arch}
                    size="small"
                    sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Usage */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MemoryIcon sx={{ color: 'var(--theme-warning)' }} />
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                  Memory Usage
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>
                    Heap Used
                  </Typography>
                  <Typography sx={{ color: 'var(--theme-text-primary)' }}>
                    {formatBytes(diagnostics?.system.memory.used || 0)}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={memoryUsedPercent}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'var(--theme-background)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: memoryUsedPercent > 80 ? 'var(--theme-error)' : 'var(--theme-warning)',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Heap Total</Typography>
                  <Typography sx={{ color: 'var(--theme-text-primary)' }}>
                    {formatBytes(diagnostics?.system.memory.total || 0)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Heap Free</Typography>
                  <Typography sx={{ color: 'var(--theme-text-primary)' }}>
                    {formatBytes(diagnostics?.system.memory.free || 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Service Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <StorageIcon sx={{ color: 'var(--theme-info)' }} />
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                  Service Info
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Product</Typography>
                  <Typography sx={{ color: 'var(--theme-text-primary)' }}>
                    {diagnostics?.product}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Version</Typography>
                  <Chip
                    label={diagnostics?.version || 'N/A'}
                    size="small"
                    sx={{ bgcolor: 'var(--theme-primary)20', color: 'var(--theme-primary)' }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: 'var(--theme-text-secondary)' }}>Timestamp</Typography>
                  <Typography sx={{ color: 'var(--theme-text-primary)', fontSize: '0.875rem' }}>
                    {diagnostics?.timestamp ? new Date(diagnostics.timestamp).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Uptime */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AccessTimeIcon sx={{ color: 'var(--theme-success)' }} />
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                  Uptime
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ color: 'var(--theme-success)', mb: 1 }}>
                {formatUptime(diagnostics?.uptime || 0)}
              </Typography>
              <Typography sx={{ color: 'var(--theme-text-secondary)' }}>
                Service has been running without interruption
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Raw JSON */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
                Raw Diagnostics JSON (for AI agents)
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: 'var(--theme-background)',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  maxHeight: 300,
                  color: 'var(--theme-text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                }}
              >
                {JSON.stringify(diagnostics, null, 2)}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
