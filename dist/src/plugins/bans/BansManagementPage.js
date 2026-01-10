import { jsx as _jsx } from "react/jsx-runtime";
/**
 * BansManagementPage - Full management interface for user bans
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function BansManagementPage({ apiPrefix = '/api/bans' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [bans, setBans] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setBans(data.bans || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'userEmail', label: 'User', sortable: true },
        { key: 'reason', label: 'Reason', sortable: true },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'permanent'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'}`, children: String(val) })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                    : val === 'expired'
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'}`, children: String(val) })),
        },
        { key: 'createdAt', label: 'Created', sortable: true },
        { key: 'expiresAt', label: 'Expires', sortable: true },
        { key: 'createdBy', label: 'Created By' },
    ];
    const handleLiftBans = (selectedBans) => {
        console.log('Lift bans:', selectedBans);
    };
    const tabs = [
        { id: 'all', label: 'All Bans' },
        { id: 'active', label: 'Active' },
        { id: 'expired', label: 'Expired' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Bans Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Ban policies and automatic ban rules configuration." }) }) })) : (_jsx(DataTable, { columns: columns, data: bans, loading: loading, emptyMessage: "No bans found", bulkActions: [
                {
                    label: 'Lift Selected',
                    onClick: handleLiftBans,
                    variant: 'primary',
                },
            ] })) }));
}
//# sourceMappingURL=BansManagementPage.js.map