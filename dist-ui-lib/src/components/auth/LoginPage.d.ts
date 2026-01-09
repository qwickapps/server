/**
 * LoginPage - User login form component
 *
 * Provides email/password login with integration to auth provider
 */
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
export declare function LoginPage({ onSuccess, redirectTo, showSignupLink, showPasswordResetLink, }: LoginPageProps): import("react/jsx-runtime").JSX.Element;
