/**
 * LoginPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { AuthProvider } from '@qwickapps/auth-client';
import { vi } from 'vitest';

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockUseAuth = vi.fn(() => ({
  login: mockLogin,
  user: null,
  loading: false,
}));

vi.mock('@qwickapps/auth-client', async () => {
  const actual = await vi.importActual('@qwickapps/auth-client');
  return {
    ...actual,
    useAuth: () => mockUseAuth(),
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

const renderLoginPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <LoginPage {...props} />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with email and password fields', () => {
    renderLoginPage();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows signup link when showSignupLink is true', () => {
    renderLoginPage({ showSignupLink: true });

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('hides signup link when showSignupLink is false', () => {
    renderLoginPage({ showSignupLink: false });

    expect(screen.queryByText(/don't have an account/i)).not.toBeInTheDocument();
  });

  it('shows password reset link when showPasswordResetLink is true', () => {
    renderLoginPage({ showPasswordResetLink: true });

    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('hides password reset link when showPasswordResetLink is false', () => {
    renderLoginPage({ showPasswordResetLink: false });

    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderLoginPage();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Form should not submit without required fields
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login with email and password on submit', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockLogin.mockResolvedValue(mockUser);

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('navigates to redirectTo on successful login', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockLogin.mockResolvedValue(mockUser);

    renderLoginPage({ redirectTo: '/custom-dashboard' });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/custom-dashboard');
    });
  });

  it('calls onSuccess callback on successful login', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const onSuccess = vi.fn();
    mockLogin.mockResolvedValue(mockUser);

    renderLoginPage({ onSuccess });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockUser);
    });
  });

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('disables form inputs while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });
  });

  it('shows loading state on submit button', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveAttribute('aria-busy', 'true');
    });
  });
});
