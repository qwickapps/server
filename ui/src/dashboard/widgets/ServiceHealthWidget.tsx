/**
 * Service Health Widget
 *
 * Displays health check status with latency for all registered health checks.
 * This is a built-in widget provided by qwickapps-server.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip } from '@mui/material';
import { GridLayout, Text } from '@qwickapps/react-framework';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { api, HealthResponse } from '../../api/controlPanelApi';

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon sx={{ fontSize: 24, color: 'var(--theme-success)' }} />;
    case 'degraded':
      return <WarningIcon sx={{ fontSize: 24, color: 'var(--theme-warning)' }} />;
    case 'unhealthy':
      return <ErrorIcon sx={{ fontSize: 24, color: 'var(--theme-error)' }} />;
    default:
      return <WarningIcon sx={{ fontSize: 24, color: 'var(--theme-text-secondary)' }} />;
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

/**
 * Service Health Widget Component
 */
export function ServiceHealthWidget() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health');
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }}>
        <CardContent>
          <Text variant="body2" customColor="var(--theme-error)" content={error} />
        </CardContent>
      </Card>
    );
  }

  const healthChecks = health ? Object.entries(health.checks) : [];

  if (healthChecks.length === 0) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Text variant="body2" customColor="var(--theme-text-secondary)" content="No health checks configured" />
        </CardContent>
      </Card>
    );
  }

  // Determine grid columns based on number of health checks (max 4)
  const columns = Math.min(healthChecks.length, 4) as 1 | 2 | 3 | 4;

  return (
    <GridLayout columns={columns} spacing="medium" equalHeight>
      {healthChecks.map(([name, check]) => (
        <Card key={name} sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {getStatusIcon(check.status)}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Text
                  variant="body1"
                  fontWeight="500"
                  content={name.charAt(0).toUpperCase() + name.slice(1)}
                  customColor="var(--theme-text-primary)"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip
                    label={check.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(check.status) + '20',
                      color: getStatusColor(check.status),
                      fontSize: '0.75rem',
                      height: 20,
                    }}
                  />
                  {check.latency !== undefined && (
                    <Text
                      variant="caption"
                      content={`${check.latency}ms`}
                      customColor="var(--theme-text-secondary)"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </GridLayout>
  );
}
