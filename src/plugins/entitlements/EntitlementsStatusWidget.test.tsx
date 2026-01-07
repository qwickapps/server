/**
 * EntitlementsStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntitlementsStatusWidget } from './EntitlementsStatusWidget';

describe('EntitlementsStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<EntitlementsStatusWidget apiPrefix="/api/entitlements" />);

    expect(screen.getByText(/Entitlements Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalEntitlements: 250,
      activeEntitlements: 200,
      expiredEntitlements: 50,
      recentGrants: 30,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<EntitlementsStatusWidget apiPrefix="/api/entitlements" />);

    await waitFor(() => {
      expect(screen.getByText('Entitlements')).toBeInTheDocument();
      expect(screen.getByText(/Total Entitlements: 250/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 200/)).toBeInTheDocument();
      expect(screen.getByText(/Expired: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Grants: 30/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/entitlements/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Entitlements service error')
    );

    render(<EntitlementsStatusWidget apiPrefix="/api/entitlements" />);

    await waitFor(() => {
      expect(screen.getByText(/Entitlements service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalEntitlements: 100,
      activeEntitlements: 80,
      expiredEntitlements: 20,
      recentGrants: 15,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<EntitlementsStatusWidget apiPrefix="/custom/entitlements" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/entitlements/stats');
    });
  });

  it('displays all entitlement metrics correctly', async () => {
    const mockStats = {
      totalEntitlements: 500,
      activeEntitlements: 400,
      expiredEntitlements: 100,
      recentGrants: 60,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<EntitlementsStatusWidget apiPrefix="/api/entitlements" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Entitlements: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 400/)).toBeInTheDocument();
      expect(screen.getByText(/Expired: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Grants: 60/)).toBeInTheDocument();
    });
  });
});
