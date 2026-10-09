/**
 * LogsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LogsManagementPage } from './LogsManagementPage';

const logStats = {
  totalLogs: 0,
  byLevel: { debug: 0, info: 0, warn: 0, error: 0 },
  fileSize: 0,
  fileSizeFormatted: '0 B',
  oldestLog: null,
  newestLog: null,
};

const mockLogsFetch = () => {
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    const data = url.endsWith('/sources')
      ? { sources: [{ name: 'app', type: 'application' }] }
      : url.includes('/stats?')
        ? logStats
        : { logs: [] };

    return Promise.resolve({ ok: true, json: async () => data });
  });
};

describe('LogsManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogsFetch();
  });

  it('renders page title', () => {
    render(<LogsManagementPage apiPrefix="/api/logs" />);

    expect(screen.getByText('Application Logs')).toBeInTheDocument();
  });

  it('fetches sources, logs, and stats on mount', async () => {
    render(<LogsManagementPage apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/logs/sources');
      expect(global.fetch).toHaveBeenCalledWith('/api/logs?source=app&limit=100');
      expect(global.fetch).toHaveBeenCalledWith('/api/logs/stats?source=app');
    });
  });

  it('renders source and level filters', async () => {
    render(<LogsManagementPage apiPrefix="/api/logs" />);

    expect(await screen.findByRole('option', { name: 'app (application)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'All Levels' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Error' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Warning' })).toBeInTheDocument();
  });
});
