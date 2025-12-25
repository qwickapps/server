/**
 * AcceptInvitationPage Component
 *
 * Standalone page for users to accept invitations and activate their accounts.
 * Can be used in control panel or frontend applications.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { Text, Button } from '@qwickapps/react-framework';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api, type User } from '../api/controlPanelApi';

export interface AcceptInvitationPageProps {
  /** Invitation token (if not provided, will extract from URL) */
  token?: string;
  /** Title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Success message */
  successMessage?: string;
  /** URL to redirect to after successful activation (optional) */
  redirectUrl?: string;
  /** Label for the redirect button */
  redirectLabel?: string;
  /** Callback when invitation is accepted successfully */
  onSuccess?: (user: User) => void;
  /** Callback when invitation acceptance fails */
  onError?: (error: string) => void;
}

export function AcceptInvitationPage({
  token: tokenProp,
  title = 'Accept Invitation',
  subtitle = 'Activate your account',
  successMessage = 'Your account has been activated successfully!',
  redirectUrl,
  redirectLabel = 'Go to App',
  onSuccess,
  onError,
}: AcceptInvitationPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const acceptInvitation = async () => {
      // Get token from prop or URL query parameter
      let inviteToken = tokenProp;
      if (!inviteToken) {
        const params = new URLSearchParams(window.location.search);
        inviteToken = params.get('token') || '';
      }

      if (!inviteToken) {
        setError('No invitation token provided');
        setLoading(false);
        onError?.('No invitation token provided');
        return;
      }

      try {
        const result = await api.acceptInvitation(inviteToken);
        setUser(result.user);
        setSuccess(true);
        onSuccess?.(result.user);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [tokenProp, onSuccess, onError]);

  const handleRedirect = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--theme-background)',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', bgcolor: 'var(--theme-surface)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Text variant="h4" content={title} customColor="var(--theme-text-primary)" style={{ marginBottom: '8px' }} />
            <Text variant="body2" content={subtitle} customColor="var(--theme-text-secondary)" />
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
              <CircularProgress />
              <Text variant="body2" content="Activating your account..." customColor="var(--theme-text-secondary)" />
            </Box>
          )}

          {error && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <ErrorIcon sx={{ fontSize: 64, color: 'var(--theme-error)' }} />
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
              <Text
                variant="body2"
                content="The invitation may have expired or is invalid. Please contact support."
                customColor="var(--theme-text-secondary)"
                style={{ textAlign: 'center' }}
              />
            </Box>
          )}

          {success && !loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'var(--theme-success)' }} />
              <Alert severity="success" sx={{ width: '100%' }}>
                {successMessage}
              </Alert>

              {user && (
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Text
                    variant="body1"
                    content={`Welcome, ${user.name || user.email}!`}
                    customColor="var(--theme-text-primary)"
                    fontWeight="500"
                    style={{ marginBottom: '4px' }}
                  />
                  <Text
                    variant="body2"
                    content="Your account is now active and ready to use."
                    customColor="var(--theme-text-secondary)"
                  />
                </Box>
              )}

              {redirectUrl && (
                <Button
                  variant="primary"
                  label={redirectLabel}
                  icon="arrow_forward"
                  onClick={handleRedirect}
                  fullWidth
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
