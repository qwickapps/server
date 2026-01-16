/**
 * Cache Maintenance Widget
 *
 * Provides cache management operations:
 * - View cache statistics
 * - Clear cache (flush all keys)
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface CacheStats {
  connected: boolean;
  keyCount: number;
  usedMemory?: string;
}

export function CacheMaintenanceWidget() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [flushing, setFlushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cache:default/stats');
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cache plugin not configured');
        }
        throw new Error('Failed to fetch cache stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFlushCache = async () => {
    setConfirmOpen(false);
    setFlushing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/cache:default/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to flush cache');
      }

      const data = await response.json();
      setSuccess(
        data.message + (data.deletedCount !== undefined ? ` (${data.deletedCount} keys deleted)` : '')
      );

      // Refresh stats
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flush cache');
    } finally {
      setFlushing(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Cache Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View cache statistics and clear cache
        </Typography>

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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : stats ? (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Status:</strong>
              </Typography>
              <Chip
                size="small"
                icon={stats.connected ? <CheckCircleIcon /> : <ErrorIcon />}
                label={stats.connected ? 'Connected' : 'Disconnected'}
                color={stats.connected ? 'success' : 'error'}
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              <strong>Key Count:</strong> {stats.keyCount.toLocaleString()}
            </Typography>

            {stats.usedMemory && (
              <Typography variant="body2" color="text.secondary">
                <strong>Memory Used:</strong> {stats.usedMemory}
              </Typography>
            )}
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={flushing ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={!stats || !stats.connected || flushing || loading}
          >
            Flush Cache
          </Button>
        </Box>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Flush Cache</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to flush the cache? This will delete{' '}
              {stats?.keyCount.toLocaleString()} keys. This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleFlushCache} color="error" variant="contained">
              Flush
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
