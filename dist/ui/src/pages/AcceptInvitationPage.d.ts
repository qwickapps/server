/**
 * AcceptInvitationPage Component
 *
 * Standalone page for users to accept invitations and activate their accounts.
 * Can be used in control panel or frontend applications.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { type User } from '../api/controlPanelApi';
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
export declare function AcceptInvitationPage({ token: tokenProp, title, subtitle, successMessage, redirectUrl, redirectLabel, onSuccess, onError, }: AcceptInvitationPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=AcceptInvitationPage.d.ts.map