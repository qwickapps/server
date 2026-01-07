/**
 * ApiKeysStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ApiKeysStatusWidget } from './ApiKeysStatusWidget';

describe('ApiKeysStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ApiKeysStatusWidget apiPrefix="/api/api-keys" />);

    expect(screen.getByText(/API Keys Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalKeys: 100,
      activeKeys: 85,
      expiredKeys: 10,
      revokedKeys: 5,
      recentlyUsed: 45,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ApiKeysStatusWidget apiPrefix="/api/api-keys" />);

    await waitFor(() => {
      expect(screen.getByText('API Keys')).toBeInTheDocument();
      expect(screen.getByText(/Total Keys: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 85/)).toBeInTheDocument();
      expect(screen.getByText(/Expired: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Recently Used: 45/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/api-keys/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('API keys service error')
    );

    render(<ApiKeysStatusWidget apiPrefix="/api/api-keys" />);

    await waitFor(() => {
      expect(screen.getByText(/API keys service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalKeys: 50,
      activeKeys: 40,
      expiredKeys: 5,
      revokedKeys: 5,
      recentlyUsed: 20,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ApiKeysStatusWidget apiPrefix="/custom/api-keys" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/api-keys/stats');
    });
  });

  it('displays all API key metrics correctly', async () => {
    const mockStats = {
      totalKeys: 150,
      activeKeys: 120,
      expiredKeys: 20,
      revokedKeys: 10,
      recentlyUsed: 80,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<ApiKeysStatusWidget apiPrefix="/api/api-keys" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Keys: 150/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 120/)).toBeInTheDocument();
      expect(screen.getByText(/Expired: 20/)).toBeInTheDocument();
      expect(screen.getByText(/Recently Used: 80/)).toBeInTheDocument();
    });
  });
});
