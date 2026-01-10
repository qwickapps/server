import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Users Management Page Component
 * Full user management with CRUD operations, search, and filtering
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const UsersManagementPage = ({ apiPrefix = '/api/users', }) => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({
                limit: '100',
            });
            if (searchQuery)
                params.append('q', searchQuery);
            if (statusFilter)
                params.append('status', statusFilter);
            const response = await fetch(`${apiPrefix}?${params}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            }
        }
        catch (err) {
            console.error('Failed to fetch users:', err);
        }
        finally {
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
        }
        catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };
    const handleDeleteUser = async (userId) => {
        if (!confirm('Delete this user? This action cannot be undone.'))
            return;
        try {
            const response = await fetch(`${apiPrefix}/${userId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchUsers();
                await fetchStats();
            }
        }
        catch (err) {
            console.error('Failed to delete user:', err);
        }
    };
    const handleSuspendUser = async (userId) => {
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
        }
        catch (err) {
            console.error('Failed to suspend user:', err);
        }
    };
    const handleActivateUser = async (userId) => {
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
        }
        catch (err) {
            console.error('Failed to activate user:', err);
        }
    };
    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, [searchQuery, statusFilter]);
    const getStatusColor = (status) => {
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
    const userColumns = [
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            render: (_value, row) => (_jsxs("div", { className: "flex items-center", children: [row.picture && (_jsx("img", { src: row.picture, alt: row.name || row.email, className: "w-8 h-8 rounded-full mr-2" })), _jsxs("div", { children: [_jsx("button", { onClick: () => setSelectedUser(row), className: "text-blue-600 dark:text-blue-400 hover:underline font-medium", children: row.email }), row.name && (_jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: row.name }))] })] })),
        },
        {
            key: 'provider',
            label: 'Provider',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: "text-sm text-gray-600 dark:text-gray-400", children: row.provider || '-' })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (_value, row) => (_jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(row.status)}`, children: row.status })),
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
                if (!row.last_login_at)
                    return _jsx("span", { className: "text-gray-400", children: "Never" });
                const date = new Date(row.last_login_at);
                const now = new Date();
                const diff = now.getTime() - date.getTime();
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                if (days === 0)
                    return 'Today';
                if (days === 1)
                    return 'Yesterday';
                if (days < 7)
                    return `${days}d ago`;
                return date.toLocaleDateString();
            },
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (_value, row) => (_jsxs("div", { className: "flex gap-2", children: [row.status === 'active' && (_jsx("button", { onClick: () => handleSuspendUser(row.id), className: "text-sm text-yellow-600 dark:text-yellow-400 hover:underline", children: "Suspend" })), row.status === 'suspended' && (_jsx("button", { onClick: () => handleActivateUser(row.id), className: "text-sm text-green-600 dark:text-green-400 hover:underline", children: "Activate" })), _jsx("button", { onClick: () => handleDeleteUser(row.id), className: "text-sm text-red-600 dark:text-red-400 hover:underline", children: "Delete" })] })),
        },
    ];
    return (_jsxs(PluginManagementPage, { title: "User Management", description: "Manage user accounts, permissions, and status", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Users' },
        ], loading: loading, searchPlaceholder: "Search users by email or name...", onSearch: (query) => setSearchQuery(query), actions: [
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
        ], filters: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "invited", children: "Invited" }), _jsx("option", { value: "suspended", children: "Suspended" })] }), children: [stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Users", value: stats.totalUsers, status: "info" }), _jsx(StatCard, { label: "Active", value: stats.activeUsers, status: "healthy" }), _jsx(StatCard, { label: "Invited", value: stats.invitedUsers, status: "info" }), _jsx(StatCard, { label: "Suspended", value: stats.suspendedUsers, status: stats.suspendedUsers > 0 ? 'warning' : 'healthy' }), _jsx(StatCard, { label: "Recent (7d)", value: stats.recentSignups, status: "info" })] })), _jsx("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: _jsx(DataTable, { columns: userColumns, data: users, emptyMessage: "No users found", bulkActions: [
                        {
                            label: 'Suspend Selected',
                            onClick: async (selected) => {
                                for (const user of selected) {
                                    await handleSuspendUser(user.id);
                                }
                            },
                            variant: 'danger',
                        },
                    ], selectable: true, getRowKey: (row) => row.id }) }), selectedUser && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: "User Details" }), _jsx("button", { onClick: () => setSelectedUser(null), className: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200", children: "Close" })] }), _jsxs("dl", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "ID" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: _jsx("code", { children: selectedUser.id }) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Email" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: selectedUser.email })] }), selectedUser.name && (_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: selectedUser.name })] })), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Status" }), _jsx("dd", { className: "mt-1", children: _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedUser.status)}`, children: selectedUser.status }) })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Created" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(selectedUser.created_at).toLocaleString() })] }), selectedUser.last_login_at && (_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Last Login" }), _jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(selectedUser.last_login_at).toLocaleString() })] }))] })] }) }))] }));
};
export default UsersManagementPage;
//# sourceMappingURL=UsersManagementPage.js.map