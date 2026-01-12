/**
 * TenantCard Component
 *
 * Displays tenant information in a card format.
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
export interface TenantCardProps {
    /** Tenant data */
    tenant: Tenant;
    /** Callback when edit is clicked */
    onEdit?: (tenant: Tenant) => void;
    /** Callback when delete is clicked */
    onDelete?: (tenant: Tenant) => void;
    /** Callback when manage members is clicked */
    onManageMembers?: (tenant: Tenant) => void;
    /** Whether to show actions */
    showActions?: boolean;
}
export declare function TenantCard({ tenant, onEdit, onDelete, onManageMembers, showActions, }: TenantCardProps): import("react/jsx-runtime").JSX.Element;
