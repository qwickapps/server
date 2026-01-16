import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, CardActionArea, Typography, CircularProgress, Chip, } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { api } from '../api/controlPanelApi';
import { DashboardWidgetRenderer, PluginWidgetRenderer } from '../dashboard';
function getStatusIcon(status) {
    switch (status) {
        case 'healthy':
            return _jsx(CheckCircleIcon, { sx: { color: 'var(--theme-success)' } });
        case 'degraded':
            return _jsx(WarningIcon, { sx: { color: 'var(--theme-warning)' } });
        case 'unhealthy':
            return _jsx(ErrorIcon, { sx: { color: 'var(--theme-error)' } });
        default:
            return _jsx(CircularProgress, { size: 20 });
    }
}
function getStatusColor(status) {
    switch (status) {
        case 'healthy':
            return 'var(--theme-success)';
        case 'degraded':
            return 'var(--theme-warning)';
        case 'unhealthy':
            return 'var(--theme-error)';
        default:
            return 'var(--theme-text-secondary)';
    }
}
export function DashboardPage() {
    const navigate = useNavigate();
    const [health, setHealth] = useState(null);
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [healthData, infoData] = await Promise.all([
                    api.getHealth(),
                    api.getInfo(),
                ]);
                setHealth(healthData);
                setInfo(infoData);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }, children: _jsx(CircularProgress, {}) }));
    }
    if (error) {
        return (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', border: '1px solid var(--theme-error)' }, children: _jsx(CardContent, { children: _jsx(Typography, { color: "error", children: error }) }) }));
    }
    const healthChecks = health ? Object.entries(health.checks) : [];
    const healthyCount = healthChecks.filter(([, c]) => c.status === 'healthy').length;
    const totalCount = healthChecks.length;
    return (_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 1, color: 'var(--theme-text-primary)' }, children: "Dashboard" }), _jsxs(Typography, { variant: "body2", sx: { mb: 4, color: 'var(--theme-text-secondary)' }, children: ["Real-time overview of ", info?.product || 'your service'] }), _jsx(Card, { sx: {
                    mb: 4,
                    bgcolor: 'var(--theme-surface)',
                    border: `2px solid ${getStatusColor(health?.status || 'unknown')}`,
                }, children: _jsx(CardActionArea, { onClick: () => navigate('/health'), children: _jsxs(CardContent, { sx: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [getStatusIcon(health?.status || 'unknown'), _jsxs(Box, { children: [_jsxs(Typography, { variant: "h6", sx: { color: 'var(--theme-text-primary)' }, children: ["Service Status: ", health?.status?.charAt(0).toUpperCase(), health?.status?.slice(1)] }), _jsx(Typography, { variant: "body2", sx: { color: 'var(--theme-text-secondary)' }, children: "Click to view detailed health information" })] })] }), _jsx(Chip, { label: `${healthyCount}/${totalCount} checks passing`, sx: {
                                    bgcolor: getStatusColor(health?.status || 'unknown') + '20',
                                    color: getStatusColor(health?.status || 'unknown'),
                                } })] }) }) }), _jsx(PluginWidgetRenderer, { widgetType: "status" }), _jsx(DashboardWidgetRenderer, {})] }));
}
//# sourceMappingURL=DashboardPage.js.map