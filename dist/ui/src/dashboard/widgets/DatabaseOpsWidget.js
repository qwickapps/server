import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Database Operations Widget
 *
 * Provides database backup, restore, and maintenance operations.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { Card, CardContent, Typography, Alert } from '@mui/material';
export function DatabaseOpsWidget() {
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Database Operations" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Backup, restore, and maintain database" }), _jsx(Alert, { severity: "info", children: "Database operations UI coming soon. This will allow you to backup and restore your database." })] }) }));
}
//# sourceMappingURL=DatabaseOpsWidget.js.map