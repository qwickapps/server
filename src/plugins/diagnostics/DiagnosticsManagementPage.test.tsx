/**
 * DiagnosticsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DiagnosticsManagementPage } from './DiagnosticsManagementPage';

describe('DiagnosticsManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    expect(screen.getByText('System Diagnostics')).toBeInTheDocument();
  });

  it('fetches diagnostics data on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/diagnostics/stats');
    });
  });

  it('renders all tabs', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<DiagnosticsManagementPage apiPrefix="/api/diagnostics" />);

    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Environment/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Process/i })).toBeInTheDocument();
  });
});
