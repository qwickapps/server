import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Diagnostics Management Page Component
 * Full system diagnostics dashboard with logs, environment, and system info
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { StatCard } from '@qwickapps/react-framework';
export const DiagnosticsManagementPage = ({ apiPrefix = '/api/plugins/diagnostics', }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('system');
    const fetchDiagnostics = async () => {
        try {
            const response = await fetch(`${apiPrefix}/full`);
            if (response.ok) {
                const data = await response.json();
                setReport(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch diagnostics:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchDiagnostics();
    }, [apiPrefix]);
    const formatUptime = (seconds) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };
    if (!report) {
        return (_jsx(PluginManagementPage, { title: "System Diagnostics", description: "View detailed system information and logs", breadcrumbs: [
                { label: 'Control Panel', href: '/cpanel' },
                { label: 'Plugins', href: '/cpanel/plugins' },
                { label: 'Diagnostics' },
            ], loading: loading, children: _jsx("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12", children: "No diagnostics data available" }) }));
    }
    return (_jsxs(PluginManagementPage, { title: "System Diagnostics", description: "View detailed system information, environment configuration, and logs", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Diagnostics' },
        ], loading: loading, actions: [
            {
                label: 'Refresh',
                onClick: fetchDiagnostics,
                variant: 'secondary',
            },
            {
                label: 'Download Report',
                onClick: () => {
                    const blob = new Blob([JSON.stringify(report, null, 2)], {
                        type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `diagnostics-${new Date().toISOString()}.json`;
                    a.click();
                },
                variant: 'secondary',
            },
        ], children: [_jsx("div", { className: "border-b border-gray-200 dark:border-gray-700 mb-6", children: _jsx("nav", { className: "-mb-px flex space-x-8", children: ['system', 'environment', 'logs'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`, children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }) }), activeTab === 'system' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(StatCard, { label: "Node Version", value: report.system.nodeVersion, status: "info" }), _jsx(StatCard, { label: "Platform", value: `${report.system.platform} ${report.system.arch}`, status: "info" }), _jsx(StatCard, { label: "Uptime", value: formatUptime(report.system.uptime), status: "healthy" }), _jsx(StatCard, { label: "Process ID", value: report.system.pid, status: "info" })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Memory Usage" }), _jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Resident Set Size" }), _jsx("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: report.system.memory.rss })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Heap Total" }), _jsx("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: report.system.memory.heapTotal })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Heap Used" }), _jsx("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: report.system.memory.heapUsed })] }), _jsxs("div", { children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "External" }), _jsx("dd", { className: "mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100", children: report.system.memory.external })] })] })] }), _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "System Information" }), _jsxs("dl", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Working Directory" }), _jsx("dd", { className: "text-sm text-gray-900 dark:text-gray-100", children: _jsx("code", { className: "bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded", children: report.system.cwd }) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Report Generated" }), _jsx("dd", { className: "text-sm text-gray-900 dark:text-gray-100", children: new Date(report.timestamp).toLocaleString() })] })] })] })] })), activeTab === 'environment' && (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Environment Variables" }), _jsx("div", { className: "space-y-2", children: Object.entries(report.envCheck).map(([key, value]) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700", children: [_jsx("code", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: key }), _jsx("span", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${value
                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`, children: value ? 'Configured' : 'Missing' })] }, key))) })] })), activeTab === 'logs' && report.logs && (_jsxs("div", { className: "space-y-6", children: [report.logs.startup && (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Startup Logs" }), _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto max-h-96 overflow-y-auto", children: _jsx("code", { className: "text-xs text-gray-900 dark:text-gray-100", children: report.logs.startup.join('\n') }) })] })), report.logs.app && (_jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100", children: "Application Logs" }), _jsx("pre", { className: "p-4 bg-gray-100 dark:bg-gray-900 rounded overflow-x-auto max-h-96 overflow-y-auto", children: _jsx("code", { className: "text-xs text-gray-900 dark:text-gray-100", children: report.logs.app.join('\n') }) })] })), !report.logs.startup && !report.logs.app && (_jsx("div", { className: "text-center text-gray-500 dark:text-gray-400 py-12", children: "No logs available" }))] }))] }));
};
export default DiagnosticsManagementPage;
//# sourceMappingURL=DiagnosticsManagementPage.js.map