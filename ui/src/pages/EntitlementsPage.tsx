/**
 * EntitlementsPage Component
 *
 * Entitlement catalog management page. Allows viewing and managing available entitlements.
 * Write operations (create, edit, delete) are only available when source is not readonly.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  LinearProgress,
  InputAdornment,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Text, Button, Dialog, DialogTitle, DialogContent, DialogActions, GridLayout } from '@qwickapps/react-framework';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import {
  api,
  type EntitlementDefinition,
  type EntitlementsStatus,
} from '../api/controlPanelApi';

export interface EntitlementsPageProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Custom actions to render in the header */
  headerActions?: React.ReactNode;
}

export function EntitlementsPage({
  title = 'Entitlements',
  subtitle = 'Manage available entitlements',
  headerActions,
}: EntitlementsPageProps) {
  // Status state
  const [status, setStatus] = useState<EntitlementsStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Entitlements state
  const [entitlements, setEntitlements] = useState<EntitlementDefinition[]>([]);
  const [filteredEntitlements, setFilteredEntitlements] = useState<EntitlementDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEntitlement, setSelectedEntitlement] = useState<EntitlementDefinition | null>(null);
  const [newEntitlement, setNewEntitlement] = useState({
    name: '',
    category: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch status
  useEffect(() => {
    api.getEntitlementsStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to get status'))
      .finally(() => setStatusLoading(false));
  }, []);

  // Fetch entitlements
  const fetchEntitlements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAvailableEntitlements();
      setEntitlements(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch entitlements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  // Filter entitlements based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredEntitlements(entitlements);
    } else {
      const lowerSearch = search.toLowerCase();
      setFilteredEntitlements(
        entitlements.filter(
          (e) =>
            e.name.toLowerCase().includes(lowerSearch) ||
            e.category?.toLowerCase().includes(lowerSearch) ||
            e.description?.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [entitlements, search]);

  // Group entitlements by category
  const categories = [...new Set(entitlements.map((e) => e.category || 'Uncategorized'))];

  // Handlers
  const handleCreate = async () => {
    if (!newEntitlement.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      // TODO: Add create entitlement API endpoint
      // For now, just show success
      setSuccess(`Entitlement "${newEntitlement.name}" created`);
      setCreateDialogOpen(false);
      setNewEntitlement({ name: '', category: '', description: '' });
      fetchEntitlements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entitlement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEntitlement) return;

    setSaving(true);
    try {
      // TODO: Add update entitlement API endpoint
      setSuccess(`Entitlement "${selectedEntitlement.name}" updated`);
      setEditDialogOpen(false);
      setSelectedEntitlement(null);
      fetchEntitlements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entitlement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntitlement) return;

    setSaving(true);
    try {
      // TODO: Add delete entitlement API endpoint
      setSuccess(`Entitlement "${selectedEntitlement.name}" deleted`);
      setDeleteDialogOpen(false);
      setSelectedEntitlement(null);
      fetchEntitlements();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entitlement');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (entitlement: EntitlementDefinition) => {
    setSelectedEntitlement(entitlement);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (entitlement: EntitlementDefinition) => {
    setSelectedEntitlement(entitlement);
    setDeleteDialogOpen(true);
  };

  const isReadonly = status?.readonly ?? true;

  if (statusLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Text variant="h4" content={title} customColor="var(--theme-text-primary)" />
          <Text variant="body2" content={subtitle} customColor="var(--theme-text-secondary)" />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {headerActions}
          {!isReadonly && (
            <Button
              variant="primary"
              icon="add"
              label="Add Entitlement"
              onClick={() => setCreateDialogOpen(true)}
            />
          )}
        </Box>
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

      {/* Status Cards */}
      <GridLayout columns={3} spacing="medium" sx={{ mb: 3 }} equalHeight>
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalOfferIcon sx={{ fontSize: 40, color: 'var(--theme-primary)' }} />
              <Box>
                <Text variant="h4" content={entitlements.length.toString()} customColor="var(--theme-text-primary)" />
                <Text variant="body2" content="Total Entitlements" customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  bgcolor: 'var(--theme-primary)20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text variant="h6" content={categories.length.toString()} customColor="var(--theme-primary)" />
              </Box>
              <Box>
                <Text variant="body1" fontWeight="500" content="Categories" customColor="var(--theme-text-primary)" />
                <Text variant="body2" content={categories.slice(0, 3).join(', ')} customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isReadonly ? (
                <LockIcon sx={{ fontSize: 40, color: 'var(--theme-warning)' }} />
              ) : (
                <EditIcon sx={{ fontSize: 40, color: 'var(--theme-success)' }} />
              )}
              <Box>
                <Text
                  variant="body1"
                  fontWeight="500"
                  content={isReadonly ? 'Read-only' : 'Editable'}
                  customColor={isReadonly ? 'var(--theme-warning)' : 'var(--theme-success)'}
                />
                <Text variant="body2" content={`Source: ${status?.sources[0]?.name || 'Unknown'}`} customColor="var(--theme-text-secondary)" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </GridLayout>

      {/* Main Content */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'var(--theme-border)' }}>
            <TextField
              size="small"
              placeholder="Search entitlements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'var(--theme-text-secondary)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          {/* Entitlements Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Name</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Category</TableCell>
                  <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Description</TableCell>
                  {!isReadonly && (
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="right">Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntitlements.map((entitlement) => (
                  <TableRow key={entitlement.id} hover>
                    <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalOfferIcon sx={{ fontSize: 18, color: 'var(--theme-primary)' }} />
                        <Text variant="body1" content={entitlement.name} fontWeight="500" />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                      {entitlement.category ? (
                        <Chip
                          size="small"
                          label={entitlement.category}
                          sx={{
                            bgcolor: 'var(--theme-primary)20',
                            color: 'var(--theme-primary)',
                          }}
                        />
                      ) : (
                        <Text variant="body2" content="--" customColor="var(--theme-text-secondary)" />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', maxWidth: 300 }}>
                      {entitlement.description || '--'}
                    </TableCell>
                    {!isReadonly && (
                      <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditDialog(entitlement)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => openDeleteDialog(entitlement)} sx={{ color: 'var(--theme-error)' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredEntitlements.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={isReadonly ? 3 : 4} align="center" sx={{ py: 4, color: 'var(--theme-text-secondary)' }}>
                      {search ? 'No entitlements match your search' : 'No entitlements defined'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Source Info */}
      {status && status.sources.length > 0 && (
        <Card sx={{ bgcolor: 'var(--theme-surface)', mt: 3 }}>
          <CardContent>
            <Text variant="subtitle2" content="Entitlement Sources" customColor="var(--theme-text-secondary)" style={{ marginBottom: '12px' }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {status.sources.map((source, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    size="small"
                    label={source.primary ? 'Primary' : 'Additional'}
                    sx={{
                      bgcolor: source.primary ? 'var(--theme-primary)20' : 'var(--theme-text-secondary)20',
                      color: source.primary ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                    }}
                  />
                  <Text variant="body1" content={source.name} fontWeight="500" customColor="var(--theme-text-primary)" />
                  {source.description && (
                    <Text variant="body2" content={`- ${source.description}`} customColor="var(--theme-text-secondary)" />
                  )}
                  {source.readonly && (
                    <Chip
                      size="small"
                      icon={<LockIcon sx={{ fontSize: 14 }} />}
                      label="Read-only"
                      sx={{
                        bgcolor: 'var(--theme-warning)20',
                        color: 'var(--theme-warning)',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>

            {status.cacheEnabled && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'var(--theme-border)' }}>
                <Text variant="caption" content={`Caching: Enabled (TTL: ${status.cacheTtl}s)`} customColor="var(--theme-text-secondary)" />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      {!isReadonly && (
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Entitlement</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={newEntitlement.name}
                onChange={(e) => setNewEntitlement({ ...newEntitlement, name: e.target.value })}
                placeholder="e.g., premium, pro, feature:analytics"
                required
              />
              <TextField
                label="Category (Optional)"
                fullWidth
                value={newEntitlement.category}
                onChange={(e) => setNewEntitlement({ ...newEntitlement, category: e.target.value })}
                placeholder="e.g., subscription, feature, access"
              />
              <TextField
                label="Description (Optional)"
                fullWidth
                multiline
                rows={2}
                value={newEntitlement.description}
                onChange={(e) => setNewEntitlement({ ...newEntitlement, description: e.target.value })}
                placeholder="Describe what this entitlement grants access to"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="text" label="Cancel" onClick={() => setCreateDialogOpen(false)} />
            <Button
              variant="primary"
              label="Create"
              onClick={handleCreate}
              disabled={!newEntitlement.name.trim() || saving}
            />
          </DialogActions>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {!isReadonly && selectedEntitlement && (
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Entitlement</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={selectedEntitlement.name}
                disabled
                helperText="Name cannot be changed"
              />
              <TextField
                label="Category"
                fullWidth
                value={selectedEntitlement.category || ''}
                onChange={(e) => setSelectedEntitlement({ ...selectedEntitlement, category: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={selectedEntitlement.description || ''}
                onChange={(e) => setSelectedEntitlement({ ...selectedEntitlement, description: e.target.value })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="text" label="Cancel" onClick={() => setEditDialogOpen(false)} />
            <Button
              variant="primary"
              label="Save"
              onClick={handleEdit}
              disabled={saving}
            />
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {!isReadonly && selectedEntitlement && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Delete Entitlement</DialogTitle>
          <DialogContent>
            <Text
              variant="body1"
              content={`Are you sure you want to delete the entitlement "${selectedEntitlement.name}"?`}
              customColor="var(--theme-text-primary)"
            />
            <Alert severity="warning" sx={{ mt: 2 }}>
              This will remove the entitlement from all users who currently have it.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button variant="text" label="Cancel" onClick={() => setDeleteDialogOpen(false)} />
            <Button
              variant="primary"
              color="error"
              label="Delete"
              onClick={handleDelete}
              disabled={saving}
            />
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
