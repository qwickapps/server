/**
 * PasswordResetPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PasswordResetPage } from '../PasswordResetPage';
import { vi } from 'vitest';

// Mock the useAuth hook
const mockResetPassword = vi.fn();
vi.mock('@qwickapps/auth-client', async () => {
  const actual = await vi.importActual('@qwickapps/auth-client');
  return {
    ...actual,
    useAuth: () => ({
      resetPassword: mockResetPassword,
    }),
  };
});

const renderPasswordResetPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <PasswordResetPage {...props} />
    </BrowserRouter>
  );
};

describe('PasswordResetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email input and submit button', () => {
    renderPasswordResetPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    renderPasswordResetPage();

    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
  });

  it('validates email is required', async () => {
    renderPasswordResetPage();

    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    fireEvent.click(submitButton);

    // Form should not submit without email
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword with email on submit', async () => {
    mockResetPassword.mockResolvedValue({});

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows success message after sending reset email', async () => {
    mockResetPassword.mockResolvedValue({});

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/reset link sent/i)).toBeInTheDocument();
      expect(screen.getByText(/user@example\.com/i)).toBeInTheDocument();
    });
  });

  it('hides form after successful submission', async () => {
    mockResetPassword.mockResolvedValue({});

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /send reset link/i })).not.toBeInTheDocument();
    });
  });

  it('calls onSuccess callback after sending email', async () => {
    const onSuccess = vi.fn();
    mockResetPassword.mockResolvedValue({});

    renderPasswordResetPage({ onSuccess });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ email: 'user@example.com' });
    });
  });

  it('displays error message on API failure', async () => {
    mockResetPassword.mockRejectedValue(new Error('Email service unavailable'));

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email service unavailable/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    mockResetPassword.mockImplementation(() => new Promise(() => {}));

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
    });
  });

  it('shows loading state on submit button', async () => {
    mockResetPassword.mockImplementation(() => new Promise(() => {}));

    renderPasswordResetPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
