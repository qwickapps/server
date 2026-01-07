/**
 * BansStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BansStatusWidget } from './BansStatusWidget';

describe('BansStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<BansStatusWidget apiPrefix="/api/bans" />);

    expect(screen.getByText(/User Bans Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalBans: 25,
      activeBans: 15,
      permanentBans: 8,
      temporaryBans: 7,
      recentBans: 5,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<BansStatusWidget apiPrefix="/api/bans" />);

    await waitFor(() => {
      expect(screen.getByText('User Bans')).toBeInTheDocument();
      expect(screen.getByText(/Total Bans: 25/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 15/)).toBeInTheDocument();
      expect(screen.getByText(/Permanent: 8/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Bans: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/bans/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Bans service error')
    );

    render(<BansStatusWidget apiPrefix="/api/bans" />);

    await waitFor(() => {
      expect(screen.getByText(/Bans service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalBans: 10,
      activeBans: 5,
      permanentBans: 3,
      temporaryBans: 2,
      recentBans: 1,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<BansStatusWidget apiPrefix="/custom/bans" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/bans/stats');
    });
  });

  it('displays all ban metrics correctly', async () => {
    const mockStats = {
      totalBans: 50,
      activeBans: 30,
      permanentBans: 20,
      temporaryBans: 10,
      recentBans: 8,
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<BansStatusWidget apiPrefix="/api/bans" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Bans: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 30/)).toBeInTheDocument();
      expect(screen.getByText(/Permanent: 20/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Bans: 8/)).toBeInTheDocument();
    });
  });
});
