/**
 * ParentalManagementPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ParentalManagementPage } from './ParentalManagementPage';

describe('ParentalManagementPage', () => {
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

    render(<ParentalManagementPage apiPrefix="/api/parental" />);

    expect(screen.getByText('Parental Controls Management')).toBeInTheDocument();
  });

  it('fetches parental controls on mount', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () => Promise.resolve({
        ok: true,
        json: async () => ([]),
      })
    );

    render(<ParentalManagementPage apiPrefix="/api/parental" />);

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

    render(<ParentalManagementPage apiPrefix="/custom/parental" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
