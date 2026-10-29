/**
 * AuthManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthManagementPage } from './AuthManagementPage';

describe('AuthManagementPage', () => {
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

    render(<AuthManagementPage apiPrefix="/api/auth" />);

    expect(screen.getByText('Authentication Management')).toBeInTheDocument();
  });

  it('does not fetch data until a data tab is selected', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<AuthManagementPage apiPrefix="/api/auth" />);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses the custom apiPrefix when loading providers', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<AuthManagementPage apiPrefix="/custom/auth" />);

    fireEvent.click(screen.getByRole('button', { name: 'Providers' }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/custom/auth/providers');
    });
  });
});
