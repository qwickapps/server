import { jsx as _jsx } from "react/jsx-runtime";
/**
 * DevicesManagementPage - Full management interface for devices
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function DevicesManagementPage({ apiPrefix = '/api/devices' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setDevices(data.devices || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        { key: 'deviceName', label: 'Device Name', sortable: true },
        { key: 'userEmail', label: 'User', sortable: true },
        {
            key: 'deviceType',
            label: 'Type',
            sortable: true,
            render: (val) => (_jsx("span", { className: "px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100", children: String(val).toUpperCase() })),
        },
        { key: 'platform', label: 'Platform', sortable: true },
        {
            key: 'status',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : val === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`, children: String(val) })),
        },
        { key: 'registeredAt', label: 'Registered', sortable: true },
        { key: 'lastActiveAt', label: 'Last Active', sortable: true },
    ];
    const tabs = [
        { id: 'all', label: 'All Devices' },
        { id: 'active', label: 'Active' },
        { id: 'pending', label: 'Pending' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Devices Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Device registration policies and approval settings." }) }) })) : (_jsx(DataTable, { columns: columns, data: devices, loading: loading, emptyMessage: "No devices found", bulkActions: [
                {
                    label: 'Approve Selected',
                    onClick: (rows) => console.log('Approve devices:', rows),
                    variant: 'primary',
                },
                {
                    label: 'Deactivate Selected',
                    onClick: (rows) => console.log('Deactivate devices:', rows),
                    variant: 'danger',
                },
            ] })) }));
}
//# sourceMappingURL=DevicesManagementPage.js.map