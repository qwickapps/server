import { jsx as _jsx } from "react/jsx-runtime";
/**
 * BansStatusWidget - Dashboard widget for user bans overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function BansStatusWidget({ apiPrefix = '/api/bans' }) {
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
    return (_jsx(PluginStatusWidget, { title: "User Bans", stats: [
            { label: 'Total Bans', value: stats?.totalBans ?? 0 },
            { label: 'Active', value: stats?.activeBans ?? 0 },
            { label: 'Permanent', value: stats?.permanentBans ?? 0 },
            { label: 'Recent Bans', value: stats?.recentBans ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/bans" }));
}
//# sourceMappingURL=BansStatusWidget.js.map