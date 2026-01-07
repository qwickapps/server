/**
 * CMS Maintenance Widget
 *
 * Provides CMS service control and seed management for the maintenance page
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface CMSStatus {
  status: 'running' | 'unhealthy' | 'down';
  url: string;
  timestamp: string;
}

interface Seed {
  name: string;
  file: string;
  path: string;
}

export function CMSMaintenanceWidget() {
  const [status, setStatus] = useState<CMSStatus | null>(null);
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/cms/status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch CMS status:', err);
    }
  };

  const fetchSeeds = async () => {
    try {
      const response = await fetch('/api/cms/seeds');
      const data = await response.json();
      setSeeds(data.seeds || []);
    } catch (err) {
      console.error('Failed to fetch seeds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSeeds();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/cms/restart', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setSuccess('CMS service restarted successfully');
        setTimeout(() => fetchStatus(), 2000);
      } else {
        setError(data.message || 'Restart not implemented');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart CMS');
    }
  };

  const handleRunSeed = async (seedName: string) => {
    setExecuting(seedName);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/cms/seeds/${seedName}/execute`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(`Seed "${seedName}" executed successfully`);
      } else {
        setError(data.error || 'Seed execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute seed');
    } finally {
      setExecuting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = status?.status === 'running';
  const statusColor = isHealthy ? 'success' : status?.status === 'unhealthy' ? 'warning' : 'error';
  const StatusIcon = isHealthy ? CheckCircleIcon : ErrorIcon;

  return (
    <Card>
      <CardContent>
        {/* Header with Status */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">CMS Service Control</Typography>
          {status && (
            <Chip
              label={status.status.toUpperCase()}
              color={statusColor}
              size="small"
              icon={<StatusIcon />}
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Service Control */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            Service Control
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Manage the Payload CMS service
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRestart}
            disabled={!status}
          >
            Restart CMS Service
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Seed Management */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Seed Scripts</Typography>
            <IconButton size="small" onClick={fetchSeeds}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Execute database seed scripts for initial data setup
          </Typography>

          {seeds.length > 0 ? (
            <List dense>
              {seeds.map((seed) => (
                <ListItem
                  key={seed.name}
                  secondaryAction={
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={executing === seed.name ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                      onClick={() => handleRunSeed(seed.name)}
                      disabled={executing !== null}
                    >
                      {executing === seed.name ? 'Running...' : 'Run'}
                    </Button>
                  }
                >
                  <ListItemText
                    primary={seed.name}
                    secondary={seed.file}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity="info">
              No seed scripts found. Place seed scripts in the configured seeds directory.
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
