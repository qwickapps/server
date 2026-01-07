/**
 * RateLimitStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RateLimitStatusWidget } from './RateLimitStatusWidget';

describe('RateLimitStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<RateLimitStatusWidget apiPrefix="/api/rate-limit" />);

    expect(screen.getByText(/Rate Limiting Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalRequests: 100000,
      blockedRequests: 500,
      activeRules: 15,
      requestsToday: 5000,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<RateLimitStatusWidget apiPrefix="/api/rate-limit" />);

    await waitFor(() => {
      expect(screen.getByText('Rate Limiting')).toBeInTheDocument();
      expect(screen.getByText(/Total Requests: 100000/)).toBeInTheDocument();
      expect(screen.getByText(/Blocked: 500/)).toBeInTheDocument();
      expect(screen.getByText(/Active Rules: 15/)).toBeInTheDocument();
      expect(screen.getByText(/Requests Today: 5000/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/rate-limit/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Rate limit service error')
    );

    render(<RateLimitStatusWidget apiPrefix="/api/rate-limit" />);

    await waitFor(() => {
      expect(screen.getByText(/Rate limit service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalRequests: 50000,
      blockedRequests: 200,
      activeRules: 8,
      requestsToday: 2500,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<RateLimitStatusWidget apiPrefix="/custom/rate-limit" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/rate-limit/stats');
    });
  });

  it('displays all rate limit metrics correctly', async () => {
    const mockStats = {
      totalRequests: 200000,
      blockedRequests: 1000,
      activeRules: 25,
      requestsToday: 10000,
      health: 'warning' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<RateLimitStatusWidget apiPrefix="/api/rate-limit" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Requests: 200000/)).toBeInTheDocument();
      expect(screen.getByText(/Blocked: 1000/)).toBeInTheDocument();
      expect(screen.getByText(/Active Rules: 25/)).toBeInTheDocument();
      expect(screen.getByText(/Requests Today: 10000/)).toBeInTheDocument();
    });
  });
});
