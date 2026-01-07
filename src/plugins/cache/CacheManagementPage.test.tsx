/**
 * CacheManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CacheManagementPage } from './CacheManagementPage';

describe('CacheManagementPage', () => {
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

    render(<CacheManagementPage apiPrefix="/api/cache" />);

    expect(screen.getByText('Redis Cache Management')).toBeInTheDocument();
  });

  it('fetches cache data on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<CacheManagementPage apiPrefix="/api/cache" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/cache/stats');
    });
  });

  it('renders all tabs', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ({}),
      })
    );

    render(<CacheManagementPage apiPrefix="/api/cache" />);

    expect(screen.getByRole('tab', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Keys/i })).toBeInTheDocument();
  });
});
