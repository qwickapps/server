/**
 * MemberRoleDialog Component
 *
 * Dialog for changing a member's role.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface TenantMembership {
    id: string;
    tenant_id: string;
    user_id: string;
    role: string;
    joined_at: string;
}
export interface MemberRoleDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Member to edit */
    member: TenantMembership;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when role is changed */
    onSubmit: (role: string) => void | Promise<void>;
}
export declare function MemberRoleDialog({ open, member, onClose, onSubmit, }: MemberRoleDialogProps): import("react/jsx-runtime").JSX.Element;
