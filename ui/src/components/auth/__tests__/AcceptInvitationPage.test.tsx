/**
 * AcceptInvitationPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AcceptInvitationPage } from '../AcceptInvitationPage';
import { vi } from 'vitest';

// Mock API client
const mockAcceptInvitation = vi.fn();
const mockApiClient = {
  users: {
    acceptInvitation: mockAcceptInvitation,
  },
};

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAcceptInvitationPage = (props = {}, token = 'valid-token-123') => {
  return render(
    <BrowserRouter initialEntries={[`/accept-invitation/${token}`]}>
      <Routes>
        <Route
          path="/accept-invitation/:token"
          element={<AcceptInvitationPage apiClient={mockApiClient as any} {...props} />}
        />
      </Routes>
    </BrowserRouter>
  );
};

describe('AcceptInvitationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password fields for invitation acceptance', async () => {
    renderAcceptInvitationPage();

    await waitFor(() => {
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /accept invitation/i })).toBeInTheDocument();
    });
  });

  it('displays error when token is missing', async () => {
    render(
      <BrowserRouter initialEntries={['/accept-invitation/']}>
        <Routes>
          <Route
            path="/accept-invitation/"
            element={<AcceptInvitationPage apiClient={mockApiClient as any} />}
          />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid invitation link/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation match', async () => {
    renderAcceptInvitationPage();

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  it('calls acceptInvitation API with token and password', async () => {
    const mockUser = { id: 'user-123', email: 'invited@example.com' };
    mockAcceptInvitation.mockResolvedValue({ user: mockUser });

    renderAcceptInvitationPage({}, 'test-token-456');

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith('test-token-456', {
        password: 'newpassword123',
      });
    });
  });

  it('navigates to redirectTo on successful acceptance', async () => {
    const mockUser = { id: 'user-123', email: 'invited@example.com' };
    mockAcceptInvitation.mockResolvedValue({ user: mockUser });

    renderAcceptInvitationPage({ redirectTo: '/welcome' });

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/welcome');
    });
  });

  it('calls onSuccess callback with user data', async () => {
    const mockUser = { id: 'user-123', email: 'invited@example.com' };
    const onSuccess = vi.fn();
    mockAcceptInvitation.mockResolvedValue({ user: mockUser });

    renderAcceptInvitationPage({ onSuccess });

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on API failure', async () => {
    mockAcceptInvitation.mockRejectedValue(new Error('Invalid or expired token'));

    renderAcceptInvitationPage();

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
    });
  });

  it('disables form during submission', async () => {
    mockAcceptInvitation.mockImplementation(() => new Promise(() => {}));

    renderAcceptInvitationPage();

    await waitFor(() => screen.getByLabelText(/^password$/i));

    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /accept invitation/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });
});
