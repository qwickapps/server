/**
 * UsersStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UsersStatusWidget } from './UsersStatusWidget';

describe('UsersStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<UsersStatusWidget apiPrefix="/api/users" />);

    expect(screen.getByText(/User Management/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalUsers: 150,
      activeUsers: 120,
      invitedUsers: 10,
      suspendedUsers: 5,
      recentSignups: 15,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsersStatusWidget apiPrefix="/api/users" />);

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText(/Total Users: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 120/)).toBeInTheDocument();
      expect(screen.getByText(/Invited: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Suspended: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Recent \(7d\): 15/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/users/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Network error')
    );

    render(<UsersStatusWidget apiPrefix="/api/users" />);

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalUsers: 50,
      activeUsers: 40,
      invitedUsers: 5,
      suspendedUsers: 2,
      recentSignups: 3,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsersStatusWidget apiPrefix="/custom/users" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/users/stats');
    });
  });

  it('displays all user metrics correctly', async () => {
    const mockStats = {
      totalUsers: 200,
      activeUsers: 180,
      invitedUsers: 15,
      suspendedUsers: 5,
      recentSignups: 20,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<UsersStatusWidget apiPrefix="/api/users" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Users: 200/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 180/)).toBeInTheDocument();
      expect(screen.getByText(/Invited: 15/)).toBeInTheDocument();
      expect(screen.getByText(/Suspended: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Recent \(7d\): 20/)).toBeInTheDocument();
    });
  });
});
