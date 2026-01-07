/**
 * HealthManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HealthManagementPage } from './HealthManagementPage';

describe('HealthManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<HealthManagementPage apiPrefix="/api/health" />);

    expect(screen.getByText('Health Checks Management')).toBeInTheDocument();
  });

  it('fetches health checks on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<HealthManagementPage apiPrefix="/api/health" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/health/checks');
    });
  });

  it('renders all tabs', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<HealthManagementPage apiPrefix="/api/health" />);

    expect(screen.getByRole('tab', { name: /All Checks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Unhealthy/i })).toBeInTheDocument();
  });
});
