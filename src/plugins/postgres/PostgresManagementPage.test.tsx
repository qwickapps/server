/**
 * PostgresManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PostgresManagementPage } from './PostgresManagementPage';

describe('PostgresManagementPage', () => {
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

    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    expect(screen.getByText('PostgreSQL Database Management')).toBeInTheDocument();
  });

  it('fetches data from multiple endpoints on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/stats');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/connections');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/query-logs');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/config');
    });
  });

  it('renders all tabs', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Connections/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Query Logs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Configuration/i })).toBeInTheDocument();
  });
});
