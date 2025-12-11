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

  return (
    <>
      {widgets.map(widget => (
        <Box key={widget.id} sx={{ mt: 4 }}>
          {widget.title && (
            <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
              {widget.title}
            </Typography>
          )}
          {widget.component}
        </Box>
      ))}
    </>
  );
}
