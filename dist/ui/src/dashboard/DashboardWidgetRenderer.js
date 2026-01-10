import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Dashboard Widget Renderer
 *
 * Renders all visible dashboard widgets from the registry.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { Box, Typography } from '@mui/material';
import { useDashboardWidgets } from './DashboardWidgetRegistry';
export function DashboardWidgetRenderer() {
    const { getVisibleWidgets } = useDashboardWidgets();
    const widgets = getVisibleWidgets();
    if (widgets.length === 0) {
        return null;
    }
    return (_jsx(_Fragment, { children: widgets.map(widget => (_jsxs(Box, { sx: { mt: 4 }, children: [widget.title && (_jsx(Typography, { variant: "h6", sx: { mb: 2, color: 'var(--theme-text-primary)' }, children: widget.title })), widget.component] }, widget.id))) }));
}
//# sourceMappingURL=DashboardWidgetRenderer.js.map