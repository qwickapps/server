/**
 * LoginPage - User login form component
 *
 * Provides email/password login with integration to auth provider
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@qwickapps/auth-client';
import { GridLayout, TextInputField, Button } from '@qwickapps/react-framework';
import { AuthLayout, AuthError } from './shared';

export interface LoginPageProps {
  /**
   * Callback invoked on successful login
   */
  onSuccess?: (user: any) => void;

  /**
   * Path to redirect to after successful login
   * @default '/dashboard'
   */
  redirectTo?: string;

  /**
   * Whether to show signup link
   * @default true
   */
  showSignupLink?: boolean;

  /**
   * Whether to show password reset link
   * @default true
   */
  showPasswordResetLink?: boolean;
}

export function LoginPage({
  onSuccess,
  redirectTo = '/dashboard',
  showSignupLink = true,
  showPasswordResetLink = true,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn({ email, password });
      if (result.error) {
        setError(result.error.message);
      } else {
        onSuccess?.(result.data?.user);
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In">
      <form onSubmit={handleSubmit}>
        <GridLayout columns={1} spacing="md">
          {error && <AuthError message={error} />}

          <TextInputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'email' }}
          />

          <TextInputField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'current-password' }}
          />

          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Sign In
          </Button>

          {showPasswordResetLink && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <a href="/reset-password" style={{ fontSize: '0.875rem', color: '#0066cc' }}>
                Forgot password?
              </a>
            </div>
          )}

          {showSignupLink && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <a href="/signup" style={{ color: '#0066cc', fontWeight: 500 }}>
                Sign up
              </a>
            </p>
          )}
        </GridLayout>
      </form>
    </AuthLayout>
  );
}
