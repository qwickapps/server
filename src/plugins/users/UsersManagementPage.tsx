/**
 * Users Management Page Component
 * Full user management with CRUD operations, search, and filtering
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard, type Column } from '@qwickapps/react-framework';

export interface UsersManagementPageProps {
  apiPrefix?: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  provider?: string;
  status: 'invited' | 'active' | 'suspended';
  created_at: string;
  last_login_at?: string;
  picture?: string;
}

interface UsersStats {
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
  suspendedUsers: number;
  recentSignups: number;
}

export const UsersManagementPage: React.FC<UsersManagementPageProps> = ({
  apiPrefix = '/api/users',
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UsersStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
      });

      if (searchQuery) params.append('q', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`${apiPrefix}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiPrefix}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${apiPrefix}/${userId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const response = await fetch(`${apiPrefix}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' }),
      });
      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to suspend user:', err);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await fetch(`${apiPrefix}/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      }
    } catch (err) {
      console.error('Failed to activate user:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'invited':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'suspended':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const userColumns: Column<User>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_value, row) => (
        <div className="flex items-center">
          {row.picture && (
            <img
              src={row.picture}
              alt={row.name || row.email}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <div>
            <button
              onClick={() => setSelectedUser(row)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {row.email}
            </button>
            {row.name && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{row.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'Provider',
      sortable: true,
      render: (_value, row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {row.provider || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value, row) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (_value, row) => new Date(row.created_at).toLocaleDateString(),
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      sortable: true,
      render: (_value, row) => {
        if (!row.last_login_at) return <span className="text-gray-400">Never</span>;
        const date = new Date(row.last_login_at);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
      },
    },
    {
      key: 'actions' as keyof User,
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex gap-2">
          {row.status === 'active' && (
            <button
              onClick={() => handleSuspendUser(row.id)}
              className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
            >
              Suspend
            </button>
          )}
          {row.status === 'suspended' && (
            <button
              onClick={() => handleActivateUser(row.id)}
              className="text-sm text-green-600 dark:text-green-400 hover:underline"
            >
              Activate
            </button>
          )}
          <button
            onClick={() => handleDeleteUser(row.id)}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <PluginManagementPage
      title="User Management"
      description="Manage user accounts, permissions, and status"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Users' },
      ]}
      loading={loading}
      searchPlaceholder="Search users by email or name..."
      onSearch={(query) => setSearchQuery(query)}
      actions={[
        {
          label: 'Create User',
          onClick: () => setShowCreateForm(true),
          variant: 'primary',
        },
        {
          label: 'Refresh',
          onClick: () => {
            fetchUsers();
            fetchStats();
          },
          variant: 'secondary',
        },
      ]}
      filters={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
      }
    >
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Users" value={stats.totalUsers} status="info" />
          <StatCard label="Active" value={stats.activeUsers} status="healthy" />
          <StatCard label="Invited" value={stats.invitedUsers} status="info" />
          <StatCard label="Suspended" value={stats.suspendedUsers} status={stats.suspendedUsers > 0 ? 'warning' : 'healthy'} />
          <StatCard label="Recent (7d)" value={stats.recentSignups} status="info" />
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable
          columns={userColumns}
          data={users}
          emptyMessage="No users found"
          bulkActions={[
            {
              label: 'Suspend Selected',
              onClick: async (selected) => {
                for (const user of selected) {
                  await handleSuspendUser(user.id);
                }
              },
              variant: 'danger',
            },
          ]}
          selectable
          getRowKey={(row) => row.id}
        />
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                User Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Close
              </button>
            </div>

            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <code>{selectedUser.id}</code>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.email}</dd>
              </div>
              {selectedUser.name && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedUser.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </dd>
              </div>
              {selectedUser.last_login_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {new Date(selectedUser.last_login_at).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </PluginManagementPage>
  );
};

export default UsersManagementPage;
