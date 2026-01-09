import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ParentalStatusWidget - Dashboard widget for parental controls overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function ParentalStatusWidget({ apiPrefix = '/api/parental' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Parental Controls", stats: [
            { label: 'Total Controls', value: stats?.totalControls ?? 0 },
            { label: 'Active', value: stats?.activeControls ?? 0 },
            { label: 'Protected Accounts', value: stats?.protectedAccounts ?? 0 },
            { label: 'Recent Violations', value: stats?.recentViolations ?? 0, suffix: '/7d' },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/parental" }));
}
//# sourceMappingURL=ParentalStatusWidget.js.map