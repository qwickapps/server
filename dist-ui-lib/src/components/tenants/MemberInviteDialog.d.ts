/**
 * MemberInviteDialog Component
 *
 * Dialog for inviting/adding a member to a tenant.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface MemberInviteDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Tenant name for display */
    tenantName: string;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when form is submitted */
    onSubmit: (data: {
        user_id: string;
        role: string;
    }) => void | Promise<void>;
}
export declare function MemberInviteDialog({ open, tenantName, onClose, onSubmit, }: MemberInviteDialogProps): import("react/jsx-runtime").JSX.Element;
