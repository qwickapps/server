/**
 * APIKeysPage Component
 *
 * API key management page for authentication and authorization.
 * Allows users to create, view, and manage API keys with scopes.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {
  Text,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  GridLayout,
} from '@qwickapps/react-framework';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  api,
  type ApiKey,
  type ApiKeyWithPlaintext,
  type CreateApiKeyRequest,
  type PluginScopesGroup,
  type KeyUsageResponse,
} from '../api/controlPanelApi';
import AssessmentIcon from '@mui/icons-material/Assessment';

export interface APIKeysPageProps {
  title?: string;
  subtitle?: string;
}

export function APIKeysPage({
  title = 'API Keys',
  subtitle = 'Manage API keys for programmatic access',
}: APIKeysPageProps) {
  // State
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Phase 2: Available scopes
  const [availableScopes, setAvailableScopes] = useState<PluginScopesGroup[]>([]);
  const [scopesLoading, setScopesLoading] = useState(false);

  // Phase 2: Usage modal
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageData, setUsageData] = useState<KeyUsageResponse | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  // Create key dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyRequest>({
    name: '',
    key_type: 'pat',
    scopes: [],
    expires_at: '',
  });

  // Created key display state
  const [createdKey, setCreatedKey] = useState<ApiKeyWithPlaintext | null>(null);
  const [showCreatedKey, setShowCreatedKey] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);

  // Edit key dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    scopes: [] as string[],
    is_active: true,
  });

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<{ id: string; name: string } | null>(null);

  // Fetch API keys
  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getApiKeys();
      setKeys(data.keys || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Phase 2: Fetch available scopes
  const fetchScopes = useCallback(async () => {
    setScopesLoading(true);
    try {
      const data = await api.getAvailableScopes();
      setAvailableScopes(data.scopes || []);
    } catch (err) {
      console.error('Failed to fetch scopes:', err);
      // Don't show error to user - scopes are optional
    } finally {
      setScopesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScopes();
  }, [fetchScopes]);

  // Phase 2: Fetch key usage
  const fetchUsage = async (keyId: string, _keyName: string) => {
    setUsageLoading(true);
    setUsageModalOpen(true);
    try {
      const data = await api.getKeyUsage(keyId, { limit: 100 });
      setUsageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
      setUsageModalOpen(false);
    } finally {
      setUsageLoading(false);
    }
  };

  // Create key handler
  const handleCreateKey = async () => {
    setCreating(true);
    try {
      const created = await api.createApiKey(newKey);
      setCreatedKey(created);
      setCreateDialogOpen(false);
      setNewKey({
        name: '',
        key_type: 'pat',
        scopes: [],
        expires_at: '',
      });
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  // Delete key handlers
  const openDeleteDialog = (keyId: string, keyName: string) => {
    setKeyToDelete({ id: keyId, name: keyName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!keyToDelete) return;

    try {
      await api.deleteApiKey(keyToDelete.id);
      setSuccess(`API key "${keyToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setKeyToDelete(null);
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setKeyToDelete(null);
  };

  // Edit key handlers
  const openEditDialog = (key: ApiKey) => {
    setEditingKey(key);
    setEditForm({
      name: key.name,
      scopes: [...key.scopes],
      is_active: key.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateKey = async () => {
    if (!editingKey) return;

    try {
      await api.updateApiKey(editingKey.id, editForm);
      setSuccess(`API key "${editingKey.name}" updated`);
      setEditDialogOpen(false);
      setEditingKey(null);
      fetchKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update API key');
    }
  };

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    });
  };

  // Close created key dialog
  const closeCreatedKeyDialog = () => {
    setCreatedKey(null);
    setShowCreatedKey(true);
    setCopiedKey(false);
  };

  // Toggle scope (Phase 2: Support any scope string)
  const toggleScope = (scope: string) => {
    setNewKey(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const toggleEditScope = (scope: string) => {
    setEditForm(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  // Format date
  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get scope color (Phase 2: Support plugin scopes)
  const getScopeColor = (scope: string) => {
    // Legacy scopes
    if (scope === 'read' || scope.includes(':read') || scope === 'system:read') {
      return 'var(--theme-info)';
    }
    if (scope === 'write' || scope.includes(':write') || scope === 'system:write') {
      return 'var(--theme-warning)';
    }
    if (scope === 'admin' || scope.includes(':admin') || scope === 'system:admin') {
      return 'var(--theme-error)';
    }
    // Other plugin scopes
    if (scope.includes(':execute')) {
      return 'var(--theme-success)';
    }
    return 'var(--theme-text-secondary)';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Text variant="h4" content={title} customColor="var(--theme-text-primary)" />
          <Text variant="body2" content={subtitle} customColor="var(--theme-text-secondary)" />
        </Box>
        <Button
          variant="primary"
          icon="add"
          label="Create API Key"
          onClick={() => setCreateDialogOpen(true)}
        />
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Stats Card */}
      <GridLayout columns={3} spacing="medium" sx={{ mb: 3 }} equalHeight>
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <KeyIcon sx={{ fontSize: 40, color: 'var(--theme-primary)' }} />
              <Box>
                <Text variant="h4" content={keys.length.toString()} customColor="var(--theme-text-primary)" />
                <Text variant="body2" content="Total Keys" customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'var(--theme-success)' }} />
              <Box>
                <Text variant="h4" content={keys.filter(k => k.is_active).length.toString()} customColor="var(--theme-text-primary)" />
                <Text variant="body2" content="Active Keys" customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CancelIcon sx={{ fontSize: 40, color: keys.filter(k => !k.is_active).length > 0 ? 'var(--theme-error)' : 'var(--theme-text-secondary)' }} />
              <Box>
                <Text variant="h4" content={keys.filter(k => !k.is_active).length.toString()} customColor="var(--theme-text-primary)" />
                <Text variant="body2" content="Inactive Keys" customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </GridLayout>

      {/* API Keys Table */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Name</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Prefix</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Type</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Scopes</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Status</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Last Used</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Expires</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} hover>
                    <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                      <Text variant="body1" content={key.name} fontWeight="500" />
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {key.key_prefix}...
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Chip
                        size="small"
                        label={key.key_type.toUpperCase()}
                        sx={{
                          bgcolor: key.key_type === 'm2m' ? 'var(--theme-info)20' : 'var(--theme-success)20',
                          color: key.key_type === 'm2m' ? 'var(--theme-info)' : 'var(--theme-success)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {key.scopes.map((scope) => (
                          <Chip
                            key={scope}
                            size="small"
                            label={scope}
                            sx={{
                              bgcolor: `${getScopeColor(scope)}20`,
                              color: getScopeColor(scope),
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      <Chip
                        size="small"
                        icon={key.is_active ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <CancelIcon sx={{ fontSize: 14 }} />}
                        label={key.is_active ? 'Active' : 'Inactive'}
                        sx={{
                          bgcolor: key.is_active ? 'var(--theme-success)20' : 'var(--theme-error)20',
                          color: key.is_active ? 'var(--theme-success)' : 'var(--theme-error)',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      {formatDate(key.last_used_at)}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                      {formatDate(key.expires_at)}
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="right">
                      <Tooltip title="View Usage">
                        <IconButton size="small" onClick={() => fetchUsage(key.id, key.name)}>
                          <AssessmentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditDialog(key)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => openDeleteDialog(key.id, key.name)}
                          sx={{ color: 'var(--theme-error)' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {keys.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'var(--theme-text-secondary)' }}>
                      No API keys found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Key Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Key Name"
              fullWidth
              value={newKey.name}
              onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
              placeholder="Enter a descriptive name"
              helperText="Choose a name that helps you identify this key"
            />

            <FormControl fullWidth>
              <InputLabel>Key Type</InputLabel>
              <Select
                value={newKey.key_type}
                label="Key Type"
                onChange={(e) => setNewKey({ ...newKey, key_type: e.target.value as 'm2m' | 'pat' })}
              >
                <MenuItem value="pat">PAT (Personal Access Token)</MenuItem>
                <MenuItem value="m2m">M2M (Machine-to-Machine)</MenuItem>
              </Select>
              <FormHelperText>
                PAT for personal use, M2M for service-to-service communication
              </FormHelperText>
            </FormControl>

            <FormControl component="fieldset">
              <Text variant="subtitle2" content="Scopes" customColor="var(--theme-text-primary)" />
              {scopesLoading ? (
                <LinearProgress sx={{ mt: 1 }} />
              ) : (
                <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableScopes.map((group) => (
                    <Box key={group.pluginId} sx={{ mb: 2 }}>
                      <Text
                        variant="caption"
                        content={group.pluginId.toUpperCase()}
                        customColor="var(--theme-text-secondary)"
                        fontWeight="600"
                      />
                      <FormGroup>
                        {group.scopes.map((scope) => (
                          <FormControlLabel
                            key={scope.name}
                            control={
                              <Checkbox
                                checked={newKey.scopes.includes(scope.name)}
                                onChange={() => toggleScope(scope.name)}
                                size="small"
                              />
                            }
                            label={`${scope.name} - ${scope.description}`}
                            sx={{ ml: 1 }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <TextField
              label="Expiration (Optional)"
              type="datetime-local"
              fullWidth
              value={newKey.expires_at}
              onChange={(e) => setNewKey({ ...newKey, expires_at: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for no expiration (90 days default)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" label="Cancel" onClick={() => setCreateDialogOpen(false)} />
          <Button
            variant="primary"
            label="Create Key"
            onClick={handleCreateKey}
            disabled={creating || !newKey.name || newKey.scopes.length === 0}
          />
        </DialogActions>
      </Dialog>

      {/* Created Key Display Dialog */}
      <Dialog open={!!createdKey} onClose={closeCreatedKeyDialog} maxWidth="md" fullWidth>
        <DialogTitle>API Key Created</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Text variant="body2" content="Save this key now. You won't be able to see it again!" fontWeight="500" />
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Text variant="subtitle2" content="Key Name" customColor="var(--theme-text-secondary)" />
              <Text variant="body1" content={createdKey?.name || ''} fontWeight="500" />
            </Box>

            <Box>
              <Text variant="subtitle2" content="API Key" customColor="var(--theme-text-secondary)" />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <TextField
                  fullWidth
                  value={createdKey?.key || ''}
                  type={showCreatedKey ? 'text' : 'password'}
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.9rem' },
                  }}
                />
                <Tooltip title={showCreatedKey ? 'Hide' : 'Show'}>
                  <IconButton onClick={() => setShowCreatedKey(!showCreatedKey)}>
                    {showCreatedKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={copiedKey ? 'Copied!' : 'Copy'}>
                  <IconButton onClick={() => copyToClipboard(createdKey?.key || '')}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box>
              <Text variant="subtitle2" content="Scopes" customColor="var(--theme-text-secondary)" />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                {createdKey?.scopes.map((scope) => (
                  <Chip
                    key={scope}
                    size="small"
                    label={scope}
                    sx={{
                      bgcolor: `${getScopeColor(scope)}20`,
                      color: getScopeColor(scope),
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="primary" label="I've Saved the Key" onClick={closeCreatedKeyDialog} />
        </DialogActions>
      </Dialog>

      {/* Edit Key Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit API Key</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Key Name"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <FormControl component="fieldset">
              <Text variant="subtitle2" content="Scopes" customColor="var(--theme-text-primary)" />
              {scopesLoading ? (
                <LinearProgress sx={{ mt: 1 }} />
              ) : (
                <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableScopes.map((group) => (
                    <Box key={group.pluginId} sx={{ mb: 2 }}>
                      <Text
                        variant="caption"
                        content={group.pluginId.toUpperCase()}
                        customColor="var(--theme-text-secondary)"
                        fontWeight="600"
                      />
                      <FormGroup>
                        {group.scopes.map((scope) => (
                          <FormControlLabel
                            key={scope.name}
                            control={
                              <Checkbox
                                checked={editForm.scopes.includes(scope.name)}
                                onChange={() => toggleEditScope(scope.name)}
                                size="small"
                              />
                            }
                            label={`${scope.name} - ${scope.description}`}
                            sx={{ ml: 1 }}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
              }
              label="Active (key can be used for authentication)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" label="Cancel" onClick={() => setEditDialogOpen(false)} />
          <Button
            variant="primary"
            label="Update Key"
            onClick={handleUpdateKey}
            disabled={!editForm.name || editForm.scopes.length === 0}
          />
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete} maxWidth="sm" fullWidth>
        <DialogTitle>Delete API Key</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The API key will be permanently deleted.
          </Alert>
          <Text
            variant="body1"
            content={`Are you sure you want to delete the API key "${keyToDelete?.name}"?`}
            customColor="var(--theme-text-primary)"
          />
        </DialogContent>
        <DialogActions>
          <Button variant="text" label="Cancel" onClick={cancelDelete} />
          <Button
            variant="primary"
            label="Delete"
            onClick={confirmDelete}
            sx={{
              bgcolor: 'var(--theme-error)',
              '&:hover': { bgcolor: 'var(--theme-error)' },
            }}
          />
        </DialogActions>
      </Dialog>

      {/* Phase 2: Usage Modal */}
      <Dialog open={usageModalOpen} onClose={() => setUsageModalOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>API Key Usage - {usageData?.keyName}</DialogTitle>
        <DialogContent>
          {usageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress sx={{ width: '100%' }} />
            </Box>
          ) : usageData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Stats Summary */}
              <GridLayout columns={4} spacing="medium">
                <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
                  <CardContent>
                    <Text variant="h5" content={usageData.totalCalls.toString()} customColor="var(--theme-primary)" />
                    <Text variant="body2" content="Total Calls" customColor="var(--theme-text-secondary)" />
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
                  <CardContent>
                    <Text variant="h5" content={formatDate(usageData.lastUsed)} customColor="var(--theme-success)" />
                    <Text variant="body2" content="Last Used" customColor="var(--theme-text-secondary)" />
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
                  <CardContent>
                    <Text variant="h5" content={Object.keys(usageData.callsByEndpoint).length.toString()} customColor="var(--theme-warning)" />
                    <Text variant="body2" content="Unique Endpoints" customColor="var(--theme-text-secondary)" />
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
                  <CardContent>
                    <Text variant="h5" content={Object.keys(usageData.callsByStatus).length.toString()} customColor="var(--theme-info)" />
                    <Text variant="body2" content="Status Codes" customColor="var(--theme-text-secondary)" />
                  </CardContent>
                </Card>
              </GridLayout>

              {/* Usage Logs Table */}
              <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 2, borderBottom: '1px solid var(--theme-border)' }}>
                    <Text variant="h6" content="Recent Requests" customColor="var(--theme-text-primary)" />
                  </Box>
                  <TableContainer sx={{ maxHeight: '400px' }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', bgcolor: 'var(--theme-surface)' }}>Timestamp</TableCell>
                          <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', bgcolor: 'var(--theme-surface)' }}>Method</TableCell>
                          <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', bgcolor: 'var(--theme-surface)' }}>Endpoint</TableCell>
                          <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', bgcolor: 'var(--theme-surface)' }}>Status</TableCell>
                          <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', bgcolor: 'var(--theme-surface)' }}>IP Address</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usageData.logs.map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontSize: '0.85rem' }}>
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                              <Chip
                                size="small"
                                label={log.method}
                                sx={{
                                  bgcolor: log.method === 'GET' ? 'var(--theme-info)20' : 'var(--theme-success)20',
                                  color: log.method === 'GET' ? 'var(--theme-info)' : 'var(--theme-success)',
                                  fontSize: '0.7rem',
                                  fontFamily: 'monospace',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {log.endpoint}
                            </TableCell>
                            <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                              <Chip
                                size="small"
                                label={log.status_code || 'N/A'}
                                sx={{
                                  bgcolor:
                                    log.status_code && log.status_code >= 200 && log.status_code < 300
                                      ? 'var(--theme-success)20'
                                      : log.status_code && log.status_code >= 400
                                      ? 'var(--theme-error)20'
                                      : 'var(--theme-text-secondary)20',
                                  color:
                                    log.status_code && log.status_code >= 200 && log.status_code < 300
                                      ? 'var(--theme-success)'
                                      : log.status_code && log.status_code >= 400
                                      ? 'var(--theme-error)'
                                      : 'var(--theme-text-secondary)',
                                  fontSize: '0.7rem',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                              {log.ip_address || 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {usageData.logs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'var(--theme-text-secondary)' }}>
                              No usage logs found for this key.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Alert severity="info">No usage data available</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="text" label="Close" onClick={() => setUsageModalOpen(false)} />
        </DialogActions>
      </Dialog>
    </Box>
  );
}
