import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Notifications Management Page Component
 * Full notifications management with filtering and status tracking
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const NotificationsManagementPage = ({ apiPrefix = '/api/notifications', }) => {
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const fetchNotifications = async () => {
        try {
            const response = await fetch(`${apiPrefix}/list`);
            if (!response.ok)
                throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };
    const fetchStats = async () => {
        try {
            const response = await fetch(`${apiPrefix}/stats`);
            if (!response.ok)
                throw new Error('Failed to fetch stats');
            const data = await response.json();
            setStats(data);
        }
        catch (error) {
            console.error('Error fetching stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchNotifications();
        fetchStats();
    }, [apiPrefix]);
    const columns = [
        { key: 'title', label: 'Title' },
        { key: 'type', label: 'Type' },
        { key: 'status', label: 'Status' },
        { key: 'created_at', label: 'Created' },
    ];
    const filteredNotifications = statusFilter
        ? notifications.filter((n) => n.status === statusFilter)
        : notifications;
    return (_jsxs(PluginManagementPage, { title: "Notifications Management", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Notifications", value: stats?.totalNotifications ?? 0 }), _jsx(StatCard, { label: "Pending", value: stats?.pendingNotifications ?? 0, status: "warning" }), _jsx(StatCard, { label: "Sent Today", value: stats?.sentToday ?? 0, status: "healthy" }), _jsx(StatCard, { label: "Failed Today", value: stats?.failedToday ?? 0, status: "error" })] }), _jsx("div", { className: "mb-4", children: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-4 py-2 border rounded", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "sent", children: "Sent" }), _jsx("option", { value: "failed", children: "Failed" })] }) }), _jsx(DataTable, { columns: columns, data: filteredNotifications, loading: loading })] }));
};
export default NotificationsManagementPage;
//# sourceMappingURL=NotificationsManagementPage.js.map