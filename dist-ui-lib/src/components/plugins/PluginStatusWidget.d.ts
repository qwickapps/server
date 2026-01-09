/**
 * PluginStatusWidget - Template for plugin dashboard widgets
 *
 * Provides consistent layout for plugin status displays on the dashboard.
 * Supports stats, health indicators, and quick actions.
 *
 * @example
 * ```tsx
 * <PluginStatusWidget
 *   title="PostgreSQL"
 *   icon={<DatabaseIcon />}
 *   status="healthy"
 *   stats={[
 *     { label: 'Connections', value: 42, status: 'healthy' },
 *     { label: 'Queries/sec', value: 1250, status: 'info' }
 *   ]}
 *   actions={[
 *     { label: 'View Details', onClick: () => navigate('/postgres') }
 *   ]}
 * />
 * ```
 */
import React from 'react';
import { StatCardProps } from '@qwickapps/react-framework';
export interface PluginStatusWidgetProps {
    /** Plugin name */
    title: string;
    /** Optional icon */
    icon?: React.ReactNode;
    /** Overall plugin status */
    status?: 'healthy' | 'warning' | 'error' | 'disabled';
    /** Overall plugin health (alias for status, for backward compatibility) */
    health?: 'healthy' | 'warning' | 'error' | 'disabled';
    /** Array of stats to display */
    stats?: StatCardProps[];
    /** Quick action buttons */
    actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
    }>;
    /** Optional message or description */
    message?: string;
    /** Loading state */
    loading?: boolean;
    /** Error message */
    error?: string | null;
    /** Path to details page */
    detailsPath?: string;
}
export declare const PluginStatusWidget: React.FC<PluginStatusWidgetProps>;
