import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ProfilesManagementPage - Full management interface for user profiles
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function ProfilesManagementPage({ apiPrefix = '/api/profiles' }) {
    const [activeTab, setActiveTab] = useState('all');
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        const url = status ? `${apiPrefix}?status=${status}` : `${apiPrefix}`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
            setProfiles(data.profiles || []);
            setLoading(false);
        })
            .catch(() => setLoading(false));
    }, [activeTab, apiPrefix]);
    const columns = [
        {
            key: 'avatarUrl',
            label: '',
            width: '60px',
            render: (val) => val ? (_jsx("img", { src: String(val), alt: "Avatar", className: "w-8 h-8 rounded-full" })) : (_jsx("div", { className: "w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600" })),
        },
        { key: 'displayName', label: 'Name', sortable: true },
        { key: 'userEmail', label: 'Email', sortable: true },
        {
            key: 'completionStatus',
            label: 'Status',
            sortable: true,
            render: (val) => (_jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${val === 'complete'
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100'
                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100'}`, children: String(val) })),
        },
        { key: 'updatedAt', label: 'Last Updated', sortable: true },
        { key: 'createdAt', label: 'Created', sortable: true },
    ];
    const tabs = [
        { id: 'all', label: 'All Profiles' },
        { id: 'complete', label: 'Complete' },
        { id: 'incomplete', label: 'Incomplete' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsx(PluginManagementPage, { title: "Profiles Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: activeTab === 'config' ? (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Profile schema and required fields configuration." }) }) })) : (_jsx(DataTable, { columns: columns, data: profiles, loading: loading, emptyMessage: "No profiles found" })) }));
}
//# sourceMappingURL=ProfilesManagementPage.js.map