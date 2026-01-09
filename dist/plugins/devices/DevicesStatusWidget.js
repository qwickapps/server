import { jsx as _jsx } from "react/jsx-runtime";
/**
 * DevicesStatusWidget - Dashboard widget for device management overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function DevicesStatusWidget({ apiPrefix = '/api/devices' }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch(`${apiPrefix}/stats`)
            .then((res) => res.json())
            .then((data) => {
            setStats(data);
            setLoading(false);
        })
            .catch((err) => {
            setError(err.message);
            setLoading(false);
        });
    }, [apiPrefix]);
    return (_jsx(PluginStatusWidget, { title: "Devices", stats: [
            { label: 'Total Devices', value: stats?.totalDevices ?? 0 },
            { label: 'Active', value: stats?.activeDevices ?? 0 },
            { label: 'Registered Today', value: stats?.registeredToday ?? 0 },
            { label: 'Pending Approval', value: stats?.pendingApproval ?? 0 },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/devices" }));
}
//# sourceMappingURL=DevicesStatusWidget.js.map