/**
 * VerifyEmailPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { VerifyEmailPage } from '../VerifyEmailPage';

const renderVerifyEmailPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <VerifyEmailPage {...props} />
    </BrowserRouter>
  );
};

describe('VerifyEmailPage', () => {
  it('renders verification message', () => {
    renderVerifyEmailPage();

    expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
    expect(screen.getByText(/we've sent you a verification link/i)).toBeInTheDocument();
  });

  it('displays specific email when provided', () => {
    renderVerifyEmailPage({ email: 'test@example.com' });

    expect(screen.getByText(/test@example\.com/i)).toBeInTheDocument();
  });

  it('shows generic message when email not provided', () => {
    renderVerifyEmailPage();

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    expect(screen.getByText(/we've sent you a verification link/i)).toBeInTheDocument();
  });

  it('shows back to login link', () => {
    renderVerifyEmailPage();

    expect(screen.getByRole('link', { name: /back to login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
  });

  it('includes instructions to check email', () => {
    renderVerifyEmailPage();

    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    expect(screen.getByText(/click the link to verify/i)).toBeInTheDocument();
  });
});
