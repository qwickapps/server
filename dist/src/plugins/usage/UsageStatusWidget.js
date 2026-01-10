import { jsx as _jsx } from "react/jsx-runtime";
/**
 * UsageStatusWidget - Dashboard widget for usage tracking overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function UsageStatusWidget({ apiPrefix = '/api/usage' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Usage Tracking", stats: [
            { label: 'Total Events', value: stats?.totalEvents ?? 0 },
            { label: 'Active Users', value: stats?.activeUsers ?? 0 },
            { label: 'Events Today', value: stats?.eventsToday ?? 0 },
            { label: 'Top Feature', value: stats?.topFeature ?? 'N/A' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/usage" }));
}
//# sourceMappingURL=UsageStatusWidget.js.map