/**
 * SubscriptionsStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SubscriptionsStatusWidget } from './SubscriptionsStatusWidget';

describe('SubscriptionsStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<SubscriptionsStatusWidget apiPrefix="/api/subscriptions" />);

    expect(screen.getByText(/Subscriptions Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalSubscriptions: 500,
      activeSubscriptions: 450,
      expiringSoon: 25,
      cancelledToday: 5,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<SubscriptionsStatusWidget apiPrefix="/api/subscriptions" />);

    await waitFor(() => {
      expect(screen.getByText('Subscriptions')).toBeInTheDocument();
      expect(screen.getByText(/Total Subs: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 450/)).toBeInTheDocument();
      expect(screen.getByText(/Expiring Soon: 25/)).toBeInTheDocument();
      expect(screen.getByText(/Cancelled Today: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/subscriptions/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Subscriptions service error')
    );

    render(<SubscriptionsStatusWidget apiPrefix="/api/subscriptions" />);

    await waitFor(() => {
      expect(screen.getByText(/Subscriptions service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalSubscriptions: 200,
      activeSubscriptions: 180,
      expiringSoon: 10,
      cancelledToday: 2,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<SubscriptionsStatusWidget apiPrefix="/custom/subscriptions" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/subscriptions/stats');
    });
  });

  it('displays all subscription metrics correctly', async () => {
    const mockStats = {
      totalSubscriptions: 1000,
      activeSubscriptions: 900,
      expiringSoon: 50,
      cancelledToday: 10,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<SubscriptionsStatusWidget apiPrefix="/api/subscriptions" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Subs: 1000/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 900/)).toBeInTheDocument();
      expect(screen.getByText(/Expiring Soon: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Cancelled Today: 10/)).toBeInTheDocument();
    });
  });
});
