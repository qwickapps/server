/**
 * UsersPage Component
 *
 * Generic user management page that works with Users, Bans, and Entitlements plugins.
 * All features are optional and auto-detected based on available plugins.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { type User, type PluginFeatures } from '../api/controlPanelApi';
export interface UsersPageProps {
    /** Page title */
    title?: string;
    /** Page subtitle */
    subtitle?: string;
    /** Override automatic feature detection */
    features?: Partial<PluginFeatures>;
    /** Custom actions to render in the header */
    headerActions?: React.ReactNode;
    /** Callback when a user is selected */
    onUserSelect?: (user: User) => void;
}
export declare function UsersPage({ title, subtitle, features: featureOverrides, headerActions, onUserSelect, }: UsersPageProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=UsersPage.d.ts.map