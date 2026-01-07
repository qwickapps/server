/**
 * VerifyEmailPage - Email verification page
 *
 * Displays instructions for email verification
 */

import { AuthLayout } from './shared';

export interface VerifyEmailPageProps {
  /**
   * User's email address
   */
  email?: string;
}

export function VerifyEmailPage({ email }: VerifyEmailPageProps) {
  return (
    <AuthLayout title="Verify Your Email">
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
          {email ? (
            <>
              We&apos;ve sent a verification link to <strong>{email}</strong>
            </>
          ) : (
            "We've sent you a verification link"
          )}
        </p>
        <p style={{ marginBottom: '1.5rem', color: '#666', fontSize: '0.875rem' }}>
          Please check your email and click the link to verify your account.
        </p>
        <a href="/login" style={{ color: '#0066cc', fontSize: '0.875rem' }}>
          Back to login
        </a>
      </div>
    </AuthLayout>
  );
}
