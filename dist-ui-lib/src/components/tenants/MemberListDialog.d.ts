/**
 * MemberListDialog Component
 *
 * Dialog for viewing and managing tenant members.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface Tenant {
    id: string;
    name: string;
    type: string;
    owner_id: string;
}
export interface TenantMembership {
    id: string;
    tenant_id: string;
    user_id: string;
    role: string;
    joined_at: string;
}
export interface MemberListDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Tenant to show members for */
    tenant: Tenant;
    /** API base URL */
    apiBaseUrl: string;
    /** Callback when dialog is closed */
    onClose: () => void;
}
export declare function MemberListDialog({ open, tenant, apiBaseUrl, onClose, }: MemberListDialogProps): import("react/jsx-runtime").JSX.Element;
