import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Maintenance Management Page Component
 * Provides operational tools for CMS applications
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { StatCard } from '@qwickapps/react-framework';
import { Card, CardContent, Typography } from '@mui/material';
export const MaintenanceManagementPage = ({ apiPrefix = '/api/plugins/maintenance', }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${apiPrefix}/status`);
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        }
        catch (err) {
            console.error('Failed to fetch maintenance status:', err);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchStatus();
    }, [apiPrefix]);
    return (_jsxs(PluginManagementPage, { title: "Maintenance & Operations", description: "Operational tools for managing your CMS application", breadcrumbs: [
            { label: 'Control Panel', href: '/cpanel' },
            { label: 'Plugins', href: '/cpanel/plugins' },
            { label: 'Maintenance' },
        ], loading: loading, children: [status && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Seed Management", value: status.features.seeds ? 'Enabled' : 'Disabled', status: status.features.seeds ? 'healthy' : 'info' }), _jsx(StatCard, { label: "Service Control", value: status.features.serviceControl ? 'Enabled' : 'Disabled', status: status.features.serviceControl ? 'healthy' : 'info' }), _jsx(StatCard, { label: "Environment Variables", value: status.features.envManagement ? 'Enabled' : 'Disabled', status: status.features.envManagement ? 'healthy' : 'info' }), _jsx(StatCard, { label: "Database Operations", value: status.features.databaseOps ? 'Enabled' : 'Disabled', status: status.features.databaseOps ? 'healthy' : 'info' })] })), _jsxs("div", { className: "space-y-6", children: [status?.features.seeds && (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Seed Management" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Manage database seed scripts" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Seed management UI will be implemented in issue #702" })] }) })), status?.features.serviceControl && (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Service Control" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Start, stop, and restart services" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Service control UI will be implemented in issue #703" })] }) })), status?.features.envManagement && (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Environment Variables" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View and manage environment configuration" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Environment variable management UI will be implemented in issue #704" })] }) })), status?.features.databaseOps && (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Database Operations" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Backup and restore database operations" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Database operations UI will be implemented in issue #705" })] }) }))] }), status && (_jsx("div", { className: "mt-6", children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", children: "Configuration" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Current maintenance plugin configuration" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Scripts Path:" }), _jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: status.config.scriptsPath })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Environment File:" }), _jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: status.config.envFilePath })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Backups Path:" }), _jsx("code", { className: "text-sm text-gray-900 dark:text-gray-100", children: status.config.backupsPath })] })] })] }) }) }))] }));
};
export default MaintenanceManagementPage;
//# sourceMappingURL=MaintenanceManagementPage.js.map