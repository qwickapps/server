/**
 * Notifications Page
 *
 * Full management page for the Notifications Plugin.
 * Shows connection stats, connected clients table, and management actions.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
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
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import DevicesIcon from '@mui/icons-material/Devices';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import ErrorIcon from '@mui/icons-material/Error';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DisconnectIcon from '@mui/icons-material/LinkOff';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { GridLayout } from '@qwickapps/react-framework';
import {
  api,
  type NotificationsStatsResponse,
  type NotificationsClient,
} from '../api/controlPanelApi';
import { StatCard } from '@qwickapps/react-framework';
import { formatDuration, formatNumber, truncateId } from '../utils/formatters';

export function NotificationsPage() {
  const [stats, setStats] = useState<NotificationsStatsResponse | null>(null);
  const [clients, setClients] = useState<NotificationsClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState<NotificationsClient | null>(null);

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, clientsData] = await Promise.all([
        api.getNotificationsStats(),
        api.getNotificationsClients(),
      ]);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setStats(statsData);
        setClients(clientsData.clients);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (err instanceof Error && err.message.includes('404')) {
          setError('Notifications plugin not enabled');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData]);

  const handleDisconnect = async (client: NotificationsClient) => {
    setDisconnectingId(client.id);
    setConfirmDisconnect(null);
    try {
      await api.disconnectNotificationsClient(client.id);
      if (isMountedRef.current) {
        setSuccess(`Client ${truncateId(client.id)} disconnected`);
        setTimeout(() => {
          if (isMountedRef.current) setSuccess(null);
        }, 3000);
        await fetchData();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to disconnect client');
      }
    } finally {
      if (isMountedRef.current) {
        setDisconnectingId(null);
      }
    }
  };

  const handleForceReconnect = async () => {
    setReconnecting(true);
    try {
      const result = await api.forceNotificationsReconnect();
      if (isMountedRef.current) {
        setSuccess(result.message);
        setTimeout(() => {
          if (isMountedRef.current) setSuccess(null);
        }, 3000);
        await fetchData();
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to force reconnect');
      }
    } finally {
      if (isMountedRef.current) {
        setReconnecting(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !stats) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-border)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiOffIcon sx={{ color: 'var(--theme-text-secondary)' }} />
            <Typography sx={{ color: 'var(--theme-text-secondary)' }}>{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const isHealthy = stats?.connectionHealth.isHealthy ?? false;
  const healthColor = isHealthy ? 'var(--theme-success)' : 'var(--theme-warning)';

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <NotificationsIcon sx={{ color: 'var(--theme-primary)', fontSize: 32 }} />
          <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
            Notifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} sx={{ color: 'var(--theme-text-secondary)' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={reconnecting ? <CircularProgress size={16} /> : <RestartAltIcon />}
            onClick={handleForceReconnect}
            disabled={reconnecting}
            sx={{ borderColor: 'var(--theme-border)' }}
          >
            {reconnecting ? 'Reconnecting...' : 'Force Reconnect'}
          </Button>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Manage realtime notification connections and SSE clients
      </Typography>

      {/* Success/Error messages */}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {error && stats && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Connection Status Bar */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isHealthy ? (
                <WifiIcon sx={{ color: healthColor, fontSize: 20 }} />
              ) : (
                <WifiOffIcon sx={{ color: healthColor, fontSize: 20 }} />
              )}
              <Typography sx={{ color: healthColor, fontWeight: 500 }}>
                {isHealthy ? 'Connected' : 'Reconnecting...'}
              </Typography>
              {stats?.connectionHealth.isReconnecting && (
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
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                {stats?.channels.length} channel{stats?.channels.length !== 1 ? 's' : ''}
              </Typography>
              {stats?.lastEventAt && (
                <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Last event: {formatDuration(stats.connectionHealth.timeSinceLastEvent)} ago
                </Typography>
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
          value={stats?.currentConnections ?? 0}
          subValue={`${stats?.totalConnections ?? 0} total`}
          color="var(--theme-primary)"
        />
        <StatCard
          icon={<PersonIcon sx={{ fontSize: 28 }} />}
          label="By Device"
          value={stats?.clientsByType.device ?? 0}
          subValue={`${stats?.clientsByType.user ?? 0} by user`}
          color="var(--theme-info)"
        />
        <StatCard
          icon={<SendIcon sx={{ fontSize: 28 }} />}
          label="Events Routed"
          value={formatNumber(stats?.eventsRouted ?? 0)}
          subValue={`${formatNumber(stats?.eventsProcessed ?? 0)} processed`}
          color="var(--theme-success)"
        />
        <StatCard
          icon={<ErrorIcon sx={{ fontSize: 28 }} />}
          label="Dropped"
          value={formatNumber(stats?.eventsDroppedNoClients ?? 0)}
          subValue={`${stats?.eventsParseFailed ?? 0} parse errors`}
          color={(stats?.eventsDroppedNoClients ?? 0) > 0 ? 'var(--theme-warning)' : 'var(--theme-text-secondary)'}
        />
      </GridLayout>

      {/* Clients Table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
            Connected Clients
          </Typography>

          {clients.length === 0 ? (
            <Typography sx={{ color: 'var(--theme-text-secondary)', py: 4, textAlign: 'center' }}>
              No clients currently connected
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      Client ID
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      Device ID
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      User ID
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      Connected
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      Duration
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                        <Tooltip title={client.id}>
                          <code style={{ fontSize: '0.85em' }}>{truncateId(client.id)}</code>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                        {client.deviceId ? (
                          <Tooltip title={client.deviceId}>
                            <Chip
                              size="small"
                              icon={<DevicesIcon sx={{ fontSize: 14 }} />}
                              label={truncateId(client.deviceId)}
                              sx={{ bgcolor: 'var(--theme-primary)20', color: 'var(--theme-primary)' }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                        {client.userId ? (
                          <Tooltip title={client.userId}>
                            <Chip
                              size="small"
                              icon={<PersonIcon sx={{ fontSize: 14 }} />}
                              label={truncateId(client.userId)}
                              sx={{ bgcolor: 'var(--theme-info)20', color: 'var(--theme-info)' }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        {new Date(client.connectedAt).toLocaleTimeString()}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        {formatDuration(client.durationMs)}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="right">
                        <Tooltip title="Disconnect client">
                          <IconButton
                            size="small"
                            onClick={() => setConfirmDisconnect(client)}
                            disabled={disconnectingId === client.id}
                            sx={{ color: 'var(--theme-error)' }}
                          >
                            {disconnectingId === client.id ? (
                              <CircularProgress size={18} />
                            ) : (
                              <DisconnectIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDisconnect}
        onClose={() => setConfirmDisconnect(null)}
        aria-labelledby="disconnect-dialog-title"
      >
        <DialogTitle id="disconnect-dialog-title">Disconnect Client?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disconnect this client?
            {confirmDisconnect?.deviceId && (
              <><br /><strong>Device:</strong> {truncateId(confirmDisconnect.deviceId)}</>
            )}
            {confirmDisconnect?.userId && (
              <><br /><strong>User:</strong> {truncateId(confirmDisconnect.userId)}</>
            )}
            <br /><br />
            The client will receive a disconnect event and the connection will be closed.
            The client may automatically reconnect.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDisconnect(null)}>Cancel</Button>
          <Button
            onClick={() => confirmDisconnect && handleDisconnect(confirmDisconnect)}
            color="error"
            autoFocus
          >
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
