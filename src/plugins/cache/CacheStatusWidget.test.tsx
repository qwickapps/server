/**
 * CacheStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CacheStatusWidget } from './CacheStatusWidget';

describe('CacheStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<CacheStatusWidget apiPrefix="/api/cache" />);

    expect(screen.getByText(/Redis Cache Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      connected: true,
      keyCount: 1500,
      usedMemory: '45MB',
      hitRate: 85,
      missRate: 15,
      opsPerSec: 250,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<CacheStatusWidget apiPrefix="/api/cache" />);

    await waitFor(() => {
      expect(screen.getByText('Redis Cache')).toBeInTheDocument();
      expect(screen.getByText(/Connection: Connected/)).toBeInTheDocument();
      expect(screen.getByText(/Cached Keys: 1500/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/cache/stats');
  });

  it('displays disconnected state', async () => {
    const mockStats = {
      connected: false,
      keyCount: 0,
      usedMemory: '0MB',
      hitRate: 0,
      missRate: 0,
      opsPerSec: 0,
      health: 'error' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<CacheStatusWidget apiPrefix="/api/cache" />);

    await waitFor(() => {
      expect(screen.getByText(/Connection: Disconnected/)).toBeInTheDocument();
    });
  });

  it('displays error state when fetch fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Failed to fetch stats')
    );

    render(<CacheStatusWidget apiPrefix="/api/cache" />);

    await waitFor(() => {
      expect(screen.getByText('Redis Cache')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays all cache metrics', async () => {
    const mockStats = {
      connected: true,
      keyCount: 50000,
      usedMemory: '128MB',
      hitRate: 92,
      missRate: 8,
      opsPerSec: 500,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<CacheStatusWidget apiPrefix="/api/cache" />);

    await waitFor(() => {
      expect(screen.getByText(/Cached Keys: 50000/)).toBeInTheDocument();
      expect(screen.getByText(/Memory Used: 128MB/)).toBeInTheDocument();
      expect(screen.getByText(/Cache Hit Rate: 92/)).toBeInTheDocument();
      expect(screen.getByText(/Operations\/sec: 500/)).toBeInTheDocument();
    });
  });
});
