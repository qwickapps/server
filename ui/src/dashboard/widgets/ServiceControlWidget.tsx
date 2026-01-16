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
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Service Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start, stop, and restart services
        </Typography>

        <Alert severity="info">
          Service control functionality coming soon. This will allow you to manage service lifecycle.
        </Alert>
      </CardContent>
    </Card>
  );
}
