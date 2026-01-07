/**
 * PasswordResetConfirmPage - Password reset confirmation form
 *
 * Allows users to set a new password using reset token
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@qwickapps/auth-client';
import { GridLayout, TextInputField, Button } from '@qwickapps/react-framework';
import { AuthLayout, AuthError } from './shared';

export interface PasswordResetConfirmPageProps {
  /**
   * Callback invoked on successful password reset
   */
  onSuccess?: () => void;

  /**
   * Path to redirect to after successful reset
   * @default '/login'
   */
  redirectTo?: string;
}

export function PasswordResetConfirmPage({
  // TODO: Remove these comments when confirmPasswordReset is implemented
  // onSuccess,
  // redirectTo = '/login',
}: PasswordResetConfirmPageProps) {
  const { token } = useParams<{ token: string }>();
  // const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // TODO: Implement confirmPasswordReset in auth-client
  // const { confirmPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement confirmPasswordReset API
      // await confirmPasswordReset(token, password);
      setError('Password reset confirmation not yet implemented');
      // onSuccess?.();
      // navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set New Password">
      <form onSubmit={handleSubmit}>
        <GridLayout columns={1} spacing="md">
          {error && <AuthError message={error} />}

          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
            Enter your new password below.
          </p>

          <TextInputField
            label="New Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            disabled={loading}
            helperText="Minimum 8 characters"
            textFieldProps={{ autoComplete: 'new-password' }}
          />

          <TextInputField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            disabled={loading}
            textFieldProps={{ autoComplete: 'new-password' }}
          />

          <Button type="submit" variant="primary" loading={loading} fullWidth>
            Reset Password
          </Button>
        </GridLayout>
      </form>
    </AuthLayout>
  );
}
