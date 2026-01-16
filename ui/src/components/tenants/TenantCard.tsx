/**
 * TenantCard Component
 *
 * Displays tenant information in a card format.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { Card, CardContent, CardActions, Chip, IconButton, Box, Tooltip } from '@mui/material';
import { Text } from '@qwickapps/react-framework';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

export interface Tenant {
  id: string;
  name: string;
  type: 'user' | 'organization' | 'group' | 'department';
  owner_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantCardProps {
  /** Tenant data */
  tenant: Tenant;
  /** Callback when edit is clicked */
  onEdit?: (tenant: Tenant) => void;
  /** Callback when delete is clicked */
  onDelete?: (tenant: Tenant) => void;
  /** Callback when manage members is clicked */
  onManageMembers?: (tenant: Tenant) => void;
  /** Whether to show actions */
  showActions?: boolean;
}

export function TenantCard({
  tenant,
  onEdit,
  onDelete,
  onManageMembers,
  showActions = true,
}: TenantCardProps) {
  const getTenantIcon = () => {
    switch (tenant.type) {
      case 'organization':
        return <BusinessIcon color="primary" />;
      case 'group':
        return <GroupIcon color="secondary" />;
      case 'department':
        return <BusinessIcon color="info" />;
      case 'user':
        return <PersonIcon color="success" />;
      default:
        return <BusinessIcon />;
    }
  };

  const getTenantTypeColor = (): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (tenant.type) {
      case 'organization':
        return 'primary';
      case 'group':
        return 'secondary';
      case 'department':
        return 'info';
      case 'user':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {getTenantIcon()}
          <Box sx={{ flexGrow: 1 }}>
            <Text variant="h6" component="div">
              {tenant.name}
            </Text>
            <Text variant="body2" color="textSecondary">
              ID: {tenant.id.substring(0, 8)}...
            </Text>
          </Box>
          <Chip
            label={tenant.type}
            size="small"
            color={getTenantTypeColor()}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Text variant="body2" color="textSecondary">
            <strong>Owner:</strong> {tenant.owner_id.substring(0, 8)}...
          </Text>
          <Text variant="body2" color="textSecondary">
            <strong>Created:</strong> {new Date(tenant.created_at).toLocaleDateString()}
          </Text>
          {tenant.metadata && Object.keys(tenant.metadata).length > 0 && (
            <Text variant="body2" color="textSecondary">
              <strong>Metadata:</strong> {Object.keys(tenant.metadata).length} fields
            </Text>
          )}
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          {onManageMembers && (
            <Tooltip title="Manage Members">
              <IconButton size="small" onClick={() => onManageMembers(tenant)}>
                <PeopleIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(tenant)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(tenant)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </CardActions>
      )}
    </Card>
  );
}
