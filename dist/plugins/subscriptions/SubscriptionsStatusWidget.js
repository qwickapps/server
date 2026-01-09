import { jsx as _jsx } from "react/jsx-runtime";
/**
 * SubscriptionsStatusWidget - Dashboard widget for subscriptions overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function SubscriptionsStatusWidget({ apiPrefix = '/api/subscriptions' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Subscriptions", stats: [
            { label: 'Total Subs', value: stats?.totalSubscriptions ?? 0 },
            { label: 'Active', value: stats?.activeSubscriptions ?? 0 },
            { label: 'Expiring Soon', value: stats?.expiringSoon ?? 0 },
            { label: 'Cancelled Today', value: stats?.cancelledToday ?? 0 },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/subscriptions" }));
}
//# sourceMappingURL=SubscriptionsStatusWidget.js.map