/**
 * AuthError - Error message display component for auth pages
 *
 * Displays error messages with consistent styling
 */

export interface AuthErrorProps {
  message: string;
}

export function AuthError({ message }: AuthErrorProps) {
  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        color: '#c00',
        fontSize: '0.875rem',
        marginBottom: '1rem',
      }}
      role="alert"
    >
      {message}
    </div>
  );
}
