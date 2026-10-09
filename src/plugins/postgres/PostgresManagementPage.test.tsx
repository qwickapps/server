/**
 * PostgresManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PostgresManagementPage } from './PostgresManagementPage';

const postgresResponses = {
  stats: { total: 4, active: 1, idle: 3, waiting: 0, utilization: 25 },
  connections: [],
  queryLogs: [],
  config: {
    url: 'postgres://localhost:5432/app',
    maxConnections: 10,
    minConnections: 1,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 5000,
    statementTimeoutMs: 10000,
  },
};

const mockPostgresFetch = () => {
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    const data = url.endsWith('/stats')
      ? postgresResponses.stats
      : url.endsWith('/connections')
        ? postgresResponses.connections
        : url.endsWith('/query-logs')
          ? postgresResponses.queryLogs
          : postgresResponses.config;

    return Promise.resolve({ ok: true, json: async () => data });
  });
};

describe('PostgresManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPostgresFetch();
  });

  it('renders page title', () => {
    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    expect(screen.getByText('PostgreSQL Database')).toBeInTheDocument();
  });

  it('fetches data from multiple endpoints on mount', async () => {
    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/stats');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/connections');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/query-logs');
      expect(global.fetch).toHaveBeenCalledWith('/api/postgres/config');
    });
  });

  it('renders the management sections', () => {
    render(<PostgresManagementPage apiPrefix="/api/postgres" />);

    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Connections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Queries' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Config' })).toBeInTheDocument();
  });
});
