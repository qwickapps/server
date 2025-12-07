import { useState, useEffect } from 'react';
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
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { api, HealthResponse } from '../api/controlPanelApi';

function getStatusIcon(status: string, size = 20) {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon sx={{ color: 'var(--theme-success)', fontSize: size }} />;
    case 'degraded':
      return <WarningIcon sx={{ color: 'var(--theme-warning)', fontSize: size }} />;
    case 'unhealthy':
      return <ErrorIcon sx={{ color: 'var(--theme-error)', fontSize: size }} />;
    default:
      return <CircularProgress size={size} />;
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

function formatLatency(latency?: number): string {
  if (latency === undefined) return '-';
  if (latency < 1000) return `${latency}ms`;
  return `${(latency / 1000).toFixed(2)}s`;
}

export function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000);
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
  const healthPercentage = totalCount > 0 ? (healthyCount / totalCount) * 100 : 0;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'var(--theme-text-primary)' }}>
        Health Checks
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Detailed view of all service health checks
      </Typography>

      {/* Summary Card */}
      <Card sx={{ mb: 4, bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusIcon(health?.status || 'unknown', 32)}
              <Box>
                <Typography variant="h5" sx={{ color: 'var(--theme-text-primary)' }}>
                  Overall Status: {health?.status?.charAt(0).toUpperCase()}{health?.status?.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  {healthyCount} of {totalCount} checks passing
                </Typography>
              </Box>
            </Box>
            <Typography variant="h3" sx={{ color: getStatusColor(health?.status || 'unknown') }}>
              {healthPercentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={healthPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'var(--theme-background)',
              '& .MuiLinearProgress-bar': {
                bgcolor: getStatusColor(health?.status || 'unknown'),
                borderRadius: 4,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Health Checks Table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Check
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Latency
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Last Checked
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Error
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {healthChecks.map(([name, check]) => (
                <TableRow key={name}>
                  <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(check.status)}
                      <Typography fontWeight={500}>{name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                    <Chip
                      label={check.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(check.status) + '20',
                        color: getStatusColor(check.status),
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                    {formatLatency(check.latency)}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    {new Date(check.lastChecked).toLocaleTimeString()}
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-error)', borderColor: 'var(--theme-border)' }}>
                    {check.error || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
