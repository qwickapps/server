/**
 * PasswordResetConfirmPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PasswordResetConfirmPage } from '../PasswordResetConfirmPage';
import { vi } from 'vitest';

// Mock the useAuth hook
const mockConfirmPasswordReset = vi.fn();
vi.mock('@qwickapps/auth-client', async () => {
  const actual = await vi.importActual('@qwickapps/auth-client');
  return {
    ...actual,
    useAuth: () => ({
      confirmPasswordReset: mockConfirmPasswordReset,
    }),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderPasswordResetConfirmPage = (props = {}, token = 'reset-token-123') => {
  return render(
    <BrowserRouter initialEntries={[`/reset-password-confirm/${token}`]}>
      <Routes>
        <Route
          path="/reset-password-confirm/:token"
          element={<PasswordResetConfirmPage {...props} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

describe('PasswordResetConfirmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password fields', async () => {
    renderPasswordResetConfirmPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    renderPasswordResetConfirmPage();

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockConfirmPasswordReset).not.toHaveBeenCalled();
  });

  it('calls confirmPasswordReset with token and new password', async () => {
    mockConfirmPasswordReset.mockResolvedValue({});

    renderPasswordResetConfirmPage({}, 'test-reset-token');

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockConfirmPasswordReset).toHaveBeenCalledWith('test-reset-token', 'newpassword123');
    });
  });

  it('navigates to redirectTo on successful reset', async () => {
    mockConfirmPasswordReset.mockResolvedValue({});

    renderPasswordResetConfirmPage({ redirectTo: '/login' });

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('calls onSuccess callback', async () => {
    const onSuccess = vi.fn();
    mockConfirmPasswordReset.mockResolvedValue({});

    renderPasswordResetConfirmPage({ onSuccess });

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays error message on invalid or expired token', async () => {
    mockConfirmPasswordReset.mockRejectedValue(new Error('Invalid or expired reset token'));

    renderPasswordResetConfirmPage();

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired reset token/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    mockConfirmPasswordReset.mockImplementation(() => new Promise(() => {}));

    renderPasswordResetConfirmPage();

    await waitFor(() => screen.getByLabelText(/^new password$/i));

    const passwordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });
});
