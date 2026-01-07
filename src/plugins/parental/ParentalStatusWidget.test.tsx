/**
 * ParentalStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ParentalStatusWidget } from './ParentalStatusWidget';

describe('ParentalStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ParentalStatusWidget apiPrefix="/api/parental" />);

    expect(screen.getByText(/Parental Controls Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalControls: 150,
      activeControls: 120,
      protectedAccounts: 100,
      recentViolations: 5,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ParentalStatusWidget apiPrefix="/api/parental" />);

    await waitFor(() => {
      expect(screen.getByText('Parental Controls')).toBeInTheDocument();
      expect(screen.getByText(/Total Controls: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 120/)).toBeInTheDocument();
      expect(screen.getByText(/Protected Accounts: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Violations: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/parental/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Parental service error')
    );

    render(<ParentalStatusWidget apiPrefix="/api/parental" />);

    await waitFor(() => {
      expect(screen.getByText(/Parental service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalControls: 80,
      activeControls: 60,
      protectedAccounts: 50,
      recentViolations: 2,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ParentalStatusWidget apiPrefix="/custom/parental" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/parental/stats');
    });
  });

  it('displays all parental control metrics correctly', async () => {
    const mockStats = {
      totalControls: 300,
      activeControls: 250,
      protectedAccounts: 200,
      recentViolations: 10,
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ParentalStatusWidget apiPrefix="/api/parental" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Controls: 300/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 250/)).toBeInTheDocument();
      expect(screen.getByText(/Protected Accounts: 200/)).toBeInTheDocument();
      expect(screen.getByText(/Recent Violations: 10/)).toBeInTheDocument();
    });
  });
});
