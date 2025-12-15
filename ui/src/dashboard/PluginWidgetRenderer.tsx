/**
 * Plugin Widget Renderer
 *
 * Fetches widget contributions from the server API and renders them using
 * the WidgetComponentRegistry to resolve component names to React components.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { api } from '../api/controlPanelApi';
import { useWidgetComponentRegistry } from './WidgetComponentRegistry';

/**
 * Widget contribution from the server
 */
interface WidgetContribution {
  id: string;
  title: string;
  component: string;
  priority?: number;
  showByDefault?: boolean;
  pluginId: string;
}

interface PluginWidgetRendererProps {
  /** Only show widgets marked as showByDefault (default: true) */
  defaultOnly?: boolean;
  /** Additional widget IDs to show (beyond showByDefault) */
  additionalWidgetIds?: string[];
}

/**
 * Renders widgets from plugins that have registered them via the server API
 */
export function PluginWidgetRenderer({
  defaultOnly = true,
  additionalWidgetIds = [],
}: PluginWidgetRendererProps) {
  const [widgets, setWidgets] = useState<WidgetContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getComponent, hasComponent } = useWidgetComponentRegistry();

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        const data = await api.getUiContributions();
        setWidgets(data.widgets || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch widgets');
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Filter widgets to show
  const visibleWidgets = widgets
    .filter(widget => {
      // Show if marked as default, or if in additionalWidgetIds
      if (defaultOnly) {
        return widget.showByDefault || additionalWidgetIds.includes(widget.id);
      }
      return true;
    })
    .filter(widget => {
      // Only show widgets that have a registered component
      if (!hasComponent(widget.component)) {
        console.warn(`Widget "${widget.id}" references unregistered component "${widget.component}"`);
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

  if (visibleWidgets.length === 0) {
    return null;
  }

  return (
    <>
      {visibleWidgets.map(widget => {
        const Component = getComponent(widget.component);
        return (
          <Box key={widget.id} sx={{ mt: 4 }}>
            {widget.title && (
              <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
                {widget.title}
              </Typography>
            )}
            {Component && <Component />}
          </Box>
        );
      })}
    </>
  );
}
