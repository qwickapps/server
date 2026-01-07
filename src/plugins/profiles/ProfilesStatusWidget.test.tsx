/**
 * ProfilesStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfilesStatusWidget } from './ProfilesStatusWidget';

describe('ProfilesStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ProfilesStatusWidget apiPrefix="/api/profiles" />);

    expect(screen.getByText(/User Profiles Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalProfiles: 150,
      completeProfiles: 120,
      incompleteProfiles: 30,
      recentUpdates: 25,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ProfilesStatusWidget apiPrefix="/api/profiles" />);

    await waitFor(() => {
      expect(screen.getByText('User Profiles')).toBeInTheDocument();
      expect(screen.getByText(/Total Profiles: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Complete: 120/)).toBeInTheDocument();
      expect(screen.getByText(/Incomplete: 30/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Updates: 25/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/profiles/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Profiles service error')
    );

    render(<ProfilesStatusWidget apiPrefix="/api/profiles" />);

    await waitFor(() => {
      expect(screen.getByText(/Profiles service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalProfiles: 80,
      completeProfiles: 60,
      incompleteProfiles: 20,
      recentUpdates: 10,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ProfilesStatusWidget apiPrefix="/custom/profiles" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/profiles/stats');
    });
  });

  it('displays all profile metrics correctly', async () => {
    const mockStats = {
      totalProfiles: 300,
      completeProfiles: 250,
      incompleteProfiles: 50,
      recentUpdates: 45,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ProfilesStatusWidget apiPrefix="/api/profiles" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Profiles: 300/)).toBeInTheDocument();
      expect(screen.getByText(/Complete: 250/)).toBeInTheDocument();
      expect(screen.getByText(/Incomplete: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Updates: 45/)).toBeInTheDocument();
    });
  });
});
