/**
 * MemberInviteDialog Component
 *
 * Dialog for inviting/adding a member to a tenant.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@qwickapps/react-framework';

export interface MemberInviteDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Tenant name for display */
  tenantName: string;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: { user_id: string; role: string }) => void | Promise<void>;
}

export function MemberInviteDialog({
  open,
  tenantName,
  onClose,
  onSubmit,
}: MemberInviteDialogProps) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<string>('member');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setUserId('');
      setRole('member');
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!userId.trim()) {
      newErrors.userId = 'User ID is required';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        user_id: userId.trim(),
        role,
      });
      onClose();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to add member',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Member to {tenantName}</DialogTitle>
      <DialogContent>
        <TextField
          label="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.userId}
          helperText={errors.userId || 'UUID of the user to add'}
          autoFocus
        />

        <FormControl fullWidth margin="normal" error={!!errors.role}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="owner">Owner - Full control</MenuItem>
            <MenuItem value="admin">Admin - Manage members</MenuItem>
            <MenuItem value="member">Member - Standard access</MenuItem>
            <MenuItem value="viewer">Viewer - Read-only</MenuItem>
          </Select>
          {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
        </FormControl>

        {errors.submit && (
          <FormHelperText error sx={{ mt: 2 }}>
            {errors.submit}
          </FormHelperText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
