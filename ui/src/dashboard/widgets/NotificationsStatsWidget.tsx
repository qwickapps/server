/**
 * Notifications Stats Widget
 *
 * Displays realtime notifications connection statistics on the Control Panel dashboard.
 * Shows active clients, events processed, and connection health.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Chip, LinearProgress } from '@mui/material';
import { GridLayout, Text } from '@qwickapps/react-framework';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../../api/controlPanelApi';
import type { NotificationsStatsResponse } from '../../api/controlPanelApi';
import { StatCard } from '@qwickapps/react-framework';
import { formatNumber, formatDuration } from '../../utils/formatters';

/**
 * Notifications Stats Widget Component
 */
export function NotificationsStatsWidget() {
  const [stats, setStats] = useState<NotificationsStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getNotificationsStats();
        setStats(data);
        setError(null);
      } catch (err) {
        // Check if it's a 404 (plugin not enabled)
        if (err instanceof Error && err.message.includes('404')) {
          setError('Notifications plugin not enabled');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiOffIcon sx={{ color: 'var(--theme-text-secondary)' }} />
            <Text variant="body2" customColor="var(--theme-text-secondary)" content={error} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const isHealthy = stats.connectionHealth.isHealthy;
  const healthColor = isHealthy ? 'var(--theme-success)' : 'var(--theme-warning)';

  return (
    <Box>
      {/* Connection Status Bar */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 2 }}>
        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isHealthy ? (
                <WifiIcon sx={{ color: healthColor, fontSize: 20 }} />
              ) : (
                <WifiOffIcon sx={{ color: healthColor, fontSize: 20 }} />
              )}
              <Text
                variant="body2"
                content={isHealthy ? 'Connected' : 'Reconnecting...'}
                customColor={healthColor}
                fontWeight="500"
              />
              {stats.connectionHealth.isReconnecting && (
                <Chip
                  label={`Attempt ${stats.connectionHealth.reconnectAttempts}`}
                  size="small"
                  sx={{
                    bgcolor: 'var(--theme-warning)20',
                    color: 'var(--theme-warning)',
                    fontSize: '0.7rem',
                    height: 18,
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Text
                variant="caption"
                content={`${stats.channels.length} channel${stats.channels.length !== 1 ? 's' : ''}`}
                customColor="var(--theme-text-secondary)"
              />
              {stats.lastEventAt && (
                <Text
                  variant="caption"
                  content={`Last event: ${formatDuration(stats.connectionHealth.timeSinceLastEvent)} ago`}
                  customColor="var(--theme-text-secondary)"
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <GridLayout columns={4} spacing="small" equalHeight>
        <StatCard
          icon={<DevicesIcon sx={{ fontSize: 28 }} />}
          label="Active Clients"
          value={stats.currentConnections}
          subValue={`${stats.totalConnections} total`}
          color="var(--theme-primary)"
        />
        <StatCard
          icon={<PersonIcon sx={{ fontSize: 28 }} />}
          label="By Device"
          value={stats.clientsByType.device}
          subValue={`${stats.clientsByType.user} by user`}
          color="var(--theme-info)"
        />
        <StatCard
          icon={<SendIcon sx={{ fontSize: 28 }} />}
          label="Events Routed"
          value={formatNumber(stats.eventsRouted)}
          subValue={`${formatNumber(stats.eventsProcessed)} processed`}
          color="var(--theme-success)"
        />
        <StatCard
          icon={<ErrorIcon sx={{ fontSize: 28 }} />}
          label="Dropped"
          value={formatNumber(stats.eventsDroppedNoClients)}
          subValue={`${stats.eventsParseFailed} parse errors`}
          color={stats.eventsDroppedNoClients > 0 ? 'var(--theme-warning)' : 'var(--theme-text-secondary)'}
        />
      </GridLayout>
    </Box>
  );
}
