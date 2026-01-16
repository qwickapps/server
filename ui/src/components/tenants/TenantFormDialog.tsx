/**
 * TenantFormDialog Component
 *
 * Dialog for creating and editing tenants.
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

export interface Tenant {
  id: string;
  name: string;
  type: 'user' | 'organization' | 'group' | 'department';
  owner_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantFormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Tenant to edit (if editing) */
  tenant?: Tenant;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when form is submitted */
  onSubmit: (data: {
    name: string;
    type: string;
    owner_id: string;
    metadata?: Record<string, unknown>;
  }) => void | Promise<void>;
}

export function TenantFormDialog({
  open,
  tenant,
  onClose,
  onSubmit,
}: TenantFormDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('organization');
  const [ownerId, setOwnerId] = useState('');
  const [metadataJson, setMetadataJson] = useState('{}');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!tenant;

  // Initialize form when tenant changes
  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setType(tenant.type);
      setOwnerId(tenant.owner_id);
      setMetadataJson(JSON.stringify(tenant.metadata || {}, null, 2));
    } else {
      setName('');
      setType('organization');
      setOwnerId('');
      setMetadataJson('{}');
    }
    setErrors({});
  }, [tenant, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isEditMode && !ownerId.trim()) {
      newErrors.ownerId = 'Owner ID is required';
    }

    // Validate JSON
    try {
      JSON.parse(metadataJson);
    } catch {
      newErrors.metadata = 'Invalid JSON format';
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
      const data: {
        name: string;
        type?: string;
        owner_id?: string;
        metadata?: Record<string, unknown>;
      } = {
        name: name.trim(),
      };

      // Only include type and owner_id for create (not edit)
      if (!isEditMode) {
        data.type = type;
        data.owner_id = ownerId.trim();
      }

      // Parse and include metadata if not empty
      const parsedMetadata = JSON.parse(metadataJson);
      if (Object.keys(parsedMetadata).length > 0) {
        data.metadata = parsedMetadata;
      }

      await onSubmit(data as any);
      onClose();
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to submit form',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? 'Edit Tenant' : 'Create Tenant'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          autoFocus
        />

        {!isEditMode && (
          <>
            <FormControl fullWidth margin="normal" error={!!errors.type}>
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
                <MenuItem value="group">Group</MenuItem>
                <MenuItem value="department">Department</MenuItem>
              </Select>
              {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
            </FormControl>

            <TextField
              label="Owner ID"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              fullWidth
              margin="normal"
              error={!!errors.ownerId}
              helperText={errors.ownerId || 'UUID of the user who owns this tenant'}
            />
          </>
        )}

        <TextField
          label="Metadata (JSON)"
          value={metadataJson}
          onChange={(e) => setMetadataJson(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          error={!!errors.metadata}
          helperText={errors.metadata || 'Optional metadata in JSON format'}
        />

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
          {submitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
