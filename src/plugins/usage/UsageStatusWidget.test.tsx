/**
 * UsageStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsageStatusWidget } from './UsageStatusWidget';

describe('UsageStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<UsageStatusWidget apiPrefix="/api/usage" />);

    expect(screen.getByText(/Usage Tracking Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalEvents: 10000,
      activeUsers: 500,
      eventsToday: 1200,
      topFeature: 'Login',
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsageStatusWidget apiPrefix="/api/usage" />);

    await waitFor(() => {
      expect(screen.getByText('Usage Tracking')).toBeInTheDocument();
      expect(screen.getByText(/Total Events: 10000/)).toBeInTheDocument();
      expect(screen.getByText(/Active Users: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Events Today: 1200/)).toBeInTheDocument();
      expect(screen.getByText(/Top Feature: Login/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/usage/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Usage service error')
    );

    render(<UsageStatusWidget apiPrefix="/api/usage" />);

    await waitFor(() => {
      expect(screen.getByText(/Usage service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalEvents: 5000,
      activeUsers: 250,
      eventsToday: 600,
      topFeature: 'Search',
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsageStatusWidget apiPrefix="/custom/usage" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/usage/stats');
    });
  });

  it('displays all usage metrics correctly', async () => {
    const mockStats = {
      totalEvents: 50000,
      activeUsers: 2000,
      eventsToday: 5000,
      topFeature: 'Dashboard',
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsageStatusWidget apiPrefix="/api/usage" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Events: 50000/)).toBeInTheDocument();
      expect(screen.getByText(/Active Users: 2000/)).toBeInTheDocument();
      expect(screen.getByText(/Events Today: 5000/)).toBeInTheDocument();
      expect(screen.getByText(/Top Feature: Dashboard/)).toBeInTheDocument();
    });
  });
});
