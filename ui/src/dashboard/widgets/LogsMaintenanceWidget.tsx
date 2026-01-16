/**
 * Logs Maintenance Widget
 *
 * Provides log management operations:
 * - View log statistics
 * - Clear log files
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';

interface LogSource {
  name: string;
  type: string;
}

interface LogStats {
  totalLogs: number;
  byLevel: {
    debug: number;
    info: number;
    warn: number;
    error: number;
  };
  fileSize: number;
  fileSizeFormatted: string;
  oldestLog: string | null;
  newestLog: string | null;
}

export function LogsMaintenanceWidget() {
  const [sources, setSources] = useState<LogSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/logs/sources');
      if (!response.ok) throw new Error('Failed to fetch log sources');
      const data = await response.json();
      setSources(data.sources || []);
      if (data.sources && data.sources.length > 0 && !selectedSource) {
        setSelectedSource(data.sources[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log sources');
    }
  };

  const fetchStats = async () => {
    if (!selectedSource) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/logs/stats?source=${selectedSource}`);
      if (!response.ok) throw new Error('Failed to fetch log stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch log stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      fetchStats();
    }
  }, [selectedSource]);

  const handleClearLogs = async () => {
    setConfirmOpen(false);
    setClearing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/logs/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: selectedSource }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear logs');
      }

      const data = await response.json();
      setSuccess(data.message || 'Logs cleared successfully');

      // Refresh stats
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Log Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View log statistics and clear log files
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

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Log Source</InputLabel>
            <Select
              value={selectedSource}
              label="Log Source"
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={sources.length === 0}
            >
              {sources.map((source) => (
                <MenuItem key={source.name} value={source.name}>
                  {source.name} ({source.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : stats ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Total Logs:</strong> {stats.totalLogs.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>File Size:</strong> {stats.fileSizeFormatted}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>By Level:</strong>
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Debug: {stats.byLevel.debug.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Info: {stats.byLevel.info.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Warn: {stats.byLevel.warn.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="error">
                Error: {stats.byLevel.error.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            disabled={!selectedSource || loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={clearing ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={!selectedSource || clearing || loading}
          >
            Clear Logs
          </Button>
        </Box>

        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Clear Log File</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear the "{selectedSource}" log file? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleClearLogs} color="error" variant="contained">
              Clear
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
