/**
 * MemberRoleDialog Component
 *
 * Dialog for changing a member's role.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Text } from '@qwickapps/react-framework';

export interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export interface MemberRoleDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Member to edit */
  member: TenantMembership;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when role is changed */
  onSubmit: (role: string) => void | Promise<void>;
}

export function MemberRoleDialog({
  open,
  member,
  onClose,
  onSubmit,
}: MemberRoleDialogProps) {
  const [role, setRole] = useState<string>(member.role);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset form when member changes
  useEffect(() => {
    setRole(member.role);
    setErrors({});
    setSubmitting(false);
  }, [member]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!role) {
      newErrors.role = 'Role is required';
    }

    if (role === member.role) {
      newErrors.role = 'Role has not changed';
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
      await onSubmit(role);
      onClose();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to update role',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Member Role</DialogTitle>
      <DialogContent>
        <Text variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          User: {member.user_id.substring(0, 16)}...
        </Text>

        <FormControl fullWidth margin="normal" error={!!errors.role}>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
            autoFocus
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
          {submitting ? 'Updating...' : 'Update Role'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
