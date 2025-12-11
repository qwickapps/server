import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { api, HealthResponse, InfoResponse } from '../api/controlPanelApi';
import { DashboardWidgetRenderer } from '../dashboard';

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
  const navigate = useNavigate();
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

      {/* Service Status Banner - clickable to navigate to Health page */}
      <Card
        sx={{
          mb: 4,
          bgcolor: 'var(--theme-surface)',
          border: `2px solid ${getStatusColor(health?.status || 'unknown')}`,
        }}
      >
        <CardActionArea onClick={() => navigate('/health')}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusIcon(health?.status || 'unknown')}
              <Box>
                <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                  Service Status: {health?.status?.charAt(0).toUpperCase()}{health?.status?.slice(1)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Click to view detailed health information
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
        </CardActionArea>
      </Card>

      {/* Dynamic widgets from registry */}
      <DashboardWidgetRenderer />
    </Box>
  );
}
