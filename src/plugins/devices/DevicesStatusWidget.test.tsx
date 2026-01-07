/**
 * DevicesStatusWidget Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DevicesStatusWidget } from './DevicesStatusWidget';

describe('DevicesStatusWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );

    render(<DevicesStatusWidget apiPrefix="/api/devices" />);

    expect(screen.getByText(/Devices Loading/)).toBeInTheDocument();
  });

  it('fetches and displays stats successfully', async () => {
    const mockStats = {
      totalDevices: 100,
      activeDevices: 85,
      registeredToday: 5,
      pendingApproval: 3,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DevicesStatusWidget apiPrefix="/api/devices" />);

    await waitFor(() => {
      expect(screen.getByText('Devices')).toBeInTheDocument();
      expect(screen.getByText(/Total Devices: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 85/)).toBeInTheDocument();
      expect(screen.getByText(/Registered Today: 5/)).toBeInTheDocument();
      expect(screen.getByText(/Pending Approval: 3/)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/devices/stats');
  });

  it('handles fetch error', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Devices service error')
    );

    render(<DevicesStatusWidget apiPrefix="/api/devices" />);

    await waitFor(() => {
      expect(screen.getByText(/Devices service error/)).toBeInTheDocument();
    });
  });

  it('uses custom apiPrefix', async () => {
    const mockStats = {
      totalDevices: 50,
      activeDevices: 40,
      registeredToday: 2,
      pendingApproval: 1,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DevicesStatusWidget apiPrefix="/custom/devices" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/devices/stats');
    });
  });

  it('displays all device metrics correctly', async () => {
    const mockStats = {
      totalDevices: 200,
      activeDevices: 180,
      registeredToday: 10,
      pendingApproval: 5,
      health: 'healthy' as const,
    };

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<DevicesStatusWidget apiPrefix="/api/devices" />);

    await waitFor(() => {
      expect(screen.getByText(/Total Devices: 200/)).toBeInTheDocument();
      expect(screen.getByText(/Active: 180/)).toBeInTheDocument();
      expect(screen.getByText(/Registered Today: 10/)).toBeInTheDocument();
      expect(screen.getByText(/Pending Approval: 5/)).toBeInTheDocument();
    });
  });
});
