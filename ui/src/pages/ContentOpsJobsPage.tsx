/**
 * ContentOps Jobs Page
 *
 * Real-time job monitoring dashboard for ContentOps publishing jobs.
 * Features SSE for live updates, job actions (retry, cancel, delete), and filtering.
 */

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Replay as RetryIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import { useJobStream, type Job } from '../hooks/useJobStream';
import { api } from '../api/controlPanelApi';

type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Status color mapping
const statusColors: Record<JobStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
  pending: 'default',
  running: 'primary',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
};

// Status icon colors
const statusIconColors: Record<JobStatus, string> = {
  pending: '#9e9e9e',
  running: '#2196f3',
  completed: '#4caf50',
  failed: '#f44336',
  cancelled: '#ff9800',
};

export function ContentOpsJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { jobs, connected, error: streamError, reconnecting, refresh } = useJobStream({
    onError: (error) => {
      console.error('[ContentOpsJobsPage] SSE error:', error);
    },
  });

  // Filter jobs by status
  const filteredJobs = statusFilter === 'all'
    ? jobs
    : jobs.filter((job) => job.status === statusFilter);

  // Job action handlers
  const handleRetry = useCallback(async (jobId: string) => {
    try {
      setActionLoading(jobId);
      setActionError(null);

      const response = await fetch(`${api.getBaseUrl()}/api/contentops/jobs/${jobId}/retry`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to retry job: ${response.statusText}`);
      }

      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retry job';
      setActionError(message);
    } finally {
      setActionLoading(null);
    }
  }, [refresh]);

  const handleCancel = useCallback(async (jobId: string) => {
    try {
      setActionLoading(jobId);
      setActionError(null);

      const response = await fetch(`${api.getBaseUrl()}/api/contentops/jobs/${jobId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel job: ${response.statusText}`);
      }

      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel job';
      setActionError(message);
    } finally {
      setActionLoading(null);
    }
  }, [refresh]);

  const handleDelete = useCallback(async (jobId: string) => {
    try {
      setActionLoading(jobId);
      setActionError(null);

      const response = await fetch(`${api.getBaseUrl()}/api/contentops/jobs/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete job: ${response.statusText}`);
      }

      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      setActionError(message);
    } finally {
      setActionLoading(null);
    }
  }, [refresh]);

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip
          icon={<CircleIcon sx={{ fontSize: 12, color: statusIconColors[params.value as JobStatus] }} />}
          label={params.value}
          color={statusColors[params.value as JobStatus]}
          size="small"
        />
      ),
    },
    {
      field: 'jobType',
      headerName: 'Type',
      width: 150,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 180,
      valueFormatter: (params) => new Date(params as string).toLocaleString(),
    },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 180,
      valueFormatter: (params) => new Date(params as string).toLocaleString(),
    },
    {
      field: 'error',
      headerName: 'Error',
      flex: 1,
      renderCell: (params) => (
        params.value ? (
          <Tooltip title={params.value as string}>
            <Typography
              variant="caption"
              sx={{
                color: 'error.main',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {params.value as string}
            </Typography>
          </Tooltip>
        ) : null
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        const job = params.row as Job;
        const loading = actionLoading === job.id;

        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {job.status === 'failed' && (
              <Tooltip title="Retry">
                <IconButton
                  size="small"
                  onClick={() => handleRetry(job.id)}
                  disabled={loading}
                >
                  <RetryIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {(job.status === 'pending' || job.status === 'running') && (
              <Tooltip title="Cancel">
                <IconButton
                  size="small"
                  onClick={() => handleCancel(job.id)}
                  disabled={loading}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => handleDelete(job.id)}
                disabled={loading}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, color: 'var(--theme-text-primary)' }}>
            ContentOps Jobs
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
            Real-time job monitoring dashboard
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Connection status */}
          <Chip
            icon={<CircleIcon sx={{ fontSize: 12 }} />}
            label={reconnecting ? 'Reconnecting...' : connected ? 'Live' : 'Disconnected'}
            color={reconnecting ? 'warning' : connected ? 'success' : 'error'}
            size="small"
          />

          {/* Refresh button */}
          <Tooltip title="Refresh">
            <IconButton onClick={refresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error alerts */}
      {(streamError || actionError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {streamError || actionError}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 2, bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Jobs table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <DataGrid
          rows={filteredJobs}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          onRowClick={(params: GridRowParams) => setSelectedJob(params.row as Job)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              cursor: 'pointer',
            },
          }}
        />
      </Card>

      {/* Job details modal */}
      <Dialog
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              Job Details
              <Chip
                label={selectedJob.status}
                color={statusColors[selectedJob.status]}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Typography variant="body2">{selectedJob.id}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{selectedJob.jobType}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Created</Typography>
                  <Typography variant="body2">
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">Updated</Typography>
                  <Typography variant="body2">
                    {new Date(selectedJob.updatedAt).toLocaleString()}
                  </Typography>
                </Box>

                {selectedJob.error && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Error</Typography>
                    <Typography variant="body2" color="error">
                      {selectedJob.error}
                    </Typography>
                  </Box>
                )}

                {selectedJob.requestId && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Request ID</Typography>
                    <Typography variant="body2">{selectedJob.requestId}</Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="caption" color="text.secondary">Metadata</Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                      p: 1,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(selectedJob.metadata, null, 2)}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
