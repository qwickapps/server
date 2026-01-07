/**
 * SubscriptionsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SubscriptionsManagementPage } from './SubscriptionsManagementPage';

describe('SubscriptionsManagementPage', () => {
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

    render(<SubscriptionsManagementPage apiPrefix="/api/subscriptions" />);

    expect(screen.getByText('Subscriptions Management')).toBeInTheDocument();
  });

  it('fetches subscriptions on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<SubscriptionsManagementPage apiPrefix="/api/subscriptions" />);

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

    render(<SubscriptionsManagementPage apiPrefix="/custom/subscriptions" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
