import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Plugin Widget Renderer
 *
 * Fetches widget contributions from the server API and renders them using
 * the WidgetComponentRegistry to resolve component names to React components.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { api } from '../api/controlPanelApi';
import { useWidgetComponentRegistry } from './WidgetComponentRegistry';
/**
 * Renders widgets from plugins that have registered them via the server API
 */
export function PluginWidgetRenderer({ defaultOnly = true, additionalWidgetIds = [], }) {
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getComponent, hasComponent } = useWidgetComponentRegistry();
    useEffect(() => {
        const fetchWidgets = async () => {
            try {
                const data = await api.getUiContributions();
                setWidgets(data.widgets || []);
                setError(null);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch widgets');
            }
            finally {
                setLoading(false);
            }
        };
        fetchWidgets();
    }, []);
    if (loading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 4 }, children: _jsx(CircularProgress, { size: 24 }) }));
    }
    if (error) {
        return (_jsx(Alert, { severity: "error", sx: { mt: 2 }, children: error }));
    }
    // Filter widgets to show
    const visibleWidgets = widgets
        .filter(widget => {
        // Show if marked as default, or if in additionalWidgetIds
        if (defaultOnly) {
            return widget.showByDefault || additionalWidgetIds.includes(widget.id);
        }
        return true;
    })
        .filter(widget => {
        // Only show widgets that have a registered component
        if (!hasComponent(widget.component)) {
            console.warn(`Widget "${widget.id}" references unregistered component "${widget.component}"`);
            return false;
        }
        return true;
    })
        .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
    if (visibleWidgets.length === 0) {
        return null;
    }
    return (_jsx(_Fragment, { children: visibleWidgets.map(widget => {
            const Component = getComponent(widget.component);
            return (_jsxs(Box, { sx: { mt: 4 }, children: [widget.title && (_jsx(Typography, { variant: "h6", sx: { mb: 2, color: 'var(--theme-text-primary)' }, children: widget.title })), Component && _jsx(Component, {})] }, widget.id));
        }) }));
}
//# sourceMappingURL=PluginWidgetRenderer.js.map