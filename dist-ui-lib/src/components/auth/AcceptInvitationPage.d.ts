/**
 * AcceptInvitationPage - User invitation acceptance form
 *
 * Allows invited users to set password and activate their account
 */
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
export declare function AcceptInvitationPage({ apiClient, onSuccess, redirectTo, }: AcceptInvitationPageProps): import("react/jsx-runtime").JSX.Element;
