/**
 * QwickbrainStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QwickbrainStatusWidget } from './QwickbrainStatusWidget';

describe('QwickbrainStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<QwickbrainStatusWidget apiPrefix="/api/qwickbrain" />);

    expect(screen.getByText(/QwickBrain AI Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalDocuments: 5000,
      indexedRepositories: 25,
      queriesToday: 150,
      cacheHitRate: 85,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<QwickbrainStatusWidget apiPrefix="/api/qwickbrain" />);

    await waitFor(() => {
      expect(screen.getByText('QwickBrain AI')).toBeInTheDocument();
      expect(screen.getByText(/Documents: 5000/)).toBeInTheDocument();
      expect(screen.getByText(/Repositories: 25/)).toBeInTheDocument();
      expect(screen.getByText(/Queries Today: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Cache Hit Rate: 85%/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/qwickbrain/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('QwickBrain service error')
    );

    render(<QwickbrainStatusWidget apiPrefix="/api/qwickbrain" />);

    await waitFor(() => {
      expect(screen.getByText(/QwickBrain service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalDocuments: 2000,
      indexedRepositories: 10,
      queriesToday: 50,
      cacheHitRate: 75,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<QwickbrainStatusWidget apiPrefix="/custom/qwickbrain" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/qwickbrain/stats');
    });
  });

  it('displays all QwickBrain metrics correctly', async () => {
    const mockStats = {
      totalDocuments: 10000,
      indexedRepositories: 50,
      queriesToday: 300,
      cacheHitRate: 95,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<QwickbrainStatusWidget apiPrefix="/api/qwickbrain" />);

    await waitFor(() => {
      expect(screen.getByText(/Documents: 10000/)).toBeInTheDocument();
      expect(screen.getByText(/Repositories: 50/)).toBeInTheDocument();
      expect(screen.getByText(/Queries Today: 300/)).toBeInTheDocument();
      expect(screen.getByText(/Cache Hit Rate: 95%/)).toBeInTheDocument();
    });
  });
});
