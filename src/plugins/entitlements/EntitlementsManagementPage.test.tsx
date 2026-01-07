/**
 * EntitlementsManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntitlementsManagementPage } from './EntitlementsManagementPage';

describe('EntitlementsManagementPage', () => {
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

    render(<EntitlementsManagementPage apiPrefix="/api/entitlements" />);

    expect(screen.getByText('Entitlements Management')).toBeInTheDocument();
  });

  it('fetches entitlements on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<EntitlementsManagementPage apiPrefix="/api/entitlements" />);

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

    render(<EntitlementsManagementPage apiPrefix="/custom/entitlements" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
