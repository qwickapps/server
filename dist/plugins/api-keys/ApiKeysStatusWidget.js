import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ApiKeysStatusWidget - Dashboard widget for API keys overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function ApiKeysStatusWidget({ apiPrefix = '/api/api-keys' }) {
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
    return (_jsx(PluginStatusWidget, { title: "API Keys", stats: [
            { label: 'Total Keys', value: stats?.totalKeys ?? 0 },
            { label: 'Active', value: stats?.activeKeys ?? 0 },
            { label: 'Expired', value: stats?.expiredKeys ?? 0 },
            { label: 'Recently Used', value: stats?.recentlyUsed ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/api-keys" }));
}
//# sourceMappingURL=ApiKeysStatusWidget.js.map