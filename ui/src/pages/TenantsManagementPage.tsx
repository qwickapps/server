/**
 * TenantsManagementPage Component
 *
 * Multi-tenant management page with tenant CRUD and member management.
 * Integrates with Tenants plugin API.
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
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Text, Button, GridLayout } from '@qwickapps/react-framework';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { TenantCard } from '../components/tenants/TenantCard';
import { TenantFormDialog } from '../components/tenants/TenantFormDialog';
import { MemberListDialog } from '../components/tenants/MemberListDialog';

export interface Tenant {
  id: string;
  name: string;
  type: 'user' | 'organization' | 'group' | 'department';
  owner_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TenantWithMembership extends Tenant {
  user_role: string;
  membership: {
    id: string;
    tenant_id: string;
    user_id: string;
    role: string;
    joined_at: string;
  };
}

export interface TenantsManagementPageProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Custom actions to render in the header */
  headerActions?: React.ReactNode;
  /** API base URL */
  apiBaseUrl?: string;
}

export function TenantsManagementPage({
  title = 'Tenant Management',
  subtitle = 'Manage organizations, groups, and departments',
  headerActions,
  apiBaseUrl = '/api/tenants',
}: TenantsManagementPageProps) {
  // Tenants state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsTotal, setTenantsTotal] = useState(0);
  const [tenantsPage, setTenantsPage] = useState(0);
  const [tenantsPerPage, setTenantsPerPage] = useState(20);
  const [tenantsSearch, setTenantsSearch] = useState('');
  const [tenantTypeFilter, setTenantTypeFilter] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [membersDialogTenant, setMembersDialogTenant] = useState<Tenant | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    organizations: 0,
    groups: 0,
    departments: 0,
  });

  // Load tenants
  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(tenantsPage + 1),
        limit: String(tenantsPerPage),
      });

      if (tenantsSearch) {
        params.append('q', tenantsSearch);
      }

      if (tenantTypeFilter) {
        params.append('type', tenantTypeFilter);
      }

      const response = await fetch(`${apiBaseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to load tenants: ${response.statusText}`);
      }

      const data = await response.json();

      setTenants(data.tenants || []);
      setTenantsTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tenants');
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, tenantsPage, tenantsPerPage, tenantsSearch, tenantTypeFilter]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const allTenants = data.tenants || [];

        setStats({
          total: data.total || 0,
          organizations: allTenants.filter((t: Tenant) => t.type === 'organization').length,
          groups: allTenants.filter((t: Tenant) => t.type === 'group').length,
          departments: allTenants.filter((t: Tenant) => t.type === 'department').length,
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [apiBaseUrl]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Handlers
  const handleCreateTenant = async (data: { name: string; type: string; owner_id: string; metadata?: Record<string, unknown> }) => {
    try {
      const response = await fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tenant');
      }

      setCreateDialogOpen(false);
      await loadTenants();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    }
  };

  const handleUpdateTenant = async (id: string, data: { name?: string; metadata?: Record<string, unknown> }) => {
    try {
      const response = await fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tenant');
      }

      setEditTenant(null);
      await loadTenants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tenant');
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This will remove all members.')) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tenant');
      }

      await loadTenants();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tenant');
    }
  };

  const getTenantIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return <BusinessIcon />;
      case 'group':
        return <GroupIcon />;
      case 'department':
        return <BusinessIcon />;
      case 'user':
        return <PersonIcon />;
      default:
        return <BusinessIcon />;
    }
  };

  const getTenantTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (type) {
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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Text variant="h4" component="h1" gutterBottom>
          {title}
        </Text>
        {subtitle && (
          <Text variant="body2" color="text.secondary" gutterBottom>
            {subtitle}
          </Text>
        )}
      </Box>

      {/* Statistics */}
      <GridLayout columns={4} spacing={2} sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Text variant="h6" color="primary">
              {stats.total}
            </Text>
            <Text variant="body2" color="text.secondary">
              Total Tenants
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Text variant="h6" color="primary">
              {stats.organizations}
            </Text>
            <Text variant="body2" color="text.secondary">
              Organizations
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Text variant="h6" color="secondary">
              {stats.groups}
            </Text>
            <Text variant="body2" color="text.secondary">
              Groups
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Text variant="h6" color="info">
              {stats.departments}
            </Text>
            <Text variant="body2" color="text.secondary">
              Departments
            </Text>
          </CardContent>
        </Card>
      </GridLayout>

      {/* Actions */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search tenants..."
          value={tenantsSearch}
          onChange={(e) => {
            setTenantsSearch(e.target.value);
            setTenantsPage(0);
          }}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={tenantTypeFilter}
            label="Type"
            onChange={(e) => {
              setTenantTypeFilter(e.target.value);
              setTenantsPage(0);
            }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="organization">Organization</MenuItem>
            <MenuItem value="group">Group</MenuItem>
            <MenuItem value="department">Department</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
          Create Tenant
        </Button>
        {headerActions}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tenants Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Owner ID</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Text variant="body2" color="text.secondary">
                      No tenants found
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                tenants.map((tenant) => (
                  <TableRow key={tenant.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTenantIcon(tenant.type)}
                        {tenant.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tenant.type}
                        size="small"
                        color={getTenantTypeColor(tenant.type)}
                      />
                    </TableCell>
                    <TableCell>
                      <Text variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {tenant.owner_id.substring(0, 8)}...
                      </Text>
                    </TableCell>
                    <TableCell>
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Manage Members">
                        <IconButton size="small" onClick={() => setMembersDialogTenant(tenant)}>
                          <PeopleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => setEditTenant(tenant)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTenant(tenant.id)}
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
        <TablePagination
          component="div"
          count={tenantsTotal}
          page={tenantsPage}
          onPageChange={(_, page) => setTenantsPage(page)}
          rowsPerPage={tenantsPerPage}
          onRowsPerPageChange={(e) => {
            setTenantsPerPage(parseInt(e.target.value, 10));
            setTenantsPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* Create Tenant Dialog */}
      <TenantFormDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateTenant}
      />

      {/* Edit Tenant Dialog */}
      {editTenant && (
        <TenantFormDialog
          open={!!editTenant}
          tenant={editTenant}
          onClose={() => setEditTenant(null)}
          onSubmit={(data) => handleUpdateTenant(editTenant.id, data)}
        />
      )}

      {/* Members Dialog */}
      {membersDialogTenant && (
        <MemberListDialog
          open={!!membersDialogTenant}
          tenant={membersDialogTenant}
          apiBaseUrl={apiBaseUrl}
          onClose={() => setMembersDialogTenant(null)}
        />
      )}
    </Box>
  );
}
