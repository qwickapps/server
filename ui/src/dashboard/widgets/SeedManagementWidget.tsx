/**
 * Seed Management Widget
 *
 * Displays available seed scripts grouped by folder and allows executing them.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  CircularProgress,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

interface SeedScript {
  type: 'file' | 'task';
  name: string;
  path?: string;
  id?: string;
  description?: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
}

interface SeedFolder {
  name: string;
  seeds: SeedScript[];
}

interface ExecutionResult {
  seedName: string;
  success: boolean;
  output?: string;
  error?: string;
}

export function SeedManagementWidget() {
  const [seeds, setSeeds] = useState<SeedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Execution dialog state
  const [executionDialogOpen, setExecutionDialogOpen] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [currentlyExecuting, setCurrentlyExecuting] = useState<string | null>(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Database reset state
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    try {
      const basePath = (window as any).__API_BASE_PATH__ || '';
      const response = await fetch(`${basePath}/api/maintenance/seeds/discover`);
      if (!response.ok) throw new Error('Failed to fetch seeds');
      const data = await response.json();
      setSeeds(data.seeds || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seeds');
    } finally {
      setLoading(false);
    }
  };

  const getSeedKey = (seed: SeedScript): string => {
    return seed.type === 'file' ? seed.path! : seed.id!;
  };

  const getFriendlyName = (seed: SeedScript): string => {
    if (seed.type === 'task') return seed.name;

    // Extract filename without folder and extension
    // "01-Database/001.initialize-schema.mjs" -> "Initialize Schema"
    const filename = seed.name.replace('.mjs', '');
    const withoutNumber = filename.replace(/^\d+\./, ''); // Remove number prefix

    // Convert kebab-case/snake-case to Title Case
    return withoutNumber
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const groupByFolder = (): SeedFolder[] => {
    const folderMap = new Map<string, SeedScript[]>();

    seeds.forEach(seed => {
      let folderName = 'Ungrouped';

      if (seed.type === 'file' && seed.path) {
        const parts = seed.path.split('/');
        if (parts.length > 1) {
          folderName = parts[0];
        }
      }

      if (!folderMap.has(folderName)) {
        folderMap.set(folderName, []);
      }
      folderMap.get(folderName)!.push(seed);
    });

    return Array.from(folderMap.entries())
      .map(([name, seeds]) => ({ name, seeds }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  };

  const handleToggleSeed = (seedKey: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(seedKey)) {
      newSelected.delete(seedKey);
    } else {
      newSelected.add(seedKey);
    }
    setSelected(newSelected);
  };

  const handleToggleFolder = (folder: SeedFolder) => {
    const folderKeys = folder.seeds.map(getSeedKey);
    const allSelected = folderKeys.every(key => selected.has(key));

    const newSelected = new Set(selected);
    if (allSelected) {
      folderKeys.forEach(key => newSelected.delete(key));
    } else {
      folderKeys.forEach(key => newSelected.add(key));
    }
    setSelected(newSelected);
  };

  // Execute a single seed and handle SSE stream
  const executeSeed = async (seedKey: string, friendlyName: string, seedType: string): Promise<ExecutionResult> => {
    const basePath = (window as any).__API_BASE_PATH__ || '';
    const response = await fetch(`${basePath}/api/maintenance/seeds/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: seedKey, type: seedType }),
    });

    if (!response.ok && !response.headers.get('content-type')?.includes('text/event-stream')) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to start execution' }));
      throw new Error(errorData.error || 'Failed to start execution');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let output = '';
    let error = '';
    let exitCode = 1;

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));

                if (eventData.type === 'stdout') {
                  output += eventData.data;
                } else if (eventData.type === 'stderr') {
                  error += eventData.data;
                } else if (eventData.type === 'exit') {
                  const exitData = JSON.parse(eventData.data);
                  exitCode = exitData.exitCode;
                }
              } catch (e) {
                // Ignore malformed SSE events
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    return {
      seedName: friendlyName,
      success: exitCode === 0,
      output: output || undefined,
      error: error || (exitCode !== 0 ? 'Execution failed' : undefined),
    };
  };

  const handleDatabaseReset = async () => {
    setResetting(true);
    setResetDialogOpen(false);

    try {
      const basePath = (window as any).__API_BASE_PATH__ || '';
      const response = await fetch(`${basePath}/api/maintenance/database/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset database');
      }

      setSnackbarMessage('Database reset successfully. All tables and data have been deleted.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Refresh seeds list after reset
      await fetchSeeds();
    } catch (err) {
      setSnackbarMessage(err instanceof Error ? err.message : 'Database reset failed');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setResetting(false);
    }
  };

  const executeSelected = async () => {
    if (selected.size === 0) return;

    setExecuting(true);
    setExecutionDialogOpen(true);
    setExecutionResults([]);

    const selectedSeeds = seeds.filter(seed => selected.has(getSeedKey(seed)));
    const results: ExecutionResult[] = [];

    for (const seed of selectedSeeds) {
      const seedKey = getSeedKey(seed);
      const friendlyName = getFriendlyName(seed);
      setCurrentlyExecuting(friendlyName);

      try {
        const result = await executeSeed(seedKey, friendlyName, seed.type);
        results.push(result);
      } catch (err) {
        results.push({
          seedName: friendlyName,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }

      setExecutionResults([...results]);
    }

    setCurrentlyExecuting(null);
    setExecuting(false);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    if (failCount === 0) {
      setSnackbarMessage(`Successfully executed ${successCount} seed${successCount > 1 ? 's' : ''}`);
      setSnackbarSeverity('success');
      setSelected(new Set());
      await fetchSeeds();
    } else {
      setSnackbarMessage(`Completed with ${failCount} error${failCount > 1 ? 's' : ''}`);
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const folders = groupByFolder();

  return (
    <>
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h6">
              Seed Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and execute seed scripts
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selected.size > 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={executing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                onClick={executeSelected}
                disabled={executing || resetting}
              >
                Run Selected ({selected.size})
              </Button>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={() => setResetDialogOpen(true)}
              disabled={executing || resetting}
            >
              Reset Database
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {seeds.length === 0 ? (
          <Alert severity="info">No seed scripts found</Alert>
        ) : (
          <Box>
            {folders.map((folder) => {
              const folderKeys = folder.seeds.map(getSeedKey);
              const allSelected = folderKeys.every(key => selected.has(key));
              const someSelected = folderKeys.some(key => selected.has(key));

              return (
                <Accordion key={folder.name} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFolder(folder);
                        }}
                      />
                      <FolderIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                        {folder.name}
                      </Typography>
                      <Chip label={`${folder.seeds.length} seed${folder.seeds.length > 1 ? 's' : ''}`} size="small" />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {folder.seeds.map((seed) => {
                        const seedKey = getSeedKey(seed);
                        const isSelected = selected.has(seedKey);

                        return (
                          <ListItem
                            key={seedKey}
                            disablePadding
                            secondaryAction={
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PlayArrowIcon />}
                                onClick={async () => {
                                  const friendlyName = getFriendlyName(seed);
                                  setExecuting(true);
                                  setExecutionDialogOpen(true);
                                  setExecutionResults([]);
                                  setCurrentlyExecuting(friendlyName);

                                  try {
                                    const result = await executeSeed(seedKey, friendlyName, seed.type);
                                    setExecutionResults([result]);

                                    if (result.success) {
                                      setSnackbarMessage(`${friendlyName} executed successfully`);
                                      setSnackbarSeverity('success');
                                      await fetchSeeds();
                                    } else {
                                      setSnackbarMessage(`${friendlyName} execution failed`);
                                      setSnackbarSeverity('error');
                                    }
                                  } catch (err) {
                                    setExecutionResults([{
                                      seedName: friendlyName,
                                      success: false,
                                      error: err instanceof Error ? err.message : 'Unknown error',
                                    }]);
                                    setSnackbarMessage(`${friendlyName} execution failed`);
                                    setSnackbarSeverity('error');
                                  } finally {
                                    setCurrentlyExecuting(null);
                                    setExecuting(false);
                                    setSnackbarOpen(true);
                                  }
                                }}
                                disabled={executing}
                              >
                                Run
                              </Button>
                            }
                          >
                            <ListItemButton onClick={() => handleToggleSeed(seedKey)}>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={isSelected}
                                  tabIndex={-1}
                                  disableRipple
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={getFriendlyName(seed)}
                                secondary={seed.description || seed.name}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>

    {/* Execution Dialog */}
    <Dialog
      open={executionDialogOpen}
      onClose={() => !executing && setExecutionDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Seed Execution
        {!executing && (
          <Button
            onClick={() => setExecutionDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon />
          </Button>
        )}
      </DialogTitle>
      <DialogContent>
        {executing && currentlyExecuting && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Currently executing: {currentlyExecuting}
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {executionResults.length > 0 && (
          <Box>
            {executionResults.map((result, index) => (
              <Paper
                key={index}
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: result.success ? 'success.dark' : 'error.dark',
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {result.success ? (
                    <CheckCircleIcon color="inherit" />
                  ) : (
                    <ErrorIcon color="inherit" />
                  )}
                  <Typography variant="subtitle2" fontWeight="bold">
                    {result.seedName}
                  </Typography>
                </Box>
                {result.output && (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {result.output}
                  </Typography>
                )}
                {result.error && (
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {result.error}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setExecutionDialogOpen(false)} disabled={executing}>
          Close
        </Button>
      </DialogActions>
    </Dialog>

    {/* Database Reset Confirmation Dialog */}
    <Dialog
      open={resetDialogOpen}
      onClose={() => !resetting && setResetDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ color: 'error.main' }}>
        Reset Database?
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone!
        </Alert>
        <Typography variant="body1" gutterBottom>
          This will permanently delete:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>All database tables</li>
          <li>All stored data</li>
          <li>All seed execution history</li>
          <li>All application content</li>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You will need to run the database initialization seeds again to recreate the schema.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setResetDialogOpen(false)} disabled={resetting}>
          Cancel
        </Button>
        <Button
          onClick={handleDatabaseReset}
          color="error"
          variant="contained"
          disabled={resetting}
          startIcon={resetting ? <CircularProgress size={16} /> : undefined}
        >
          {resetting ? 'Resetting...' : 'Reset Database'}
        </Button>
      </DialogActions>
    </Dialog>

    {/* Success/Error Snackbar */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={() => setSnackbarOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  </>
  );
}
