/**
 * Migration Management Widget
 *
 * Allows executing Payload CMS database migrations from the control panel.
 * Part of the maintenance plugin.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HistoryIcon from '@mui/icons-material/History';

interface MigrationExecution {
  id: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  exit_code?: number;
  output?: string;
  error?: string;
  duration_ms?: number;
}

export function MigrationManagementWidget() {
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [output, setOutput] = useState<string>('');
  const [history, setHistory] = useState<MigrationExecution[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExecution, setSelectedExecution] = useState<MigrationExecution | null>(null);
  const [historyLimit] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const basePath = (window as any).__API_BASE_PATH__ || '';
      const response = await fetch(`${basePath}/maintenance/migrations/history?limit=${historyLimit}`);
      if (!response.ok) throw new Error('Failed to fetch migration history');
      const data = await response.json();
      setHistory(data.executions || []);
    } catch (err) {
      console.error('Failed to fetch migration history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setOutput('Starting migrations...\n');
    setError(null);

    try {
      const basePath = (window as any).__API_BASE_PATH__ || '';
      const eventSource = new EventSource(`${basePath}/maintenance/migrations/execute`, {
        withCredentials: true,
      });

      eventSource.addEventListener('message', (e) => {
        try {
          const data = JSON.parse(e.data);

          if (data.type === 'output') {
            setOutput(prev => prev + data.data);
          } else if (data.type === 'error') {
            setOutput(prev => prev + '[ERROR] ' + data.data);
          } else if (data.type === 'complete') {
            setOutput(prev => prev + `\n\n✓ Migrations completed in ${data.duration}ms (exit code: ${data.exitCode})`);
            setExecuting(false);
            eventSource.close();
            fetchHistory(); // Refresh history
          }
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('SSE error:', err);
        setError('Connection lost or migration failed. Check console for details.');
        setExecuting(false);
        eventSource.close();
      };

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration execution failed');
      setExecuting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="Success" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" icon={<ErrorIcon />} />;
      case 'running':
        return <Chip label="Running" color="primary" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleViewDetails = (execution: MigrationExecution) => {
    setSelectedExecution(execution);
    setDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Database Migrations
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Execute Payload CMS database schema migrations
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 2, mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExecute}
              disabled={executing}
              startIcon={executing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
              fullWidth
            >
              {executing ? 'Running Migrations...' : 'Run Migrations'}
            </Button>
          </Box>

          {output && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: '400px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {output}
            </Paper>
          )}

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Executions
          </Typography>

          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : history.length === 0 ? (
            <Alert severity="info">No migration executions yet</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Exit Code</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>{getStatusChip(execution.status)}</TableCell>
                      <TableCell>{formatDate(execution.started_at)}</TableCell>
                      <TableCell>{formatDuration(execution.duration_ms)}</TableCell>
                      <TableCell>{execution.exit_code ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => handleViewDetails(execution)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Execution Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Migration Execution Details
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Status:</Typography>
                {getStatusChip(selectedExecution.status)}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Started:</Typography>
                <Typography variant="body2">{formatDate(selectedExecution.started_at)}</Typography>
              </Box>
              {selectedExecution.completed_at && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Completed:</Typography>
                  <Typography variant="body2">{formatDate(selectedExecution.completed_at)}</Typography>
                </Box>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Duration:</Typography>
                <Typography variant="body2">{formatDuration(selectedExecution.duration_ms)}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">Exit Code:</Typography>
                <Typography variant="body2">{selectedExecution.exit_code ?? 'N/A'}</Typography>
              </Box>
              {selectedExecution.output && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Output:</Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: '#1e1e1e',
                      color: '#d4d4d4',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      maxHeight: '300px',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {selectedExecution.output}
                  </Paper>
                </Box>
              )}
              {selectedExecution.error && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Error:</Typography>
                  <Alert severity="error">
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {selectedExecution.error}
                    </pre>
                  </Alert>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
