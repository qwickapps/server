/**
 * ApiKeysManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ApiKeysManagementPage } from './ApiKeysManagementPage';

describe('ApiKeysManagementPage', () => {
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

    render(<ApiKeysManagementPage apiPrefix="/api/api-keys" />);

    expect(screen.getByText('API Keys Management')).toBeInTheDocument();
  });

  it('fetches API keys on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<ApiKeysManagementPage apiPrefix="/api/api-keys" />);

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

    render(<ApiKeysManagementPage apiPrefix="/custom/api-keys" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
