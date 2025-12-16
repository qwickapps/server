/**
 * Integration Status Widget
 *
 * Displays the status of configured integrations with their connection status.
 * Used in the dashboard to show a quick overview of integration health.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../../api/controlPanelApi';

interface Integration {
  id: string;
  name: string;
  description: string;
  configured: boolean;
}

interface IntegrationsConfig {
  integrations: Integration[];
  stats: {
    totalRequests: number;
  };
}

export function IntegrationStatusWidget() {
  const [config, setConfig] = useState<IntegrationsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.fetch<IntegrationsConfig>('/ai-proxy/config');
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch integrations');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ py: 0.5, fontSize: 13 }}>
        Unable to load integrations
      </Alert>
    );
  }

  if (!config) return null;

  const configuredCount = config.integrations.filter((i) => i.configured).length;
  const totalCount = config.integrations.length;

  return (
    <Box
      sx={{
        bgcolor: 'var(--theme-surface)',
        borderRadius: 2,
        p: 2,
        border: '1px solid var(--theme-border)',
      }}
    >
      {/* Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-secondary)' }}>
          {configuredCount} of {totalCount} configured
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-secondary)' }}>
          {config.stats.totalRequests} requests
        </Typography>
      </Box>

      {/* Integration List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {config.integrations.map((integration) => (
          <Box
            key={integration.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              bgcolor: 'var(--theme-background)',
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {integration.configured ? (
                <CheckCircleIcon sx={{ color: 'var(--theme-success)', fontSize: 18 }} />
              ) : (
                <ErrorIcon sx={{ color: 'var(--theme-text-secondary)', fontSize: 18 }} />
              )}
              <Box>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>
                  {integration.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                  {integration.description}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={integration.configured ? 'Connected' : 'Not Configured'}
              size="small"
              sx={{
                bgcolor: integration.configured ? 'var(--theme-success)20' : 'transparent',
                color: integration.configured ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                border: integration.configured ? 'none' : '1px solid var(--theme-border)',
                fontWeight: 500,
                fontSize: 11,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
