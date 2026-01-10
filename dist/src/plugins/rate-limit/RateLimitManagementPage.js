import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Rate Limit Management Page Component
 * Manage rate limiting rules and monitor request patterns
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const RateLimitManagementPage = ({ apiPrefix = '/api/rate-limit', }) => {
    const [rules, setRules] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const fetchRules = async () => {
        try {
            const response = await fetch(`${apiPrefix}/rules`);
            if (!response.ok)
                throw new Error('Failed to fetch rules');
            const data = await response.json();
            setRules(data);
        }
        catch (error) {
            console.error('Error fetching rules:', error);
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
        fetchRules();
        fetchStats();
    }, [apiPrefix]);
    const columns = [
        { key: 'name', label: 'Rule Name' },
        { key: 'endpoint', label: 'Endpoint' },
        { key: 'limit', label: 'Limit' },
        { key: 'window', label: 'Window' },
        { key: 'status', label: 'Status' },
    ];
    const filteredRules = statusFilter
        ? rules.filter((r) => r.status === statusFilter)
        : rules;
    return (_jsxs(PluginManagementPage, { title: "Rate Limiting Management", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Requests", value: stats?.totalRequests ?? 0 }), _jsx(StatCard, { label: "Blocked Requests", value: stats?.blockedRequests ?? 0, status: "warning" }), _jsx(StatCard, { label: "Active Rules", value: stats?.activeRules ?? 0, status: "healthy" }), _jsx(StatCard, { label: "Requests Today", value: stats?.requestsToday ?? 0, status: "info" })] }), _jsx("div", { className: "mb-4", children: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-4 py-2 border rounded", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "inactive", children: "Inactive" })] }) }), _jsx(DataTable, { columns: columns, data: filteredRules, loading: loading })] }));
};
export default RateLimitManagementPage;
//# sourceMappingURL=RateLimitManagementPage.js.map