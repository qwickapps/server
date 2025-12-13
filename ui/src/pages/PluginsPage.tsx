import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Alert,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExtensionIcon from '@mui/icons-material/Extension';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import { api, PluginInfo, PluginContributions } from '../api/controlPanelApi';

function getStatusIcon(status: PluginInfo['status']) {
  switch (status) {
    case 'active':
      return <CheckCircleIcon sx={{ color: 'var(--theme-success)', fontSize: 20 }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'var(--theme-error)', fontSize: 20 }} />;
    case 'starting':
      return <HourglassEmptyIcon sx={{ color: 'var(--theme-warning)', fontSize: 20 }} />;
    case 'stopped':
      return <StopCircleIcon sx={{ color: 'var(--theme-text-secondary)', fontSize: 20 }} />;
    default:
      return null;
  }
}

function getStatusColor(status: PluginInfo['status']): string {
  switch (status) {
    case 'active':
      return 'var(--theme-success)';
    case 'error':
      return 'var(--theme-error)';
    case 'starting':
      return 'var(--theme-warning)';
    case 'stopped':
      return 'var(--theme-text-secondary)';
    default:
      return 'var(--theme-text-secondary)';
  }
}

function ContributionsSummary({ counts }: { counts: PluginInfo['contributionCounts'] }) {
  const parts: string[] = [];
  if (counts.routes > 0) parts.push(`${counts.routes} route${counts.routes > 1 ? 's' : ''}`);
  if (counts.menuItems > 0) parts.push(`${counts.menuItems} menu item${counts.menuItems > 1 ? 's' : ''}`);
  if (counts.pages > 0) parts.push(`${counts.pages} page${counts.pages > 1 ? 's' : ''}`);
  if (counts.widgets > 0) parts.push(`${counts.widgets} widget${counts.widgets > 1 ? 's' : ''}`);

  if (parts.length === 0) {
    return <Typography sx={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem' }}>No contributions</Typography>;
  }

  return (
    <Typography sx={{ color: 'var(--theme-text-secondary)', fontSize: '0.875rem' }}>
      {parts.join(', ')}
    </Typography>
  );
}

interface PluginRowProps {
  plugin: PluginInfo;
}

function PluginRow({ plugin }: PluginRowProps) {
  const [open, setOpen] = useState(false);
  const [contributions, setContributions] = useState<PluginContributions | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const handleToggle = async () => {
    if (!open && !contributions && !detailError) {
      setLoading(true);
      setDetailError(null);
      try {
        const detail = await api.getPluginDetail(plugin.id);
        setContributions(detail.contributions);
      } catch (err) {
        console.error('Failed to load plugin details:', err);
        setDetailError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    }
    setOpen(!open);
  };

  const hasContributions =
    plugin.contributionCounts.routes > 0 ||
    plugin.contributionCounts.menuItems > 0 ||
    plugin.contributionCounts.pages > 0 ||
    plugin.contributionCounts.widgets > 0;

  return (
    <>
      <TableRow
        sx={{
          '& > *': { borderBottom: open ? 'none' : undefined },
          cursor: hasContributions ? 'pointer' : 'default',
          '&:hover': { bgcolor: hasContributions ? 'var(--theme-background)' : undefined },
        }}
        onClick={hasContributions ? handleToggle : undefined}
      >
        <TableCell sx={{ width: 50, borderColor: 'var(--theme-border)' }}>
          {hasContributions && (
            <IconButton size="small" sx={{ color: 'var(--theme-text-secondary)' }}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(plugin.status)}
            <Typography sx={{ color: 'var(--theme-text-primary)', fontWeight: 500 }}>
              {plugin.name}
            </Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
          <Typography sx={{ color: 'var(--theme-text-secondary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {plugin.id}
          </Typography>
        </TableCell>
        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
          {plugin.version ? (
            <Chip
              label={`v${plugin.version}`}
              size="small"
              sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
            />
          ) : (
            <Typography sx={{ color: 'var(--theme-text-secondary)' }}>-</Typography>
          )}
        </TableCell>
        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
          <Chip
            label={plugin.status}
            size="small"
            sx={{
              bgcolor: getStatusColor(plugin.status) + '20',
              color: getStatusColor(plugin.status),
              textTransform: 'capitalize',
            }}
          />
        </TableCell>
        <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
          <ContributionsSummary counts={plugin.contributionCounts} />
        </TableCell>
      </TableRow>

      {/* Expanded details row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} sx={{ borderColor: 'var(--theme-border)' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 4 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : detailError ? (
                <Alert severity="error" sx={{ mb: 1 }}>
                  {detailError}
                </Alert>
              ) : contributions ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Error message if plugin failed */}
                  {plugin.status === 'error' && plugin.error && (
                    <Alert severity="error" sx={{ mb: 1 }}>
                      {plugin.error}
                    </Alert>
                  )}

                  {/* Routes */}
                  {contributions.routes.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
                        Routes ({contributions.routes.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {contributions.routes.map((route, i) => (
                          <Chip
                            key={i}
                            label={`${route.method.toUpperCase()} ${route.path}`}
                            size="small"
                            sx={{
                              bgcolor: 'var(--theme-background)',
                              color: 'var(--theme-text-primary)',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Menu Items */}
                  {contributions.menuItems.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
                        Menu Items ({contributions.menuItems.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {contributions.menuItems.map((item) => (
                          <Chip
                            key={item.id}
                            label={`${item.label} (${item.route})`}
                            size="small"
                            sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Pages */}
                  {contributions.pages.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
                        Pages ({contributions.pages.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {contributions.pages.map((page) => (
                          <Chip
                            key={page.id}
                            label={`${page.title || page.id} (${page.route})`}
                            size="small"
                            sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Widgets */}
                  {contributions.widgets.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'var(--theme-text-primary)', mb: 1 }}>
                        Widgets ({contributions.widgets.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {contributions.widgets.map((widget) => (
                          <Chip
                            key={widget.id}
                            label={widget.title}
                            size="small"
                            sx={{ bgcolor: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : null}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const data = await api.getPlugins();
        setPlugins(data.plugins);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch plugins');
      } finally {
        setLoading(false);
      }
    };

    fetchPlugins();
  }, []);

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

  // Count plugins by status
  const activeCount = plugins.filter((p) => p.status === 'active').length;
  const errorCount = plugins.filter((p) => p.status === 'error').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
            Plugins
          </Typography>
          <Chip
            icon={<ExtensionIcon sx={{ fontSize: 16 }} />}
            label={`${activeCount}/${plugins.length} active`}
            size="small"
            sx={{
              bgcolor: activeCount === plugins.length ? 'var(--theme-success)20' : 'var(--theme-warning)20',
              color: activeCount === plugins.length ? 'var(--theme-success)' : 'var(--theme-warning)',
            }}
          />
          {errorCount > 0 && (
            <Chip
              icon={<ErrorIcon sx={{ fontSize: 16 }} />}
              label={`${errorCount} error${errorCount > 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: 'var(--theme-error)20', color: 'var(--theme-error)' }}
            />
          )}
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        View registered plugins and their contributions to the control panel
      </Typography>

      {plugins.length === 0 ? (
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Typography sx={{ color: 'var(--theme-text-secondary)', textAlign: 'center', py: 4 }}>
              No plugins registered
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', width: 50 }} />
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Version
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                    Contributions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plugins.map((plugin) => (
                  <PluginRow key={plugin.id} plugin={plugin} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
