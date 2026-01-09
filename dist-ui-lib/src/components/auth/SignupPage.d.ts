/**
 * SignupPage - User registration form component
 *
 * Provides name, email, password registration with validation
 */
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
export declare function SignupPage({ onSuccess, redirectTo, showLoginLink, }: SignupPageProps): import("react/jsx-runtime").JSX.Element;
