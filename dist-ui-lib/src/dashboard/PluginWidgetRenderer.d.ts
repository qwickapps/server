/**
 * Plugin Widget Renderer
 *
 * Fetches widget contributions from the server API and renders them using
 * the WidgetComponentRegistry to resolve component names to React components.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
interface PluginWidgetRendererProps {
    /** Only show widgets marked as showByDefault (default: true) */
    defaultOnly?: boolean;
    /** Additional widget IDs to show (beyond showByDefault) */
    additionalWidgetIds?: string[];
}
/**
 * Renders widgets from plugins that have registered them via the server API
 */
export declare function PluginWidgetRenderer({ defaultOnly, additionalWidgetIds, }: PluginWidgetRendererProps): import("react/jsx-runtime").JSX.Element | null;
export {};
