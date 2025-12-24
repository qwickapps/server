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
} from '../api/controlPanelApi';

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

  // Create key dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<CreateApiKeyRequest>({
    name: '',
    key_type: 'pat',
    scopes: ['read'],
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
    scopes: [] as Array<'read' | 'write' | 'admin'>,
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
        scopes: ['read'],
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

  // Toggle scope
  const toggleScope = (scope: 'read' | 'write' | 'admin') => {
    setNewKey(prev => ({
      ...prev,
      scopes: prev.scopes.includes(scope)
        ? prev.scopes.filter(s => s !== scope)
        : [...prev.scopes, scope],
    }));
  };

  const toggleEditScope = (scope: 'read' | 'write' | 'admin') => {
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

  // Get scope color
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'read':
        return 'var(--theme-info)';
      case 'write':
        return 'var(--theme-warning)';
      case 'admin':
        return 'var(--theme-error)';
      default:
        return 'var(--theme-text-secondary)';
    }
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
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newKey.scopes.includes('read')}
                      onChange={() => toggleScope('read')}
                    />
                  }
                  label="Read - View data and resources"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newKey.scopes.includes('write')}
                      onChange={() => toggleScope('write')}
                    />
                  }
                  label="Write - Create and update resources"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newKey.scopes.includes('admin')}
                      onChange={() => toggleScope('admin')}
                    />
                  }
                  label="Admin - Full administrative access"
                />
              </FormGroup>
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
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.scopes.includes('read')}
                      onChange={() => toggleEditScope('read')}
                    />
                  }
                  label="Read - View data and resources"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.scopes.includes('write')}
                      onChange={() => toggleEditScope('write')}
                    />
                  }
                  label="Write - Create and update resources"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editForm.scopes.includes('admin')}
                      onChange={() => toggleEditScope('admin')}
                    />
                  }
                  label="Admin - Full administrative access"
                />
              </FormGroup>
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
    </Box>
  );
}
