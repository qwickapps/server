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
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Database Operations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Backup, restore, and maintain database
        </Typography>

        <Alert severity="info">
          Database operations UI coming soon. This will allow you to backup and restore your database.
        </Alert>
      </CardContent>
    </Card>
  );
}
