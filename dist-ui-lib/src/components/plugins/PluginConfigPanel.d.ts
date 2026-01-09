/**
 * PluginConfigPanel - Live configuration editor for plugins
 *
 * Provides form-based config editing with validation and real-time updates.
 *
 * @example
 * ```tsx
 * <PluginConfigPanel
 *   title="Rate Limit Configuration"
 *   description="Adjust rate limiting settings"
 *   config={config}
 *   schema={[
 *     { key: 'maxRequests', label: 'Max Requests', type: 'number', min: 1 },
 *     { key: 'windowMs', label: 'Window (ms)', type: 'number', min: 1000 },
 *     { key: 'strategy', label: 'Strategy', type: 'select', options: [...] }
 *   ]}
 *   onSave={handleSave}
 *   onReset={handleReset}
 * />
 * ```
 */
import React from 'react';
export type ConfigFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea';
export interface ConfigField {
    /** Config key */
    key: string;
    /** Display label */
    label: string;
    /** Field type */
    type: ConfigFieldType;
    /** Field description */
    description?: string;
    /** For number type */
    min?: number;
    max?: number;
    step?: number;
    /** For select type */
    options?: Array<{
        value: string | number;
        label: string;
    }>;
    /** Validation */
    required?: boolean;
    pattern?: RegExp;
    validate?: (value: unknown) => string | null;
}
export interface PluginConfigPanelProps {
    /** Panel title */
    title: string;
    /** Optional description */
    description?: string;
    /** Current configuration */
    config: Record<string, unknown>;
    /** Schema defining config fields */
    schema: ConfigField[];
    /** Save handler */
    onSave: (newConfig: Record<string, unknown>) => Promise<void>;
    /** Reset handler */
    onReset: () => void;
    /** Loading state */
    loading?: boolean;
    /** Read-only mode */
    readOnly?: boolean;
}
export declare const PluginConfigPanel: React.FC<PluginConfigPanelProps>;
