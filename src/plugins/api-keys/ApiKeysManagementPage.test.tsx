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
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ keys: [] }),
    });
  });

  it('renders page title', () => {
    render(<ApiKeysManagementPage apiPrefix="/api/api-keys" />);

    expect(screen.getByText('API Keys Management')).toBeInTheDocument();
  });

  it('fetches API keys on mount', async () => {
    render(<ApiKeysManagementPage apiPrefix="/api/api-keys" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/api-keys');
    });
  });

  it('uses a custom apiPrefix', async () => {
    render(<ApiKeysManagementPage apiPrefix="/custom/api-keys" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/api-keys');
    });
  });
});
