import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
/**
 * ParentalManagementPage - Full management interface for parental controls
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function ParentalManagementPage({ apiPrefix = '/api/parental' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [controls, setControls] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setControls(data.controls || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'childEmail', label: 'Child Account', sortable: true },
        { key: 'parentEmail', label: 'Parent Account', sortable: true },
        {
            key: 'restrictions',
            label: 'Restrictions',
            render: (val) => (_jsxs("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: [Array.isArray(val) ? val.length : 0, " active"] })),
        },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`, children: String(val) })),
        },
        { key: 'createdAt', label: 'Created', sortable: true },
        { key: 'updatedAt', label: 'Updated', sortable: true },
    ];
    const tabs = [
        { id: 'all', label: 'All Controls' },
        { id: 'active', label: 'Active' },
        { id: 'violations', label: 'Violations' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Parental Controls Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Default restrictions and violation policies configuration." }) }) })) : activeTab === 'violations' ? (_jsx("div", { className: "p-8 text-center text-gray-500 dark:text-gray-400", children: "Violations log and alerts" })) : (_jsx(DataTable, { columns: columns, data: controls, loading: loading, emptyMessage: "No parental controls found", bulkActions: [
                {
                    label: 'Suspend Selected',
                    onClick: (rows) => console.log('Suspend:', rows),
                    variant: 'danger',
                },
            ] })) }));
}
//# sourceMappingURL=ParentalManagementPage.js.map