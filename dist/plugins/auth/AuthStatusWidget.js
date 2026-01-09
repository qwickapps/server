import { jsx as _jsx } from "react/jsx-runtime";
/**
 * AuthStatusWidget - Dashboard widget for authentication overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function AuthStatusWidget({ apiPrefix = '/api/auth' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Authentication", stats: [
            { label: 'Total Providers', value: stats?.totalProviders ?? 0 },
            { label: 'Active Providers', value: stats?.activeProviders ?? 0 },
            { label: 'Active Sessions', value: stats?.activeSessions ?? 0 },
            { label: 'Recent Logins', value: stats?.recentLogins ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/auth" }));
}
//# sourceMappingURL=AuthStatusWidget.js.map