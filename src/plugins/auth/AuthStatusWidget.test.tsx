/**
 * AuthStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthStatusWidget } from './AuthStatusWidget';

describe('AuthStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<AuthStatusWidget apiPrefix="/api/auth" />);

    expect(screen.getByText(/Authentication Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalProviders: 5,
      activeProviders: 4,
      totalSessions: 150,
      activeSessions: 120,
      recentLogins: 45,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<AuthStatusWidget apiPrefix="/api/auth" />);

    await waitFor(() => {
      expect(screen.getByText('Authentication')).toBeInTheDocument();
      expect(screen.getByText(/Total Providers: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Active Providers: 4/)).toBeInTheDocument();
      expect(screen.getByText(/Active Sessions: 120/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Logins: 45/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Auth service unavailable')
    );

    render(<AuthStatusWidget apiPrefix="/api/auth" />);

    await waitFor(() => {
      expect(screen.getByText(/Auth service unavailable/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalProviders: 3,
      activeProviders: 3,
      totalSessions: 50,
      activeSessions: 40,
      recentLogins: 10,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<AuthStatusWidget apiPrefix="/custom/auth" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/auth/stats');
    });
  });

  it('displays all authentication metrics correctly', async () => {
    const mockStats = {
      totalProviders: 6,
      activeProviders: 5,
      totalSessions: 200,
      activeSessions: 180,
      recentLogins: 60,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<AuthStatusWidget apiPrefix="/api/auth" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Providers: 6/)).toBeInTheDocument();
      expect(screen.getByText(/Active Providers: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Active Sessions: 180/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Logins: 60/)).toBeInTheDocument();
    });
  });
});
