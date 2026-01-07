/**
 * AcceptInvitationPage - User invitation acceptance form
 *
 * Allows invited users to set password and activate their account
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GridLayout, TextInputField, Button } from '@qwickapps/react-framework';
import { AuthLayout, AuthError } from './shared';

export interface AcceptInvitationPageProps {
  /**
   * Auto-generated API client from qwickapps-server
   */
  apiClient: any;

  /**
   * Callback invoked on successful invitation acceptance
   */
  onSuccess?: (user: any) => void;

  /**
   * Path to redirect to after successful acceptance
   * @default '/login'
   */
  redirectTo?: string;
}

export function AcceptInvitationPage({
  apiClient,
  onSuccess,
  redirectTo = '/login',
}: AcceptInvitationPageProps) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Validate invitation token on mount
    const validateToken = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setInvitationValid(false);
        return;
      }

      try {
        // Token exists and is in correct format
        setInvitationValid(true);
      } catch (err) {
        setError('Invalid or expired invitation');
        setInvitationValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid invitation token');
      return;
    }

    setLoading(true);
    try {
      // Call auto-generated API client
      const result = await apiClient.users.acceptInvitation(token, { password });
      onSuccess?.(result.user);
      navigate(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  };

  if (invitationValid === false) {
    return (
      <AuthLayout title="Invalid Invitation">
        <AuthError message={error || 'This invitation link is invalid or has expired'} />
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#0066cc', fontSize: '0.875rem' }}>
            Go to login
          </a>
        </div>
      </AuthLayout>
    );
  }

  if (invitationValid === null) {
    return (
      <AuthLayout title="Loading...">
        <p style={{ textAlign: 'center', color: '#666' }}>Validating invitation...</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Accept Invitation">
      <form onSubmit={handleSubmit}>
        <GridLayout columns={1} spacing="md">
          {error && <AuthError message={error} />}

          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
            Set your password to activate your account
          </p>

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
            Activate Account
          </Button>
        </GridLayout>
      </form>
    </AuthLayout>
  );
}
