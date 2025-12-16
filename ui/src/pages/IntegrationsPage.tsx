import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { api } from '../api/controlPanelApi';

interface Integration {
  id: string;
  name: string;
  description: string;
  configured: boolean;
  apiKey: string;
  docsUrl: string;
}

interface IntegrationsConfig {
  integrations: Integration[];
  stats: {
    totalRequests: number;
  };
}

interface TestResult {
  success: boolean;
  message: string;
  latency?: number;
}

export function IntegrationsPage() {
  const [config, setConfig] = useState<IntegrationsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetch<IntegrationsConfig>('/ai-proxy/config');
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integrations config');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleTest = async (integrationId: string) => {
    setTestingId(integrationId);
    setTestResults((prev) => ({ ...prev, [integrationId]: { success: false, message: 'Testing...' } }));

    try {
      const result = await api.fetch<TestResult>(`/ai-proxy/test/${integrationId}`, {
        method: 'POST',
      });
      setTestResults((prev) => ({ ...prev, [integrationId]: result }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [integrationId]: {
          success: false,
          message: err instanceof Error ? err.message : 'Test failed',
        },
      }));
    } finally {
      setTestingId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" sx={{ color: 'var(--theme-text-primary)' }}>
          AI Integrations
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchConfig} sx={{ color: 'var(--theme-text-secondary)' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography variant="body2" sx={{ mb: 4, color: 'var(--theme-text-secondary)' }}>
        Manage AI service connections for QwickBot
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Card */}
      {config && (
        <Card sx={{ bgcolor: 'var(--theme-surface)', mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box>
                <Typography variant="h3" sx={{ color: 'var(--theme-primary)', fontWeight: 600 }}>
                  {config.stats.totalRequests}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Total API Requests
                </Typography>
              </Box>
              <Box sx={{ borderLeft: '1px solid var(--theme-border)', pl: 3 }}>
                <Typography variant="h3" sx={{ color: 'var(--theme-success)', fontWeight: 600 }}>
                  {config.integrations.filter((i) => i.configured).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                  Configured Services
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Integration Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {config?.integrations.map((integration) => {
          const testResult = testResults[integration.id];
          const isTesting = testingId === integration.id;

          return (
            <Card key={integration.id} sx={{ bgcolor: 'var(--theme-surface)' }}>
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)' }}>
                        {integration.name}
                      </Typography>
                      <Chip
                        label={integration.configured ? 'Configured' : 'Not Configured'}
                        size="small"
                        sx={{
                          bgcolor: integration.configured ? 'var(--theme-success)20' : 'var(--theme-error)20',
                          color: integration.configured ? 'var(--theme-success)' : 'var(--theme-error)',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)' }}>
                      {integration.description}
                    </Typography>
                  </Box>
                  {integration.configured ? (
                    <CheckCircleIcon sx={{ color: 'var(--theme-success)' }} />
                  ) : (
                    <ErrorIcon sx={{ color: 'var(--theme-error)' }} />
                  )}
                </Box>

                {/* API Key */}
                <Box sx={{ mb: 2, p: 1.5, bgcolor: 'var(--theme-background)', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--theme-text-secondary)', display: 'block', mb: 0.5 }}>
                    API Key
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 13,
                      color: integration.configured ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                    }}
                  >
                    {integration.apiKey}
                  </Typography>
                </Box>

                {/* Test Result */}
                {testResult && (
                  <Box sx={{ mb: 2 }}>
                    {isTesting ? (
                      <LinearProgress sx={{ height: 4, borderRadius: 2 }} />
                    ) : (
                      <Alert
                        severity={testResult.success ? 'success' : 'error'}
                        sx={{ py: 0.5, '& .MuiAlert-message': { fontSize: 13 } }}
                      >
                        {testResult.message}
                        {testResult.latency !== undefined && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            Latency: {testResult.latency}ms
                          </Typography>
                        )}
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    startIcon={<OpenInNewIcon />}
                    href={integration.docsUrl}
                    target="_blank"
                    sx={{
                      color: 'var(--theme-text-secondary)',
                      '&:hover': { color: 'var(--theme-primary)' },
                    }}
                  >
                    Docs
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={isTesting ? <CircularProgress size={14} /> : <PlayArrowIcon />}
                    onClick={() => handleTest(integration.id)}
                    disabled={!integration.configured || isTesting}
                    sx={{
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      '&:hover': { borderColor: 'var(--theme-primary)' },
                    }}
                  >
                    Test Connection
                  </Button>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Setup Instructions */}
      {config && config.integrations.some((i) => !i.configured) && (
        <Card sx={{ bgcolor: 'var(--theme-surface)', mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'var(--theme-text-primary)', mb: 2 }}>
              Setup Instructions
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--theme-text-secondary)', mb: 2 }}>
              Add the following environment variables to configure the AI services:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'var(--theme-background)',
                borderRadius: 1,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 13,
                color: 'var(--theme-text-primary)',
              }}
            >
              {`# Groq - for chat (https://console.groq.com)
GROQ_API_KEY=your_groq_api_key

# Gemini - for vision (https://ai.google.dev)
GEMINI_API_KEY=your_gemini_api_key`}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
