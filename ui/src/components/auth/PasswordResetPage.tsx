/**
 * PasswordResetPage - Password reset request form
 *
 * Allows users to request a password reset email
 */

import React, { useState } from 'react';
import { useAuth } from '@qwickapps/auth-client';
import { GridLayout, TextInputField, Button } from '@qwickapps/react-framework';
import { AuthLayout, AuthError } from './shared';

export interface PasswordResetPageProps {
  /**
   * Callback invoked on successful password reset request
   */
  onSuccess?: () => void;
}

export function PasswordResetPage({ onSuccess }: PasswordResetPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await resetPassword({ email });
      if (result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check Your Email">
        <div style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <a href="/login" style={{ color: '#0066cc', fontSize: '0.875rem' }}>
            Back to login
          </a>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit}>
        <GridLayout columns={1} spacing="md">
          {error && <AuthError message={error} />}

          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <TextInputField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'email' }}
          />

          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Send Reset Link
          </Button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <a href="/login" style={{ fontSize: '0.875rem', color: '#0066cc' }}>
              Back to login
            </a>
          </div>
        </GridLayout>
      </form>
    </AuthLayout>
  );
}
