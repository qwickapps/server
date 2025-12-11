/**
 * UsersPage Component
 *
 * Generic user management page that works with Users, Bans, and Entitlements plugins.
 * All features are optional and auto-detected based on available plugins.
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
  Tabs,
  Tab,
  TablePagination,
  Tooltip,
  IconButton,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { Text, Button, Dialog, DialogTitle, DialogContent, DialogActions, GridLayout } from '@qwickapps/react-framework';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  api,
  type User,
  type Ban,
  type EntitlementResult,
  type EntitlementDefinition,
  type PluginFeatures,
} from '../api/controlPanelApi';

export interface UsersPageProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Override automatic feature detection */
  features?: Partial<PluginFeatures>;
  /** Custom actions to render in the header */
  headerActions?: React.ReactNode;
  /** Callback when a user is selected */
  onUserSelect?: (user: User) => void;
}

export function UsersPage({
  title = 'User Management',
  subtitle = 'Manage users, bans, and entitlements',
  features: featureOverrides,
  headerActions,
  onUserSelect,
}: UsersPageProps) {
  // Feature detection
  const [features, setFeatures] = useState<PluginFeatures>({
    users: featureOverrides?.users ?? true,
    bans: featureOverrides?.bans ?? false,
    entitlements: featureOverrides?.entitlements ?? false,
    entitlementsReadonly: featureOverrides?.entitlementsReadonly ?? true,
  });
  const [featuresLoaded, setFeaturesLoaded] = useState(!!featureOverrides);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(25);
  const [usersSearch, setUsersSearch] = useState('');

  // User entitlements cache (email -> count)
  const [userEntitlementCounts, setUserEntitlementCounts] = useState<Record<string, number>>({});

  // Banned users state
  const [bans, setBans] = useState<Ban[]>([]);
  const [bansTotal, setBansTotal] = useState(0);

  // Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Ban dialog state
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [newBan, setNewBan] = useState({
    email: '',
    reason: '',
    expiresAt: '',
  });

  // Entitlements lookup state
  const [entitlementsDialogOpen, setEntitlementsDialogOpen] = useState(false);
  const [entitlementsSearch, setEntitlementsSearch] = useState('');
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);
  const [entitlementsRefreshing, setEntitlementsRefreshing] = useState(false);
  const [entitlementsData, setEntitlementsData] = useState<EntitlementResult | null>(null);
  const [entitlementsError, setEntitlementsError] = useState<string | null>(null);

  // Available entitlements (for grant dropdown)
  const [availableEntitlements, setAvailableEntitlements] = useState<EntitlementDefinition[]>([]);
  const [selectedEntitlement, setSelectedEntitlement] = useState<string>('');
  const [grantingEntitlement, setGrantingEntitlement] = useState(false);

  // Detect features on mount
  useEffect(() => {
    if (featureOverrides) return;

    api.detectFeatures().then((detected) => {
      setFeatures(detected);
      setFeaturesLoaded(true);
    }).catch(() => {
      setFeaturesLoaded(true);
    });
  }, [featureOverrides]);

  // Fetch available entitlements when features are loaded
  useEffect(() => {
    if (featuresLoaded && features.entitlements && !features.entitlementsReadonly) {
      api.getAvailableEntitlements().then(setAvailableEntitlements).catch(() => {});
    }
  }, [featuresLoaded, features.entitlements, features.entitlementsReadonly]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!features.users) return;

    setLoading(true);
    try {
      const data = await api.getUsers({
        limit: usersPerPage,
        page: usersPage,
        search: usersSearch || undefined,
      });
      setUsers(data.users || []);
      setUsersTotal(data.total);
      setError(null);

      // Fetch entitlement counts for visible users if entitlements plugin is enabled
      if (features.entitlements && data.users?.length) {
        const counts: Record<string, number> = {};
        await Promise.all(
          data.users.map(async (user) => {
            try {
              const ent = await api.getEntitlements(user.email);
              counts[user.email] = ent.entitlements.length;
            } catch {
              counts[user.email] = 0;
            }
          })
        );
        setUserEntitlementCounts((prev) => ({ ...prev, ...counts }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [features.users, features.entitlements, usersPage, usersPerPage, usersSearch]);

  // Fetch bans
  const fetchBans = useCallback(async () => {
    if (!features.bans) return;

    setLoading(true);
    try {
      const data = await api.getBans();
      setBans(data.bans || []);
      setBansTotal(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bans');
    } finally {
      setLoading(false);
    }
  }, [features.bans]);

  // Initial fetch and tab-based fetching
  useEffect(() => {
    if (!featuresLoaded) return;

    if (activeTab === 0 && features.users) {
      fetchUsers();
    } else if (activeTab === 1 && features.bans) {
      fetchBans();
    }
  }, [activeTab, featuresLoaded, features.users, features.bans, fetchUsers, fetchBans]);

  // Fetch bans count for stats (only on initial load)
  useEffect(() => {
    if (featuresLoaded && features.bans) {
      fetchBans();
    }
  }, [featuresLoaded, features.bans, fetchBans]);

  // Debounced search
  useEffect(() => {
    if (!featuresLoaded) return;

    const timeout = setTimeout(() => {
      if (activeTab === 0 && features.users) {
        setUsersPage(0);
        fetchUsers();
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [usersSearch, activeTab, featuresLoaded, features.users, fetchUsers]);

  // Ban handlers
  const handleBanUser = async () => {
    try {
      await api.banUser(newBan.email, newBan.reason, newBan.expiresAt || undefined);
      setSuccess('User banned successfully');
      setBanDialogOpen(false);
      setNewBan({ email: '', reason: '', expiresAt: '' });
      fetchBans();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    }
  };

  const handleUnbanUser = async (email: string) => {
    if (!confirm('Unban this user?')) return;

    try {
      await api.unbanUser(email);
      setSuccess('User unbanned successfully');
      fetchBans();
    } catch (err) {
      setError('Failed to unban user');
    }
  };

  // Entitlements handlers
  const handleEntitlementsSearch = async () => {
    if (!entitlementsSearch.trim()) {
      setEntitlementsError('Please enter an email address');
      return;
    }

    setEntitlementsLoading(true);
    setEntitlementsError(null);
    setEntitlementsData(null);

    try {
      const data = await api.getEntitlements(entitlementsSearch);
      setEntitlementsData(data);
    } catch (err) {
      setEntitlementsError(err instanceof Error ? err.message : 'Failed to lookup entitlements');
    } finally {
      setEntitlementsLoading(false);
    }
  };

  const handleEntitlementsRefresh = async () => {
    if (!entitlementsData) return;

    setEntitlementsRefreshing(true);
    try {
      const data = await api.refreshEntitlements(entitlementsSearch);
      setEntitlementsData(data);
    } catch (err) {
      setEntitlementsError('Failed to refresh entitlements');
    } finally {
      setEntitlementsRefreshing(false);
    }
  };

  const handleGrantEntitlement = async () => {
    if (!selectedEntitlement || !entitlementsData) return;

    setGrantingEntitlement(true);
    try {
      await api.grantEntitlement(entitlementsData.identifier, selectedEntitlement);
      setSuccess(`Entitlement "${selectedEntitlement}" granted`);
      setSelectedEntitlement('');
      // Refresh to show new entitlement
      const data = await api.refreshEntitlements(entitlementsData.identifier);
      setEntitlementsData(data);
      // Update count cache
      setUserEntitlementCounts((prev) => ({
        ...prev,
        [entitlementsData.identifier]: data.entitlements.length,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant entitlement');
    } finally {
      setGrantingEntitlement(false);
    }
  };

  const handleRevokeEntitlement = async (entitlement: string) => {
    if (!entitlementsData) return;
    if (!confirm(`Revoke "${entitlement}" from ${entitlementsData.identifier}?`)) return;

    try {
      await api.revokeEntitlement(entitlementsData.identifier, entitlement);
      setSuccess(`Entitlement "${entitlement}" revoked`);
      // Refresh to show updated entitlements
      const data = await api.refreshEntitlements(entitlementsData.identifier);
      setEntitlementsData(data);
      // Update count cache
      setUserEntitlementCounts((prev) => ({
        ...prev,
        [entitlementsData.identifier]: data.entitlements.length,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke entitlement');
    }
  };

  const openEntitlementsDialog = (email?: string) => {
    if (email) {
      setEntitlementsSearch(email);
      // Auto-search when opened with email
      setEntitlementsLoading(true);
      setEntitlementsError(null);
      setEntitlementsData(null);
      api.getEntitlements(email)
        .then(setEntitlementsData)
        .catch((err) => setEntitlementsError(err instanceof Error ? err.message : 'Failed to lookup entitlements'))
        .finally(() => setEntitlementsLoading(false));
    }
    setEntitlementsDialogOpen(true);
  };

  // Utility functions
  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get entitlements that can be granted (not already assigned)
  const grantableEntitlements = availableEntitlements.filter(
    (e) => !entitlementsData?.entitlements.includes(e.name)
  );

  // Build tabs based on available features
  const tabs: { label: string; count?: number }[] = [];
  if (features.users) tabs.push({ label: 'Users', count: usersTotal });
  if (features.bans) tabs.push({ label: 'Banned', count: bansTotal });

  if (!featuresLoaded) {
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
          {features.entitlements && (
            <Button
              variant="outlined"
              icon="person_search"
              label="Lookup Entitlements"
              onClick={() => openEntitlementsDialog()}
            />
          )}
          {features.bans && (
            <Button
              variant="primary"
              color="error"
              icon="block"
              label="Ban User"
              onClick={() => setBanDialogOpen(true)}
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

      {/* Stats Cards */}
      {features.users && (
        <GridLayout columns={features.bans ? 3 : 2} spacing="medium" sx={{ mb: 3 }} equalHeight>
          <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: 'var(--theme-primary)' }} />
                <Box>
                  <Text variant="h4" content={usersTotal.toLocaleString()} customColor="var(--theme-text-primary)" />
                  <Text variant="body2" content="Total Users" customColor="var(--theme-text-secondary)" />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {features.entitlements && (
            <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalOfferIcon sx={{ fontSize: 40, color: 'var(--theme-success)' }} />
                  <Box>
                    <Text variant="body1" fontWeight="500" content="Entitlements" customColor="var(--theme-text-primary)" />
                    <Text
                      variant="body2"
                      content={features.entitlementsReadonly ? 'Read-only Mode' : 'Plugin Active'}
                      customColor={features.entitlementsReadonly ? 'var(--theme-warning)' : 'var(--theme-success)'}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {features.bans && (
            <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BlockIcon sx={{ fontSize: 40, color: bansTotal > 0 ? 'var(--theme-error)' : 'var(--theme-text-secondary)' }} />
                  <Box>
                    <Text variant="h4" content={bansTotal.toString()} customColor={bansTotal > 0 ? 'var(--theme-error)' : 'var(--theme-text-primary)'} />
                    <Text variant="body2" content="Banned Users" customColor="var(--theme-text-secondary)" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </GridLayout>
      )}

      {/* Main Content */}
      <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
        {tabs.length > 1 && (
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{ borderBottom: 1, borderColor: 'var(--theme-border)', px: 2 }}
          >
            {tabs.map((tab, idx) => (
              <Tab key={idx} label={`${tab.label}${tab.count !== undefined ? ` (${tab.count})` : ''}`} />
            ))}
          </Tabs>
        )}

        <CardContent sx={{ p: 0 }}>
          {/* Search Bar */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'var(--theme-border)' }}>
            <TextField
              size="small"
              placeholder="Search by email or name..."
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
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

          {/* Users Tab */}
          {activeTab === 0 && features.users && (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>ID</TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Name</TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Email</TableCell>
                      {features.entitlements && (
                        <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="center">Entitlements</TableCell>
                      )}
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Created</TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{ cursor: onUserSelect ? 'pointer' : 'default' }}
                        onClick={() => onUserSelect?.(user)}
                      >
                        <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {user.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                          <Text variant="body1" content={user.name || '--'} fontWeight="500" />
                        </TableCell>
                        <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                          {user.email}
                        </TableCell>
                        {features.entitlements && (
                          <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="center">
                            <Chip
                              size="small"
                              icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
                              label={userEntitlementCounts[user.email] ?? '...'}
                              sx={{
                                bgcolor: 'var(--theme-primary)20',
                                color: 'var(--theme-primary)',
                              }}
                            />
                          </TableCell>
                        )}
                        <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                          {formatDate(user.created_at)}
                        </TableCell>
                        <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="right">
                          {features.entitlements && (
                            <Tooltip title="View entitlements">
                              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEntitlementsDialog(user.email); }}>
                                <LocalOfferIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={features.entitlements ? 6 : 5} align="center" sx={{ py: 4, color: 'var(--theme-text-secondary)' }}>
                          {usersSearch ? 'No users match your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={usersTotal}
                page={usersPage}
                onPageChange={(_, page) => setUsersPage(page)}
                rowsPerPage={usersPerPage}
                onRowsPerPageChange={(e) => {
                  setUsersPerPage(parseInt(e.target.value, 10));
                  setUsersPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                sx={{ borderTop: 1, borderColor: 'var(--theme-border)' }}
              />
            </>
          )}

          {/* Banned Users Tab */}
          {activeTab === 1 && features.bans && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Email</TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Reason</TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Banned At</TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Expires</TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>Banned By</TableCell>
                    <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bans.map((ban) => (
                    <TableRow key={ban.id}>
                      <TableCell sx={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                        <Text variant="body1" content={ban.email} fontWeight="500" />
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', maxWidth: 200 }}>
                        <Text variant="body2" content={ban.reason} noWrap />
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        {formatDate(ban.banned_at)}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'var(--theme-border)' }}>
                        <Chip
                          size="small"
                          label={ban.expires_at ? formatDate(ban.expires_at) : 'Permanent'}
                          sx={{
                            bgcolor: ban.expires_at ? 'var(--theme-warning)20' : 'var(--theme-error)20',
                            color: ban.expires_at ? 'var(--theme-warning)' : 'var(--theme-error)',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }}>
                        {ban.banned_by}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'var(--theme-border)' }} align="right">
                        <Button
                          buttonSize="small"
                          variant="text"
                          color="success"
                          icon="check_circle"
                          label="Unban"
                          onClick={() => handleUnbanUser(ban.email)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {bans.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'var(--theme-text-secondary)' }}>
                        No users are currently banned
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Ban User Dialog */}
      {features.bans && (
        <Dialog
          open={banDialogOpen}
          onClose={() => setBanDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ban User</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Email"
                fullWidth
                value={newBan.email}
                onChange={(e) => setNewBan({ ...newBan, email: e.target.value })}
                placeholder="Enter user email"
              />
              <TextField
                label="Reason"
                fullWidth
                multiline
                rows={3}
                value={newBan.reason}
                onChange={(e) => setNewBan({ ...newBan, reason: e.target.value })}
                placeholder="Enter reason for ban"
              />
              <TextField
                label="Expiration (Optional)"
                type="datetime-local"
                fullWidth
                value={newBan.expiresAt}
                onChange={(e) => setNewBan({ ...newBan, expiresAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for permanent ban"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="text"
              label="Cancel"
              onClick={() => {
                setBanDialogOpen(false);
                setNewBan({ email: '', reason: '', expiresAt: '' });
              }}
            />
            <Button
              variant="primary"
              color="error"
              label="Ban User"
              onClick={handleBanUser}
              disabled={!newBan.email || !newBan.reason}
            />
          </DialogActions>
        </Dialog>
      )}

      {/* Entitlements Lookup Dialog */}
      {features.entitlements && (
        <Dialog
          open={entitlementsDialogOpen}
          onClose={() => setEntitlementsDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>User Entitlements</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Email"
                  fullWidth
                  value={entitlementsSearch}
                  onChange={(e) => setEntitlementsSearch(e.target.value)}
                  placeholder="Enter user email"
                  onKeyDown={(e) => e.key === 'Enter' && handleEntitlementsSearch()}
                />
                <Button
                  variant="primary"
                  icon="search"
                  label="Lookup"
                  onClick={handleEntitlementsSearch}
                  disabled={entitlementsLoading}
                />
              </Box>

              {entitlementsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {entitlementsError && (
                <Alert severity="error">{entitlementsError}</Alert>
              )}

              {entitlementsData && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Text variant="h6" content={entitlementsData.identifier} customColor="var(--theme-text-primary)" />
                      <Text variant="body2" content={`Source: ${entitlementsData.source}`} customColor="var(--theme-text-secondary)" />
                    </Box>
                    <Button
                      variant="outlined"
                      icon="refresh"
                      label={entitlementsRefreshing ? 'Refreshing...' : 'Refresh'}
                      onClick={handleEntitlementsRefresh}
                      disabled={entitlementsRefreshing}
                      buttonSize="small"
                    />
                  </Box>

                  {/* Grant Entitlement Section (only if not readonly) */}
                  {!features.entitlementsReadonly && grantableEntitlements.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, p: 2, bgcolor: 'var(--theme-background)', borderRadius: 1 }}>
                      <Autocomplete
                        size="small"
                        options={grantableEntitlements}
                        getOptionLabel={(option) => option.name}
                        value={grantableEntitlements.find((e) => e.name === selectedEntitlement) || null}
                        onChange={(_, newValue) => setSelectedEntitlement(newValue?.name || '')}
                        renderInput={(params) => (
                          <TextField {...params} label="Grant Entitlement" placeholder="Select entitlement" />
                        )}
                        sx={{ flex: 1 }}
                      />
                      <Button
                        variant="primary"
                        icon="add"
                        label="Grant"
                        onClick={handleGrantEntitlement}
                        disabled={!selectedEntitlement || grantingEntitlement}
                        buttonSize="small"
                      />
                    </Box>
                  )}

                  <Text variant="subtitle2" content="Current Entitlements" customColor="var(--theme-text-secondary)" style={{ marginBottom: '8px' }} />
                  {entitlementsData.entitlements.length === 0 ? (
                    <Text variant="body2" content="No entitlements found" customColor="var(--theme-text-secondary)" />
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {entitlementsData.entitlements.map((ent, idx) => (
                        <Chip
                          key={idx}
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          label={ent}
                          onDelete={!features.entitlementsReadonly ? () => handleRevokeEntitlement(ent) : undefined}
                          deleteIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            bgcolor: 'var(--theme-success)20',
                            color: 'var(--theme-success)',
                            '& .MuiChip-deleteIcon': {
                              color: 'var(--theme-error)',
                              '&:hover': {
                                color: 'var(--theme-error)',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  )}

                  <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'var(--theme-border)' }}>
                    <Text variant="caption" content={`Data from: ${entitlementsData.source === 'cache' ? 'Cache' : 'Source'}`} customColor="var(--theme-text-secondary)" />
                    {entitlementsData.cachedAt && (
                      <Text variant="caption" content={` | Cached: ${formatDate(entitlementsData.cachedAt)}`} customColor="var(--theme-text-secondary)" />
                    )}
                    {features.entitlementsReadonly && (
                      <Text variant="caption" content=" | Read-only mode (modifications disabled)" customColor="var(--theme-warning)" />
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="text" label="Close" onClick={() => setEntitlementsDialogOpen(false)} />
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
