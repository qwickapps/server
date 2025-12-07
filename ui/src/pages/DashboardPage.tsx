import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';
import StorageIcon from '@mui/icons-material/Storage';
import { api, HealthResponse, InfoResponse } from '../api/controlPanelApi';

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon sx={{ color: 'var(--theme-success)' }} />;
    case 'degraded':
      return <WarningIcon sx={{ color: 'var(--theme-warning)' }} />;
    case 'unhealthy':
      return <ErrorIcon sx={{ color: 'var(--theme-error)' }} />;
    default:
      return <CircularProgress size={20} />;
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'var(--theme-success)';
    case 'degraded':
      return 'var(--theme-warning)';
    case 'unhealthy':
      return 'var(--theme-error)';
    default:
      return 'var(--theme-text-secondary)';
  }
}

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [info, setInfo] = useState<InfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, infoData] = await Promise.all([
          api.getHealth(),
          api.getInfo(),
        ]);
        setHealth(healthData);
        setInfo(infoData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
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

  const healthChecks = health ? Object.entries(health.checks) : [];
  const healthyCount = healthChecks.filter(([, c]) => c.status === 'healthy').length;
  const totalCount = healthChecks.length;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'var(--theme-text-primary)' }}>
        Dashboard
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Real-time overview of {info?.product || 'your service'}
      </Typography>

      {/* Status Banner */}
      <Card
        sx={{
          mb: 4,
          bgcolor: 'var(--theme-surface)',
          border: `2px solid ${getStatusColor(health?.status || 'unknown')}`,
        }}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getStatusIcon(health?.status || 'unknown')}
            <Box>
              <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                Service Status: {health?.status?.charAt(0).toUpperCase()}{health?.status?.slice(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={`${healthyCount}/${totalCount} checks passing`}
            sx={{
              bgcolor: getStatusColor(health?.status || 'unknown') + '20',
              color: getStatusColor(health?.status || 'unknown'),
            }}
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTimeIcon sx={{ color: 'var(--theme-primary)' }} />
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Uptime
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'var(--theme-primary)' }}>
                {health ? formatUptime(health.uptime) : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: 'var(--theme-success)' }} />
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Health Checks
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'var(--theme-success)' }}>
                {healthyCount}/{totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MemoryIcon sx={{ color: 'var(--theme-warning)' }} />
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Version
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
                {info?.version || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <StorageIcon sx={{ color: 'var(--theme-info)' }} />
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Product
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'var(--theme-text-primary)' }}>
                {info?.product || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Health Checks Detail */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, color: 'var(--theme-text-primary)' }}>
            Health Checks
          </Typography>
          <Grid container spacing={2}>
            {healthChecks.map(([name, check]) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={name}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'var(--theme-background)',
                    border: `1px solid ${getStatusColor(check.status)}40`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(check.status)}
                      <Typography sx={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>
                        {name}
                      </Typography>
                    </Box>
                    {check.latency !== undefined && (
                      <Chip
                        label={`${check.latency}ms`}
                        size="small"
                        sx={{ bgcolor: 'var(--theme-surface)', color: 'var(--theme-text-secondary)' }}
                      />
                    )}
                  </Box>
                  {check.error && (
                    <Typography variant="caption" sx={{ color: 'var(--theme-error)' }}>
                      {check.error}
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
