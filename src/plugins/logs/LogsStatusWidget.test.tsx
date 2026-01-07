/**
 * LogsStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LogsStatusWidget } from './LogsStatusWidget';

describe('LogsStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<LogsStatusWidget apiPrefix="/api/logs" />);

    expect(screen.getByText(/Application Logs Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalLogs: 5000,
      byLevel: {
        debug: 1000,
        info: 3500,
        warn: 400,
        error: 100,
      },
      fileSize: '25MB',
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<LogsStatusWidget apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(screen.getByText('Application Logs')).toBeInTheDocument();
      expect(screen.getByText(/Total Logs: 5000/)).toBeInTheDocument();
      expect(screen.getByText(/Errors: 100/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/logs/stats');
  });

  it('displays no errors state', async () => {
    const mockStats = {
      totalLogs: 1000,
      byLevel: {
        debug: 100,
        info: 800,
        warn: 100,
        error: 0,
      },
      fileSize: '5MB',
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<LogsStatusWidget apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(screen.getByText(/Errors: 0/)).toBeInTheDocument();
    });
  });

  it('displays all log metrics', async () => {
    const mockStats = {
      totalLogs: 10000,
      byLevel: {
        debug: 2000,
        info: 7000,
        warn: 500,
        error: 500,
      },
      fileSize: '50MB',
      health: 'error' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<LogsStatusWidget apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Logs: 10000/)).toBeInTheDocument();
      expect(screen.getByText(/Errors: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Warnings: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Log File Size: 50MB/)).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch stats')
    );

    render(<LogsStatusWidget apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(screen.getByText('Application Logs')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
