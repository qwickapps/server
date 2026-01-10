import { jsx as _jsx } from "react/jsx-runtime";
/**
 * SubscriptionsManagementPage - Full management interface for subscriptions
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function SubscriptionsManagementPage({ apiPrefix = '/api/subscriptions' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const filter = activeTab === 'all' ? undefined : activeTab;
        const url = filter ? `${apiPrefix}?filter=${filter}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setSubscriptions(data.subscriptions || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'userEmail', label: 'User', sortable: true },
        { key: 'planName', label: 'Plan', sortable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : val === 'trial'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                        : val === 'cancelled'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`, children: String(val) })),
        },
        {
            key: 'autoRenew',
            label: 'Auto-Renew',
            render: (val) => (_jsx("span", { className: "text-sm", children: val ? '✓' : '✗' })),
        },
        {
            key: 'amount',
            label: 'Amount',
            sortable: true,
            render: (val) => (val ? `$${Number(val).toFixed(2)}` : '-'),
        },
        { key: 'startDate', label: 'Start Date', sortable: true },
        { key: 'endDate', label: 'End Date', sortable: true },
    ];
    const tabs = [
        { id: 'all', label: 'All Subscriptions' },
        { id: 'active', label: 'Active' },
        { id: 'expiring', label: 'Expiring Soon' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Subscriptions Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Subscription plans and billing configuration." }) }) })) : (_jsx(DataTable, { columns: columns, data: subscriptions, loading: loading, emptyMessage: "No subscriptions found", bulkActions: [
                {
                    label: 'Cancel Selected',
                    onClick: (rows) => console.log('Cancel subscriptions:', rows),
                    variant: 'danger',
                },
            ] })) }));
}
//# sourceMappingURL=SubscriptionsManagementPage.js.map