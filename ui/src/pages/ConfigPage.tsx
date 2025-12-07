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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import { api, ConfigResponse } from '../api/controlPanelApi';

export function ConfigPage() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await api.getConfig();
        setConfig(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch config');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setSnackbar({ open: true, message: 'Copied to clipboard' });
  };

  const toggleMasked = (key: string) => {
    setShowMasked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isMasked = (key: string): boolean => {
    if (!config?.masked || !Array.isArray(config.masked)) return false;
    return config.masked.some((mask) =>
      key.toUpperCase().includes(mask.toUpperCase())
    );
  };

  const formatValue = (key: string, value: unknown): string => {
    const strValue = String(value);
    if (isMasked(key) && !showMasked[key]) {
      return '••••••••';
    }
    return strValue;
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

  const configEntries = config ? Object.entries(config.config) : [];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'var(--theme-text-primary)' }}>
        Configuration
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Current environment configuration (read-only)
      </Typography>

      {/* Config Table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Variable
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                  Value
                </TableCell>
                <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 100 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configEntries.map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ color: 'var(--theme-text-primary)', fontFamily: 'monospace' }}>
                        {key}
                      </Typography>
                      {isMasked(key) && (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 14 }} />}
                          label="Sensitive"
                          size="small"
                          sx={{
                            bgcolor: 'var(--theme-warning)20',
                            color: 'var(--theme-warning)',
                            height: 20,
                            '& .MuiChip-icon': { color: 'var(--theme-warning)' },
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace' }}>
                    {formatValue(key, value)}
                  </TableCell>
                  <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {isMasked(key) && (
                        <Tooltip title={showMasked[key] ? 'Hide value' : 'Show value'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleMasked(key)}
                            sx={{ color: 'var(--theme-text-secondary)' }}
                          >
                            {showMasked[key] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Copy value">
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(String(value))}
                          sx={{ color: 'var(--theme-text-secondary)' }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {configEntries.length === 0 && (
          <CardContent>
            <Typography sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
              No configuration variables available
            </Typography>
          </CardContent>
        )}
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
