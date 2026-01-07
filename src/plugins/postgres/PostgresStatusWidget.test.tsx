/**
 * PostgresStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PostgresStatusWidget } from './PostgresStatusWidget';

describe('PostgresStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<PostgresStatusWidget apiPrefix="/api/postgres" />);

    expect(screen.getByText(/PostgreSQL Database Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      total: 10,
      idle: 3,
      waiting: 2,
      active: 5,
      utilization: 50,
      queryCount: 100,
      avgQueryTime: 25,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PostgresStatusWidget apiPrefix="/api/postgres" />);

    await waitFor(() => {
      expect(screen.getByText('PostgreSQL Database')).toBeInTheDocument();
      expect(screen.getByText(/Active Connections: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/postgres/stats');
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch stats')
    );

    render(<PostgresStatusWidget apiPrefix="/api/postgres" />);

    await waitFor(() => {
      expect(screen.getByText('PostgreSQL Database')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      total: 10,
      idle: 3,
      waiting: 2,
      active: 5,
      utilization: 50,
      queryCount: 100,
      avgQueryTime: 25,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PostgresStatusWidget apiPrefix="/custom/api" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/api/stats');
    });
  });

  it('displays all stats metrics', async () => {
    const mockStats = {
      total: 10,
      idle: 3,
      waiting: 1,
      active: 6,
      utilization: 60,
      queryCount: 150,
      avgQueryTime: 45,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PostgresStatusWidget apiPrefix="/api/postgres" />);

    await waitFor(() => {
      expect(screen.getByText(/Active Connections: 6/)).toBeInTheDocument();
      expect(screen.getByText(/Idle Connections: 3/)).toBeInTheDocument();
      expect(screen.getByText(/Waiting Requests: 1/)).toBeInTheDocument();
      expect(screen.getByText(/Pool Utilization: 60/)).toBeInTheDocument();
      expect(screen.getByText(/Queries\/min: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Avg Query Time: 45/)).toBeInTheDocument();
    });
  });
});
