import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Environment Configuration Widget
 *
 * Displays and allows editing environment variables.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { Card, CardContent, Typography, Alert } from '@mui/material';
export function EnvironmentConfigWidget() {
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Environment Configuration" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "View and manage environment variables" }), _jsx(Alert, { severity: "info", children: "Environment configuration UI coming soon. This will allow you to view and edit environment variables." })] }) }));
}
//# sourceMappingURL=EnvironmentConfigWidget.js.map