/**
 * SignupPage - User registration form component
 *
 * Provides name, email, password registration with validation
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@qwickapps/auth-client';
import { GridLayout, TextInputField, Button } from '@qwickapps/react-framework';
import { AuthLayout, AuthError } from './shared';

export interface SignupPageProps {
  /**
   * Callback invoked on successful registration
   */
  onSuccess?: (user: any) => void;

  /**
   * Path to redirect to after successful registration
   * @default '/verify-email'
   */
  redirectTo?: string;

  /**
   * Whether email verification is required
   * @default true
   */
  requireEmailVerification?: boolean;

  /**
   * Whether to show login link
   * @default true
   */
  showLoginLink?: boolean;
}

export function SignupPage({
  onSuccess,
  redirectTo = '/verify-email',
  showLoginLink = true,
}: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({ email, password, metadata: { name } });
      if (result.error) {
        setError(result.error.message);
      } else {
        onSuccess?.(result.data);
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account">
      <form onSubmit={handleSubmit}>
        <GridLayout columns={1} spacing="md">
          {error && <AuthError message={error} />}

          <TextInputField
            label="Full Name"
            value={name}
            onChange={setName}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'name' }}
          />

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
            helperText="Minimum 8 characters"
            textFieldProps={{ autoComplete: 'new-password' }}
          />

          <TextInputField
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'new-password' }}
          />

          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Create Account
          </Button>

          {showLoginLink && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#0066cc', fontWeight: 500 }}>
                Sign in
              </a>
            </p>
          )}
        </GridLayout>
      </form>
    </AuthLayout>
  );
}
