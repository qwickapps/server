import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Maintenance Status Widget Component
 * Displays system operational status and available features
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget, } from '@qwickapps/server/ui';
export const MaintenanceStatusWidget = ({ apiPrefix = '/api/plugins/maintenance', }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch(`${apiPrefix}/status`);
                if (!response.ok)
                    throw new Error('Failed to fetch maintenance status');
                const data = await response.json();
                setStatus(data);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            }
            finally {
                setLoading(false);
            }
        };
        fetchStatus();
        const interval = setInterval(fetchStatus, 60000); // Refresh every 60s
        return () => clearInterval(interval);
    }, [apiPrefix]);
    if (loading) {
        return (_jsx(PluginStatusWidget, { title: "Maintenance & Operations", status: "healthy", loading: true }));
    }
    if (error || !status) {
        return (_jsx(PluginStatusWidget, { title: "Maintenance & Operations", status: "error", message: error || 'Failed to load maintenance status' }));
    }
    const enabledFeatures = Object.entries(status.features).filter(([_, enabled]) => enabled);
    const featureCount = enabledFeatures.length;
    const widgetStats = [
        {
            label: 'Features Enabled',
            value: featureCount,
            status: 'info',
        },
        {
            label: 'Seed Management',
            value: status.features.seeds ? 'ON' : 'OFF',
            status: status.features.seeds ? 'healthy' : 'info',
        },
        {
            label: 'Service Control',
            value: status.features.serviceControl ? 'ON' : 'OFF',
            status: status.features.serviceControl ? 'healthy' : 'info',
        },
        {
            label: 'Database Ops',
            value: status.features.databaseOps ? 'ON' : 'OFF',
            status: status.features.databaseOps ? 'healthy' : 'info',
        },
    ];
    return (_jsx(PluginStatusWidget, { title: "Maintenance & Operations", status: status.status === 'ok' ? 'healthy' : 'error', stats: widgetStats, message: `${featureCount} of 4 features enabled`, actions: [
            {
                label: 'Manage',
                onClick: () => {
                    window.location.href = '/cpanel/plugins/maintenance';
                },
                variant: 'secondary',
            },
        ] }));
};
export default MaintenanceStatusWidget;
//# sourceMappingURL=MaintenanceStatusWidget.js.map