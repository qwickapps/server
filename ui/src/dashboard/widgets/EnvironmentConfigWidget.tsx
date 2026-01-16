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
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Environment Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          View and manage environment variables
        </Typography>

        <Alert severity="info">
          Environment configuration UI coming soon. This will allow you to view and edit environment variables.
        </Alert>
      </CardContent>
    </Card>
  );
}
