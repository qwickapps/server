/**
 * PreferencesStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PreferencesStatusWidget } from './PreferencesStatusWidget';

describe('PreferencesStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<PreferencesStatusWidget apiPrefix="/api/preferences" />);

    expect(screen.getByText(/User Preferences Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalPreferences: 500,
      activeUsers: 150,
      preferenceSets: 25,
      recentUpdates: 40,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PreferencesStatusWidget apiPrefix="/api/preferences" />);

    await waitFor(() => {
      expect(screen.getByText('User Preferences')).toBeInTheDocument();
      expect(screen.getByText(/Preference Sets: 25/)).toBeInTheDocument();
      expect(screen.getByText(/Active Users: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Total Prefs: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Updates: 40/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/preferences/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Preferences service error')
    );

    render(<PreferencesStatusWidget apiPrefix="/api/preferences" />);

    await waitFor(() => {
      expect(screen.getByText(/Preferences service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalPreferences: 200,
      activeUsers: 80,
      preferenceSets: 15,
      recentUpdates: 20,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PreferencesStatusWidget apiPrefix="/custom/preferences" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/preferences/stats');
    });
  });

  it('displays all preference metrics correctly', async () => {
    const mockStats = {
      totalPreferences: 1000,
      activeUsers: 300,
      preferenceSets: 50,
      recentUpdates: 100,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<PreferencesStatusWidget apiPrefix="/api/preferences" />);

    await waitFor(() => {
      expect(screen.getByText(/Preference Sets: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Active Users: 300/)).toBeInTheDocument();
      expect(screen.getByText(/Total Prefs: 1000/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Updates: 100/)).toBeInTheDocument();
    });
  });
});
