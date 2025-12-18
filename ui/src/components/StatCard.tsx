/**
 * StatCard Component
 *
 * A reusable card component for displaying statistics with an icon,
 * value, label, and optional sub-value.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { Box, Card, CardContent } from '@mui/material';
import { Text } from '@qwickapps/react-framework';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  color = 'var(--theme-primary)',
}: StatCardProps) {
  return (
    <Card sx={{ bgcolor: 'var(--theme-surface)', height: '100%' }}>
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ color }}>{icon}</Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="h4"
              content={String(value)}
              customColor="var(--theme-text-primary)"
              fontWeight="600"
            />
            <Text
              variant="caption"
              content={label}
              customColor="var(--theme-text-secondary)"
            />
            {subValue && (
              <Text
                variant="caption"
                content={subValue}
                customColor="var(--theme-text-secondary)"
                sx={{ display: 'block', mt: 0.25 }}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
