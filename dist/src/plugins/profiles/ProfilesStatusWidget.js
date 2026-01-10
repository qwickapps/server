import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ProfilesStatusWidget - Dashboard widget for user profiles overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function ProfilesStatusWidget({ apiPrefix = '/api/profiles' }) {
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
    return (_jsx(PluginStatusWidget, { title: "User Profiles", stats: [
            { label: 'Total Profiles', value: stats?.totalProfiles ?? 0 },
            { label: 'Complete', value: stats?.completeProfiles ?? 0 },
            { label: 'Incomplete', value: stats?.incompleteProfiles ?? 0 },
            { label: 'Recent Updates', value: stats?.recentUpdates ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/profiles" }));
}
//# sourceMappingURL=ProfilesStatusWidget.js.map