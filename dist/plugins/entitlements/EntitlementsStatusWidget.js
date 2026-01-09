import { jsx as _jsx } from "react/jsx-runtime";
/**
 * EntitlementsStatusWidget - Dashboard widget for entitlements overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function EntitlementsStatusWidget({ apiPrefix = '/api/entitlements' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Entitlements", stats: [
            { label: 'Total Entitlements', value: stats?.totalEntitlements ?? 0 },
            { label: 'Active', value: stats?.activeEntitlements ?? 0 },
            { label: 'Expired', value: stats?.expiredEntitlements ?? 0 },
            { label: 'Recent Grants', value: stats?.recentGrants ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/entitlements" }));
}
//# sourceMappingURL=EntitlementsStatusWidget.js.map