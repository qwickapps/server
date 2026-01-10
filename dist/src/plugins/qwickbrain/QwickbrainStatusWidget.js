import { jsx as _jsx } from "react/jsx-runtime";
/**
 * QwickbrainStatusWidget - Dashboard widget for QwickBrain AI overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function QwickbrainStatusWidget({ apiPrefix = '/api/qwickbrain' }) {
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
    return (_jsx(PluginStatusWidget, { title: "QwickBrain AI", stats: [
            { label: 'Documents', value: stats?.totalDocuments ?? 0 },
            { label: 'Repositories', value: stats?.indexedRepositories ?? 0 },
            { label: 'Queries Today', value: stats?.queriesToday ?? 0 },
            { label: 'Cache Hit Rate', value: stats?.cacheHitRate ? `${stats.cacheHitRate}%` : '0%' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/qwickbrain" }));
}
//# sourceMappingURL=QwickbrainStatusWidget.js.map