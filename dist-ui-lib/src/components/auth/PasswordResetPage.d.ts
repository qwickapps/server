/**
 * PasswordResetPage - Password reset request form
 *
 * Allows users to request a password reset email
 */
export interface PasswordResetPageProps {
    /**
     * Callback invoked on successful password reset request
     */
    onSuccess?: () => void;
}
export declare function PasswordResetPage({ onSuccess }: PasswordResetPageProps): import("react/jsx-runtime").JSX.Element;
