/**
 * PasswordResetConfirmPage - Password reset confirmation form
 *
 * Allows users to set a new password using reset token
 */
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
export declare function PasswordResetConfirmPage({}: PasswordResetConfirmPageProps): import("react/jsx-runtime").JSX.Element;
