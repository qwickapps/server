import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PreferencesManagementPage - Full management interface for user preferences
 */
import { useState, useEffect } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { DataTable } from '@qwickapps/react-framework';
export function PreferencesManagementPage({ apiPrefix = '/api/preferences' }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [preferenceSets, setPreferenceSets] = useState([]);
    const [preferences, setPreferences] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (activeTab === 'overview') {
            fetch(`${apiPrefix}/sets`)
                .then((res) => res.json())
                .then((data) => {
                setPreferenceSets(data.sets || []);
                setLoading(false);
            })
                .catch(() => setLoading(false));
        }
        else if (activeTab === 'user' || activeTab === 'global') {
            fetch(`${apiPrefix}?scope=${activeTab}`)
                .then((res) => res.json())
                .then((data) => {
                setPreferences(data.preferences || []);
                setLoading(false);
            })
                .catch(() => setLoading(false));
        }
    }, [activeTab, apiPrefix]);
    const setColumns = [
        { key: 'userEmail', label: 'User', sortable: true },
        {
            key: 'scope',
            label: 'Scope',
            sortable: true,
            render: (val) => (_jsx("span", { className: "px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100", children: String(val).toUpperCase() })),
        },
        { key: 'preferenceCount', label: 'Count', sortable: true },
        { key: 'updatedAt', label: 'Updated', sortable: true },
    ];
    const prefColumns = [
        { key: 'key', label: 'Key', sortable: true },
        {
            key: 'value',
            label: 'Value',
            render: (val) => (_jsx("code", { className: "text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded", children: typeof val === 'object' ? JSON.stringify(val) : String(val) })),
        },
        {
            key: 'type',
            label: 'Type',
            sortable: true,
            render: (val) => (_jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: String(val) })),
        },
        { key: 'updatedAt', label: 'Updated', sortable: true },
    ];
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'user', label: 'User Preferences' },
        { id: 'global', label: 'Global Preferences' },
        { id: 'config', label: 'Configuration' },
    ];
    return (_jsxs(PluginManagementPage, { title: "Preferences Management", tabs: tabs, activeTab: activeTab, onTabChange: (tab) => setActiveTab(tab), children: [activeTab === 'overview' && (_jsx(DataTable, { columns: setColumns, data: preferenceSets, loading: loading, emptyMessage: "No preference sets found" })), (activeTab === 'user' || activeTab === 'global') && (_jsx(DataTable, { columns: prefColumns, data: preferences, loading: loading, emptyMessage: `No ${activeTab} preferences found` })), activeTab === 'config' && (_jsx("div", { className: "space-y-4", children: _jsx("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: _jsx("p", { className: "text-sm text-blue-900 dark:text-blue-100", children: "Preference schema and validation rules configuration." }) }) }))] }));
}
//# sourceMappingURL=PreferencesManagementPage.js.map