import { jsx as _jsx } from "react/jsx-runtime";
/**
 * NotificationsStatusWidget - Dashboard widget for notifications overview
 */
import { useEffect, useState } from 'react';
import { PluginStatusWidget } from '@qwickapps/server/ui';
export function NotificationsStatusWidget({ apiPrefix = '/api/notifications' }) {
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
    return (_jsx(PluginStatusWidget, { title: "Notifications", stats: [
            { label: 'Total', value: stats?.totalNotifications ?? 0 },
            { label: 'Pending', value: stats?.pendingNotifications ?? 0 },
            { label: 'Sent Today', value: stats?.sentToday ?? 0 },
            { label: 'Failed Today', value: stats?.failedToday ?? 0 },
        ], health: stats?.health ?? 'error', loading: loading, error: error, detailsPath: "/cpanel/plugins/notifications" }));
}
//# sourceMappingURL=NotificationsStatusWidget.js.map