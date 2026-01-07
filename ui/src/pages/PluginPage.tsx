/**
 * PluginPage Component
 *
 * A generic page component for plugin-contributed routes.
 * Fetches and displays plugin-specific content from the API.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { api } from '../api/controlPanelApi';

interface PluginPageProps {
  pluginId: string;
  title: string;
  route: string;
}

interface PluginPageData {
  content?: string;
  cards?: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }>;
  sections?: Array<{
    title: string;
    content: string;
  }>;
}

export function PluginPage({ pluginId, title, route }: PluginPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageData, setPageData] = useState<PluginPageData | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // Try to fetch plugin-specific page data
        const response = await fetch(`${api.getBaseUrl()}/api${route}`, {
          credentials: 'same-origin',
        });
        if (response.ok) {
          const data = await response.json();
          setPageData(data);
          setError(null);
        } else if (response.status === 404) {
          // No dedicated page endpoint, show placeholder
          setPageData(null);
          setError(null);
        } else {
          setError(`Failed to load page: ${response.statusText}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [route]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, color: 'var(--theme-text-primary)' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Plugin: {pluginId}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {pageData?.cards && pageData.cards.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
          {pageData.cards.map((card, index) => (
            <Card key={index} sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                <Typography variant="h4" sx={{ color: card.color || 'var(--theme-text-primary)' }}>
                  {card.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  {card.title}
                </Typography>
                {card.subtitle && (
                  <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)' }}>
                    {card.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {pageData?.sections && pageData.sections.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {pageData.sections.map((section, index) => (
            <Card key={index} sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {section.content}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!pageData && !error && (
        <Card sx={{ bgcolor: 'var(--theme-surface)' }}>
          <CardContent>
            <Typography variant="body1" sx={{ color: 'var(--theme-text-secondary)' }}>
              This plugin page is available. Configure the plugin to add content here.
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: 'var(--theme-text-secondary)' }}>
              API endpoint: <code>/api{route}</code>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
