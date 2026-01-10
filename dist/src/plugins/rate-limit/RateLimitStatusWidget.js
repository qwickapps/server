import { jsx as _jsx } from "react/jsx-runtime";
/**
 * RateLimitStatusWidget - Dashboard widget for rate limiting overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function RateLimitStatusWidget({ apiPrefix = '/api/rate-limit' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Rate Limiting", stats: [
            { label: 'Total Requests', value: stats?.totalRequests ?? 0 },
            { label: 'Blocked', value: stats?.blockedRequests ?? 0 },
            { label: 'Active Rules', value: stats?.activeRules ?? 0 },
            { label: 'Requests Today', value: stats?.requestsToday ?? 0 },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/rate-limit" }));
}
//# sourceMappingURL=RateLimitStatusWidget.js.map