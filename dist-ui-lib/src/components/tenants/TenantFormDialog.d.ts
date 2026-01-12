/**
 * TenantFormDialog Component
 *
 * Dialog for creating and editing tenants.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface Tenant {
    id: string;
    name: string;
    type: 'user' | 'organization' | 'group' | 'department';
    owner_id: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface TenantFormDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Tenant to edit (if editing) */
    tenant?: Tenant;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when form is submitted */
    onSubmit: (data: {
        name: string;
        type: string;
        owner_id: string;
        metadata?: Record<string, unknown>;
    }) => void | Promise<void>;
}
export declare function TenantFormDialog({ open, tenant, onClose, onSubmit, }: TenantFormDialogProps): import("react/jsx-runtime").JSX.Element;
