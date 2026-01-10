/**
 * PluginManagementPage - Template for full plugin management pages
 *
 * Provides consistent layout for plugin management with search, filters, and actions.
 *
 * @example
 * ```tsx
 * <PluginManagementPage
 *   title="User Management"
 *   description="Manage user accounts and permissions"
 *   icon={<UsersIcon />}
 *   searchPlaceholder="Search users by email or name..."
 *   onSearch={handleSearch}
 *   actions={[
 *     { label: 'Create User', onClick: handleCreate, variant: 'primary' }
 *   ]}
 * >
 *   <DataTable columns={columns} data={users} />
 * </PluginManagementPage>
 * ```
 */
import React, { ReactNode } from 'react';
export interface PluginManagementPageProps {
    /** Page title */
    title: string;
    /** Optional description */
    description?: string;
    /** Optional icon */
    icon?: ReactNode;
    /** Search bar placeholder */
    searchPlaceholder?: string;
    /** Search handler */
    onSearch?: (query: string) => void;
    /** Page-level action buttons */
    actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
        icon?: ReactNode;
    }>;
    /** Optional filter controls */
    filters?: ReactNode;
    /** Optional tabs for multi-section pages */
    tabs?: Array<{
        id: string;
        label: string;
    }>;
    /** Active tab ID */
    activeTab?: string;
    /** Tab change handler */
    onTabChange?: (tabId: string) => void;
    /** Page content (typically DataTable) */
    children: ReactNode;
    /** Loading state */
    loading?: boolean;
    /** Breadcrumb items */
    breadcrumbs?: Array<{
        label: string;
        href?: string;
    }>;
}
export declare const PluginManagementPage: React.FC<PluginManagementPageProps>;
//# sourceMappingURL=PluginManagementPage.d.ts.map