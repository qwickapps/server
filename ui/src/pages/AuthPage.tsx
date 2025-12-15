import { useState, useEffect } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { api, AuthConfigStatus } from '../api/controlPanelApi';

/**
 * Get the status color for the auth state
 */
function getStateColor(state: string): string {
  switch (state) {
    case 'enabled':
      return 'var(--theme-success)';
    case 'error':
      return 'var(--theme-error)';
    case 'disabled':
    default:
      return 'var(--theme-text-secondary)';
  }
}

/**
 * Get the status icon for the auth state
 */
function getStateIcon(state: string) {
  switch (state) {
    case 'enabled':
      return <CheckCircleIcon sx={{ color: 'var(--theme-success)' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'var(--theme-error)' }} />;
    case 'disabled':
    default:
      return <BlockIcon sx={{ color: 'var(--theme-text-secondary)' }} />;
  }
}

export function AuthPage() {
  const [status, setStatus] = useState<AuthConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAuthConfig();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch auth status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }}>
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  const configEntries = status?.config ? Object.entries(status.config) : [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
          Authentication
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchStatus} sx={{ color: 'var(--theme-text-secondary)' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Auth plugin configuration status
      </Typography>

      {/* Status Card */}
      <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            {getStateIcon(status?.state || 'disabled')}
            <Box>
              <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                Status:{' '}
                <Chip
                  label={status?.state?.toUpperCase() || 'UNKNOWN'}
                  size="small"
                  sx={{
                    bgcolor: `${getStateColor(status?.state || 'disabled')}20`,
                    color: getStateColor(status?.state || 'disabled'),
                    fontWeight: 600,
                  }}
                />
              </Typography>
              {status?.adapter && (
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mt: 0.5 }}>
                  Adapter: <strong>{status.adapter}</strong>
                </Typography>
              )}
            </Box>
          </Box>

          {/* Error Message */}
          {status?.state === 'error' && status.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {status.error}
            </Alert>
          )}

          {/* Missing Variables */}
          {status?.missingVars && status.missingVars.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Missing environment variables:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {status.missingVars.map((v) => (
                  <li key={v}>
                    <code>{v}</code>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          {/* Disabled State Info */}
          {status?.state === 'disabled' && (
            <Alert severity="info">
              <Typography variant="body2">
                Authentication is disabled. Set the <code>AUTH_ADAPTER</code> environment variable to enable.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Valid options: <code>supertokens</code>, <code>auth0</code>, <code>supabase</code>, <code>basic</code>
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Table */}
      {configEntries.length > 0 && (
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent sx={{ pb: 0 }}>
            <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
              Current Configuration
            </Typography>
          </CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Variable
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Value
                  </TableCell>
                  <TableCell
                    sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 60 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configEntries.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Typography sx={{ color: 'var(--theme-text-primary)', fontFamily: 'monospace', fontSize: 13 }}>
                        {key}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Typography
                        sx={{
                          color: value.includes('*') ? 'var(--theme-text-secondary)' : 'var(--theme-text-primary)',
                          fontFamily: 'monospace',
                          fontSize: 13,
                        }}
                      >
                        {value}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Tooltip title={copied === key ? 'Copied!' : 'Copy value'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(key, value)}
                          sx={{ color: copied === key ? 'var(--theme-success)' : 'var(--theme-text-secondary)' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* No Configuration */}
      {status?.state === 'enabled' && configEntries.length === 0 && (
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Typography sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
              No configuration details available
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
