import { jsx as _jsx } from "react/jsx-runtime";
/**
 * EntitlementsManagementPage - Full management interface for entitlements
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function EntitlementsManagementPage({ apiPrefix = '/api/entitlements' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [entitlements, setEntitlements] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setEntitlements(data.entitlements || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'userEmail', label: 'User', sortable: true },
        { key: 'featureName', label: 'Feature', sortable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : val === 'expired'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'}`, children: String(val) })),
        },
        { key: 'grantedAt', label: 'Granted', sortable: true },
        { key: 'expiresAt', label: 'Expires', sortable: true },
        { key: 'grantedBy', label: 'Granted By' },
    ];
    const tabs = [
        { id: 'all', label: 'All Entitlements' },
        { id: 'active', label: 'Active' },
        { id: 'expired', label: 'Expired' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Entitlements Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Feature definitions and entitlement rules configuration." }) }) })) : (_jsx(DataTable, { columns: columns, data: entitlements, loading: loading, emptyMessage: "No entitlements found", bulkActions: [
                {
                    label: 'Grant Entitlement',
                    onClick: (rows) => console.log('Grant to:', rows),
                    variant: 'primary',
                },
                {
                    label: 'Revoke Selected',
                    onClick: (rows) => console.log('Revoke:', rows),
                    variant: 'danger',
                },
            ] })) }));
}
//# sourceMappingURL=EntitlementsManagementPage.js.map