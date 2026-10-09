/**
 * DiagnosticsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DiagnosticsManagementPage } from './DiagnosticsManagementPage';

const diagnosticsReport = {
  timestamp: '2026-10-09T00:00:00.000Z',
  system: {
    nodeVersion: 'v22.0.0',
    platform: 'linux',
    arch: 'x64',
    pid: 1234,
    cwd: '/app',
    uptime: 3600,
    memory: {
      rss: '100 MB',
      heapTotal: '80 MB',
      heapUsed: '40 MB',
      external: '5 MB',
    },
  },
  envCheck: { DATABASE_URL: true },
  logs: { startup: [], app: [] },
};

describe('DiagnosticsManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => diagnosticsReport,
    });
  });

  it('renders page title', async () => {
    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    expect(screen.getByText('System Diagnostics')).toBeInTheDocument();
    expect(await screen.findByText('Node Version: v22.0.0')).toBeInTheDocument();
  });

  it('fetches diagnostics data on mount', async () => {
    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/diagnostics/full');
    });
  });

  it('renders diagnostic sections', async () => {
    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    expect(await screen.findByRole('button', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Environment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logs' })).toBeInTheDocument();
  });
});
