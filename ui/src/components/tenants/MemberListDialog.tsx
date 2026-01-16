/**
 * MemberListDialog Component
 *
 * Dialog for viewing and managing tenant members.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  LinearProgress,
  Box,
  Tooltip,
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Text } from '@qwickapps/react-framework';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { MemberInviteDialog } from './MemberInviteDialog';
import { MemberRoleDialog } from './MemberRoleDialog';

export interface Tenant {
  id: string;
  name: string;
  type: string;
  owner_id: string;
}

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface MemberListDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Tenant to show members for */
  tenant: Tenant;
  /** API base URL */
  apiBaseUrl: string;
  /** Callback when dialog is closed */
  onClose: () => void;
}

export function MemberListDialog({
  open,
  tenant,
  apiBaseUrl,
  onClose,
}: MemberListDialogProps) {
  const [members, setMembers] = useState<TenantMembership[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMember, setEditMember] = useState<TenantMembership | null>(null);

  const loadMembers = useCallback(async () => {
    if (!open || !tenant) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/${tenant.id}/members`);

      if (!response.ok) {
        throw new Error(`Failed to load members: ${response.statusText}`);
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
      console.error('Failed to load members:', err);
    } finally {
      setLoading(false);
    }
  }, [open, tenant, apiBaseUrl]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAddMember = async (data: { user_id: string; role: string }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${tenant.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }

      setInviteDialogOpen(false);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${tenant.id}/members/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      setEditMember(null);
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the tenant?')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/${tenant.id}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove member');
      }

      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const getRoleColor = (role: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (role) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'info';
      case 'viewer':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Members: {tenant.name}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              icon={<AddIcon />}
              onClick={() => setInviteDialogOpen(true)}
              buttonSize="small"
            >
              Add Member
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User ID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Text variant="body2" color="textSecondary">
                        No members found
                      </Text>
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Text variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {member.user_id.substring(0, 16)}...
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={member.role}
                          size="small"
                          color={getRoleColor(member.role)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Change Role">
                          <IconButton
                            size="small"
                            onClick={() => setEditMember(member)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove Member">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveMember(member.user_id)}
                            disabled={member.role === 'owner'}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Text variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Total members: {members.length}
          </Text>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <MemberInviteDialog
        open={inviteDialogOpen}
        tenantName={tenant.name}
        onClose={() => setInviteDialogOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* Edit Role Dialog */}
      {editMember && (
        <MemberRoleDialog
          open={!!editMember}
          member={editMember}
          onClose={() => setEditMember(null)}
          onSubmit={(role) => handleUpdateRole(editMember.user_id, role)}
        />
      )}
    </>
  );
}
