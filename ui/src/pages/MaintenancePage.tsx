/**
 * MaintenancePage Component
 *
 * Centralized maintenance operations page for system administration.
 * Renders maintenance widgets contributed by plugins (CMS, PostgreSQL, etc.).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { Box, Typography } from '@mui/material';
import { PluginWidgetRenderer } from '../dashboard/PluginWidgetRenderer';

export function MaintenancePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance & Operations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        System administration tools provided by plugins
      </Typography>

      {/* Render all maintenance widgets from plugins */}
      <PluginWidgetRenderer defaultOnly={false} />
    </Box>
  );
}
