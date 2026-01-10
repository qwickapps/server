import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PreferencesStatusWidget - Dashboard widget for user preferences overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function PreferencesStatusWidget({ apiPrefix = '/api/preferences' }) {
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
    return (_jsx(PluginStatusWidget, { title: "User Preferences", stats: [
            { label: 'Preference Sets', value: stats?.preferenceSets ?? 0 },
            { label: 'Active Users', value: stats?.activeUsers ?? 0 },
            { label: 'Total Prefs', value: stats?.totalPreferences ?? 0 },
            { label: 'Recent Updates', value: stats?.recentUpdates ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/preferences" }));
}
//# sourceMappingURL=PreferencesStatusWidget.js.map