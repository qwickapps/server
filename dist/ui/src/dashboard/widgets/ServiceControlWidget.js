import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Service Control Widget
 *
 * Provides controls for starting, stopping, and restarting services.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { Card, CardContent, Typography, Alert } from '@mui/material';
export function ServiceControlWidget() {
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Service Control" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Start, stop, and restart services" }), _jsx(Alert, { severity: "info", children: "Service control functionality coming soon. This will allow you to manage service lifecycle." })] }) }));
}
//# sourceMappingURL=ServiceControlWidget.js.map