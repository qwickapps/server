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
  Chip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  Tooltip,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import BugReportIcon from '@mui/icons-material/BugReport';
import { api, LogEntry, LogSource } from '../api/controlPanelApi';

function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'error':
      return 'var(--theme-error)';
    case 'warn':
    case 'warning':
      return 'var(--theme-warning)';
    case 'info':
      return 'var(--theme-info)';
    case 'debug':
      return 'var(--theme-text-secondary)';
    default:
      return 'var(--theme-text-primary)';
  }
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sources, setSources] = useState<LogSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  // New features
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = newest first
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Stats - computed from current logs (could be fetched from API if available)
  const stats = {
    total: total,
    errors: logs.filter(l => l.level.toLowerCase() === 'error').length,
    warnings: logs.filter(l => ['warn', 'warning'].includes(l.level.toLowerCase())).length,
    info: logs.filter(l => l.level.toLowerCase() === 'info').length,
    debug: logs.filter(l => l.level.toLowerCase() === 'debug').length,
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getLogs({
        source: selectedSource || undefined,
        level: selectedLevel || undefined,
        search: searchQuery || undefined,
        limit,
        page,
      });
      // Sort logs based on sortOrder
      const sortedLogs = [...data.logs].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      setLogs(sortedLogs);
      setTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  }, [selectedSource, selectedLevel, searchQuery, page, sortOrder]);

  const fetchSources = async () => {
    try {
      const data = await api.getLogSources();
      setSources(data);
    } catch {
      // Sources endpoint might not be available
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(fetchLogs, 5000);
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [autoRefresh, fetchLogs]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleSortOrderChange = (_event: React.MouseEvent<HTMLElement>, newOrder: 'desc' | 'asc' | null) => {
    if (newOrder !== null) {
      setSortOrder(newOrder);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'var(--theme-text-primary)' }}>
        Logs
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        View and search application logs
      </Typography>

      {/* Stats Widgets */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ color: 'var(--theme-text-primary)', fontWeight: 600 }}>
                  {stats.total.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                Total Logs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorIcon sx={{ color: 'var(--theme-error)', fontSize: 20 }} />
                <Typography variant="h5" sx={{ color: 'var(--theme-error)', fontWeight: 600 }}>
                  {stats.errors}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                Errors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon sx={{ color: 'var(--theme-warning)', fontSize: 20 }} />
                <Typography variant="h5" sx={{ color: 'var(--theme-warning)', fontWeight: 600 }}>
                  {stats.warnings}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                Warnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InfoIcon sx={{ color: 'var(--theme-info)', fontSize: 20 }} />
                <Typography variant="h5" sx={{ color: 'var(--theme-info)', fontWeight: 600 }}>
                  {stats.info}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                Info
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3, md: 2.4 }}>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon sx={{ color: 'var(--theme-text-secondary)', fontSize: 20 }} />
                <Typography variant="h5" sx={{ color: 'var(--theme-text-primary)', fontWeight: 600 }}>
                  {stats.debug}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                Debug
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3, bgcolor: 'var(--theme-surface)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {sources.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'var(--theme-text-secondary)' }}>Source</InputLabel>
                <Select
                  value={selectedSource}
                  label="Source"
                  onChange={(e) => setSelectedSource(e.target.value)}
                  sx={{ color: 'var(--theme-text-primary)' }}
                >
                  <MenuItem value="">All Sources</MenuItem>
                  {sources.map((source) => (
                    <MenuItem key={source.name} value={source.name}>
                      {source.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'var(--theme-text-secondary)' }}>Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Level"
                onChange={(e) => setSelectedLevel(e.target.value)}
                sx={{ color: 'var(--theme-text-primary)' }}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: 1,
                minWidth: 200,
                '& .MuiInputBase-input': { color: 'var(--theme-text-primary)' },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'var(--theme-text-secondary)' }} />,
              }}
            />

            {/* Sort Order Toggle */}
            <ToggleButtonGroup
              value={sortOrder}
              exclusive
              onChange={handleSortOrderChange}
              size="small"
              aria-label="sort order"
            >
              <ToggleButton value="desc" aria-label="newest first">
                <Tooltip title="Newest First">
                  <ArrowDownwardIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="asc" aria-label="oldest first">
                <Tooltip title="Oldest First">
                  <ArrowUpwardIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Auto Refresh Toggle */}
            <Tooltip title={autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh (5s)'}>
              <IconButton
                onClick={() => setAutoRefresh(!autoRefresh)}
                sx={{
                  color: autoRefresh ? 'var(--theme-success)' : 'var(--theme-text-secondary)',
                  bgcolor: autoRefresh ? 'var(--theme-success)20' : 'transparent',
                }}
              >
                {autoRefresh ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh">
              <IconButton onClick={fetchLogs} sx={{ color: 'var(--theme-primary)' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card sx={{ mb: 3, bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <CardContent>
            <Typography sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center' }}>
              No logs found
            </Typography>
          </CardContent>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 180 }}>
                      Timestamp
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 100 }}>
                      Level
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 120 }}>
                      Component
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      Message
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                        <Chip
                          label={log.level.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getLevelColor(log.level) + '20',
                            color: getLevelColor(log.level),
                            fontSize: '0.65rem',
                            height: 20,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontSize: '0.75rem' }}>
                        {log.namespace || '-'}
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                        {log.message}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: 'var(--theme-text-primary)',
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Card>
    </Box>
  );
}
