/**
 * DiagnosticsStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DiagnosticsStatusWidget } from './DiagnosticsStatusWidget';

describe('DiagnosticsStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DiagnosticsStatusWidget apiPrefix="/api/diagnostics" />);

    expect(screen.getByText(/System Diagnostics Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      uptime: 86400, // 1 day
      memoryUsed: '512MB',
      memoryTotal: '2GB',
      cpuUsage: 45,
      envVarsConfigured: 15,
      envVarsTotal: 20,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DiagnosticsStatusWidget apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(screen.getByText('System Diagnostics')).toBeInTheDocument();
      expect(screen.getByText(/Uptime: 1d 0h/)).toBeInTheDocument();
      expect(screen.getByText(/CPU Usage: 45/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/diagnostics/stats');
  });

  it('formats uptime correctly', async () => {
    const mockStats = {
      uptime: 7200, // 2 hours
      memoryUsed: '256MB',
      memoryTotal: '1GB',
      cpuUsage: 30,
      envVarsConfigured: 10,
      envVarsTotal: 10,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DiagnosticsStatusWidget apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(screen.getByText(/Uptime: 2h 0m/)).toBeInTheDocument();
    });
  });

  it('displays all diagnostic metrics', async () => {
    const mockStats = {
      uptime: 3600,
      memoryUsed: '768MB',
      memoryTotal: '4GB',
      cpuUsage: 65,
      envVarsConfigured: 18,
      envVarsTotal: 20,
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DiagnosticsStatusWidget apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(screen.getByText(/Memory Used: 768MB/)).toBeInTheDocument();
      expect(screen.getByText(/CPU Usage: 65/)).toBeInTheDocument();
      expect(screen.getByText(/Environment: 18/)).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch stats')
    );

    render(<DiagnosticsStatusWidget apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(screen.getByText('System Diagnostics')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
