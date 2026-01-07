/**
 * LogsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LogsManagementPage } from './LogsManagementPage';

describe('LogsManagementPage', () => {
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

    render(<LogsManagementPage apiPrefix="/api/logs" />);

    expect(screen.getByText('Application Logs')).toBeInTheDocument();
  });

  it('fetches logs on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<LogsManagementPage apiPrefix="/api/logs" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('renders all tabs', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<LogsManagementPage apiPrefix="/api/logs" />);

    expect(screen.getByRole('tab', { name: /All Logs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Errors/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Warnings/i })).toBeInTheDocument();
  });
});
