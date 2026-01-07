/**
 * NotificationsStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationsStatusWidget } from './NotificationsStatusWidget';

describe('NotificationsStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<NotificationsStatusWidget apiPrefix="/api/notifications" />);

    expect(screen.getByText(/Notifications Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalNotifications: 1000,
      pendingNotifications: 50,
      sentToday: 200,
      failedToday: 5,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<NotificationsStatusWidget apiPrefix="/api/notifications" />);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText(/Total: 1000/)).toBeInTheDocument();
      expect(screen.getByText(/Pending: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Sent Today: 200/)).toBeInTheDocument();
      expect(screen.getByText(/Failed Today: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/notifications/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Notifications service error')
    );

    render(<NotificationsStatusWidget apiPrefix="/api/notifications" />);

    await waitFor(() => {
      expect(screen.getByText(/Notifications service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalNotifications: 500,
      pendingNotifications: 25,
      sentToday: 100,
      failedToday: 2,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<NotificationsStatusWidget apiPrefix="/custom/notifications" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/notifications/stats');
    });
  });

  it('displays all notification metrics correctly', async () => {
    const mockStats = {
      totalNotifications: 2000,
      pendingNotifications: 100,
      sentToday: 500,
      failedToday: 10,
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<NotificationsStatusWidget apiPrefix="/api/notifications" />);

    await waitFor(() => {
      expect(screen.getByText(/Total: 2000/)).toBeInTheDocument();
      expect(screen.getByText(/Pending: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Sent Today: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Failed Today: 10/)).toBeInTheDocument();
    });
  });
});
