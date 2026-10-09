/**
 * HealthManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthManagementPage } from './HealthManagementPage';

const healthSummary = {
  overall: 'healthy' as const,
  totalChecks: 1,
  healthyChecks: 1,
  unhealthyChecks: 0,
  degradedChecks: 0,
  checks: [
    {
      name: 'database',
      type: 'postgres',
      status: 'healthy' as const,
      latency: 12,
      lastChecked: '2026-10-09T00:00:00.000Z',
    },
  ],
};

describe('HealthManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => healthSummary,
    });
  });

  it('renders page title', () => {
    render(<HealthManagementPage apiPrefix="/api/health" />);

    expect(screen.getByText('Service Health')).toBeInTheDocument();
  });

  it('fetches the health summary on mount', async () => {
    render(<HealthManagementPage apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/health/summary');
    });
  });

  it('renders summary stats and the health checks table', async () => {
    render(<HealthManagementPage apiPrefix="/api/health" />);

    expect(await screen.findByText('Overall Status: HEALTHY')).toBeInTheDocument();
    expect(screen.getByText('Total Checks: 1')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
  });
});
