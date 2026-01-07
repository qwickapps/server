/**
 * HealthStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthStatusWidget } from './HealthStatusWidget';

describe('HealthStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<HealthStatusWidget apiPrefix="/api/health" />);

    expect(screen.getByText(/Service Health Loading/)).toBeInTheDocument();
  });

  it('fetches and displays healthy summary', async () => {
    const mockSummary = {
      overall: 'healthy' as const,
      totalChecks: 5,
      healthyChecks: 5,
      unhealthyChecks: 0,
      degradedChecks: 0,
      checks: [],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    render(<HealthStatusWidget apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(screen.getByText('Service Health')).toBeInTheDocument();
      expect(screen.getByText(/Total Checks: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Healthy: 5/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/health/summary');
  });

  it('displays degraded state', async () => {
    const mockSummary = {
      overall: 'degraded' as const,
      totalChecks: 5,
      healthyChecks: 3,
      unhealthyChecks: 0,
      degradedChecks: 2,
      checks: [],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    render(<HealthStatusWidget apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(screen.getByText(/Degraded: 2/)).toBeInTheDocument();
    });
  });

  it('displays unhealthy state', async () => {
    const mockSummary = {
      overall: 'unhealthy' as const,
      totalChecks: 5,
      healthyChecks: 2,
      unhealthyChecks: 3,
      degradedChecks: 0,
      checks: [],
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSummary,
    });

    render(<HealthStatusWidget apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(screen.getByText(/Unhealthy: 3/)).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch health')
    );

    render(<HealthStatusWidget apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(screen.getByText('Service Health')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
