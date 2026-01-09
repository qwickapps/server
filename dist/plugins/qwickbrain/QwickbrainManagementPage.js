import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * QwickBrain Management Page Component
 * Manage AI documents, repositories, and query analytics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable, StatCard } from '@qwickapps/react-framework';
export const QwickbrainManagementPage = ({ apiPrefix = '/api/qwickbrain', }) => {
    const [repositories, setRepositories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const fetchRepositories = async () => {
        try {
            const response = await fetch(`${apiPrefix}/repositories`);
            if (!response.ok)
                throw new Error('Failed to fetch repositories');
            const data = await response.json();
            setRepositories(data);
        }
        catch (error) {
            console.error('Error fetching repositories:', error);
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
        fetchRepositories();
        fetchStats();
    }, [apiPrefix]);
    const columns = [
        { key: 'name', label: 'Repository' },
        { key: 'owner', label: 'Owner' },
        { key: 'status', label: 'Status' },
        { key: 'document_count', label: 'Documents' },
    ];
    const filteredRepositories = statusFilter
        ? repositories.filter((r) => r.status === statusFilter)
        : repositories;
    return (_jsxs(PluginManagementPage, { title: "QwickBrain AI Management", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Documents", value: stats?.totalDocuments ?? 0 }), _jsx(StatCard, { label: "Indexed Repos", value: stats?.indexedRepositories ?? 0, status: "healthy" }), _jsx(StatCard, { label: "Queries Today", value: stats?.queriesToday ?? 0, status: "info" }), _jsx(StatCard, { label: "Cache Hit Rate", value: stats?.cacheHitRate ? `${stats.cacheHitRate}%` : '0%', status: "healthy" })] }), _jsx("div", { className: "mb-4", children: _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "px-4 py-2 border rounded", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "indexed", children: "Indexed" }), _jsx("option", { value: "indexing", children: "Indexing" }), _jsx("option", { value: "failed", children: "Failed" })] }) }), _jsx(DataTable, { columns: columns, data: filteredRepositories, loading: loading })] }));
};
export default QwickbrainManagementPage;
//# sourceMappingURL=QwickbrainManagementPage.js.map