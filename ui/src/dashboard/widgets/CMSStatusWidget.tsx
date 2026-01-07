/**
 * CMS Status Widget
 *
 * Displays Payload CMS service status on the dashboard
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LinkIcon from '@mui/icons-material/Link';

interface CMSStatus {
  status: 'running' | 'unhealthy' | 'down';
  url: string;
  health?: any;
  error?: string;
  timestamp: string;
}

export function CMSStatusWidget() {
  const [status, setStatus] = useState<CMSStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/cms/status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CMS status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error || 'Failed to load CMS status'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = status.status === 'running';
  const statusColor = isHealthy ? 'success' : status.status === 'unhealthy' ? 'warning' : 'error';
  const StatusIcon = isHealthy ? CheckCircleIcon : ErrorIcon;

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Payload CMS</Typography>
          <Chip
            label={status.status.toUpperCase()}
            color={statusColor}
            size="small"
            icon={<StatusIcon />}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <LinkIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {status.url}
            </Typography>
          </Box>

          {status.error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {status.error}
            </Alert>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Last checked: {new Date(status.timestamp).toLocaleTimeString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
