/**
 * NotificationsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationsManagementPage } from './NotificationsManagementPage';

describe('NotificationsManagementPage', () => {
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

    render(<NotificationsManagementPage apiPrefix="/api/notifications" />);

    expect(screen.getByText('Notifications Management')).toBeInTheDocument();
  });

  it('fetches notifications and stats on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<NotificationsManagementPage apiPrefix="/api/notifications" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('renders with custom apiPrefix', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<NotificationsManagementPage apiPrefix="/custom/notifications" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
