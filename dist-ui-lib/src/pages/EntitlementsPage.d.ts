/**
 * EntitlementsPage Component
 *
 * Entitlement catalog management page. Allows viewing and managing available entitlements.
 * Write operations (create, edit, delete) are only available when source is not readonly.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export interface EntitlementsPageProps {
    /** Page title */
    title?: string;
    /** Page subtitle */
    subtitle?: string;
    /** Custom actions to render in the header */
    headerActions?: React.ReactNode;
}
export declare function EntitlementsPage({ title, subtitle, headerActions, }: EntitlementsPageProps): import("react/jsx-runtime").JSX.Element;
